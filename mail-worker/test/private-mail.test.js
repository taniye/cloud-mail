import { describe, it, expect } from 'vitest';
import { SELF, env } from 'cloudflare:test';
import loginService from '../src/service/login-service';

describe('RelayDot private mailbox', () => {
    it('rejects both ordinary and OAuth registration before provisioning', async () => {
        for (const oauth of [false, true]) {
            await expect(loginService.register({ env }, {}, oauth)).rejects.toMatchObject({ code: 403 });
        }
        const response = await SELF.fetch('https://webmail.relaydot.com/api/register', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'outsider@relaydot.com', password: 'test-password' })
        });
        expect((await response.json()).code).toBe(403);
    });
    it('requires a setup header and removes the old URL-based setup', async () => {
        expect((await SELF.fetch('https://webmail.relaydot.com/api/init', { method: 'POST' })).status).toBe(401);
        expect((await SELF.fetch('https://webmail.relaydot.com/api/init/test-jwt-secret')).status).toBe(404);
    });
    it('provisions an administrator, hides secrets, and keeps registration closed', async () => {
        const setup = await SELF.fetch('https://webmail.relaydot.com/api/init', {
            method: 'POST', headers: { Authorization: 'Bearer test-setup-secret' }
        });
        expect(await setup.text()).toBe('success');
        const response = await SELF.fetch('https://webmail.relaydot.com/api/setting/websiteConfig');
        const config = await response.json();
        expect(config.data).toMatchObject({ title: 'RelayDot', register: 1, githubSwitch: 1, googleSwitch: 1, linuxdoSwitch: 1 });
        expect(JSON.stringify(config)).not.toContain('test-only-resend-secret');
        const login = await SELF.fetch('https://webmail.relaydot.com/api/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@relaydot.com', password: 'test-admin-password-32-characters' })
        });
        expect((await login.json()).data.token).toBeTruthy();
        const secondSetup = await SELF.fetch('https://webmail.relaydot.com/api/init', {
            method: 'POST', headers: { Authorization: 'Bearer test-setup-secret' }
        });
        expect(await secondSetup.text()).toBe('success');
        const count = await env.db.prepare('SELECT COUNT(*) AS n FROM user WHERE email = ?').bind('admin@relaydot.com').first();
        expect(count.n).toBe(1);
    });
});
