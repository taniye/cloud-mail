import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
export default defineWorkersConfig({
    test: { poolOptions: { workers: {
        main: './src/index.js',
        miniflare: {
            compatibilityDate: '2025-03-10',
            d1Databases: ['db'], kvNamespaces: ['kv'], r2Buckets: ['r2'],
            bindings: {
                domain: ['relaydot.com'], admin: 'admin@relaydot.com', private_mode: true,
                setup_secret: 'test-setup-secret', bootstrap_password: 'test-admin-password-32-characters',
                jwt_secret: 'test-jwt-secret-at-least-32-characters', resend_api_key: 'test-only-resend-secret'
            }
        }
    } } }
});
