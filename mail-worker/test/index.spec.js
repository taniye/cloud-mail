import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, vi } from 'vitest';
import worker from '../src';

describe('RelayDot frontend routing', () => {
    it.each(['/', '/login', '/assets/relaydot.js'])('serves %s through the assets binding', async (path) => {
        const request = new Request('https://webmail.relaydot.com' + path);
        const fetch = vi.fn(async () => new Response('RelayDot asset', { headers: { 'Content-Type': 'text/html' } }));
        const ctx = createExecutionContext();
        const response = await worker.fetch(request, { assets: { fetch } }, ctx);
        await waitOnExecutionContext(ctx);
        expect(fetch).toHaveBeenCalledWith(request);
        expect(await response.text()).toBe('RelayDot asset');
    });
});
