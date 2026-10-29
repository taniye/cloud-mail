# RelayDot deployment

RelayDot is a private, administrator-provisioned mailbox at https://webmail.relaydot.com, based on Cloud Mail. The original MIT license and Copyright (c) 2025 aslost are preserved in LICENSE. Public registration, including OAuth account creation, is disabled by default on the server.

## Build and test

Use Node.js 24 and pnpm. From the repository root:

```sh
pnpm --dir mail-vue install --frozen-lockfile
pnpm --dir mail-worker install --frozen-lockfile
pnpm --dir mail-worker test
pnpm --dir mail-vue run build
cd mail-worker
pnpm exec wrangler deploy --dry-run --config wrangler.relaydot.toml
```

The test command runs tests. The upstream deploy-to-test command is now named `deploy:test`.

## Production configuration

Use `mail-worker/wrangler.relaydot.toml`, not the upstream default configuration. The target account is 0250213eb1a8a6d4d608db64c2222f17. Bindings are `db` (D1 relaydot-db), `kv` (relaydot-kv), `r2` (relaydot-files), `assets`, and `ai`.

Set `jwt_secret` and `resend_api_key` as encrypted Worker secrets. The Resend key overrides database-configured keys for the configured email domains. Never store these values in Git, frontend environment variables, or GitHub Actions variables. Local `.dev.vars` and `deploy-private/` are ignored.

For first-time setup only, add `setup_secret` and `bootstrap_password` as Worker secrets. The bootstrap password must contain at least 16 characters. Make an authenticated POST to `/api/init` using an `Authorization: Bearer <setup_secret>` header. This migrates the schema and provisions admin@relaydot.com if absent; it does not reset an existing administrator password. Remove both setup secrets after successful setup. The upstream GET endpoint containing a JWT secret in the URL has been removed.

After building, deploy with:

```sh
pnpm exec wrangler deploy --config wrangler.relaydot.toml
```

Attach webmail.relaydot.com as the Worker custom domain. Enable Cloudflare Email Routing, preserving the existing Resend DNS records, and set the catch-all action to Worker `relaydot`. The Worker stores messages only for configured accounts. Create invited members from the administrator user-management screen.

## Verification

Check the branded login page, successful administrator login, rejected public registration, absence of secrets in `/api/setting/websiteConfig`, and disabled setup endpoint. Verify one inbound message, one outbound message, and attachment upload/download. The site intentionally sends noindex directives because it is a private mailbox.

Configure a Resend status webhook to `https://webmail.relaydot.com/api/webhooks` only after reviewing the upstream webhook authentication behavior. It is optional for mail sending and is not provisioned automatically.

## Upstream documentation

- https://docs.skymail.ink/deployment/command.html
- https://docs.skymail.ink/sending/resend.html
- https://docs.skymail.ink/system/object-storage.html

The upstream docs use URL-based initialization and a different cron example; this fork uses authenticated POST setup and the repository's hourly cron. Do not apply the upstream initialization URL to this fork.

## Deployment verification record

Deployed on 2026-10-29 to the tankyear Cloudflare account. The custom domain https://webmail.relaydot.com serves Worker `relaydot`. The apex relaydot.com is used as the email domain, not as the mailbox website.

Production administrator login succeeded. Public registration returned application code 403. Setup returned HTTP 401 after the bootstrap secrets were removed. Only `jwt_secret` and `resend_api_key` remain as Worker secrets.

A single verification message sent through Resend to admin@relaydot.com arrived through Cloudflare Email Routing and was stored in D1; its text attachment was stored in R2 and downloaded successfully. Resend status webhooks have not been enabled; sending works without them, but delivery status tracking remains an optional follow-up.
