# Deploy & environment setup

Project: **0.01%SYSTEM** · prod domain: **https://system101.network** · Supabase project ref: `geqyrbdxlqhicoytgrq`

## 1. Supabase — apply schema

Supabase Dashboard → SQL Editor → paste all of `supabase/schema.sql` → Run. It is idempotent and ordered tables → helpers → RLS → trigger → RPCs → indexes.

Verify:

```sql
select table_name from information_schema.tables where table_schema = 'public' order by 1;
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' order by 1;
```

Expect 14 tables and 7 functions.

## 2. Supabase — Authentication URLs

Dashboard → Authentication → URL Configuration:

| Field | Value |
|---|---|
| Site URL | `https://system101.network` |
| Redirect URLs | `https://system101.network/auth/callback` |
| | `https://www.system101.network/auth/callback` (if `www` is used) |
| | `http://localhost:3000/auth/callback` |
| | `https://*-*.vercel.app/auth/callback` (optional, preview deploys) |

Magic links are built as `${origin}/auth/callback?next=...` in `src/app/auth/sign-in/page.tsx`. If the origin is not allowlisted, Supabase falls back to the Site URL and the user lands with no session.

**Custom SMTP is required for real use** — the built-in sender is rate-limited to ~2 emails/hour. Set it under Authentication → Email → SMTP Settings.

## 3. Vercel — environment variables

Settings → Environment Variables, for **Production** and **Preview**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://geqyrbdxlqhicoytgrq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | secret key (`sb_secret_...`) — server only |
| `PAYSTACK_SECRET_KEY` | `sk_...` — server only |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_...` |
| `NEXT_PUBLIC_SITE_URL` | `https://system101.network` |
| `PLATFORM_SPLIT_PERCENT` | `10` |
| `DONATION_EMAIL` | optional, fallback `support@001system.dev` |

Rules:
- Never prefix `SUPABASE_SERVICE_ROLE_KEY` or `PAYSTACK_SECRET_KEY` with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_*` values are inlined at build time — redeploy after any change.
- Keep one canonical origin (apex vs `www`) across the domain setting, the Supabase allowlist, and `NEXT_PUBLIC_SITE_URL`.

## 4. Paystack

- Settings → API & Webhooks → Webhook URL: `https://system101.network/api/webhooks/paystack`
- Confirm USD is enabled on the account (min charge $2.00, paid ebook floor $2.99).
- Webhooks cannot reach localhost; use a tunnel (e.g. ngrok) for local testing.

## 5. Verification checklist

1. `/auth/sign-up` → email arrives → link lands on `/auth/callback` → `/onboarding` → `/home` shows your name.
2. Create a group at `/groups/new`; copy invite link; second account accepts it → group becomes `active`.
3. Join request → members vote yes → applicant becomes a member (80% + 48h + leader tie-break).
4. Leader posts a signal; members vote → appears on `/suggy`.

## 6. Troubleshooting

- Login "does nothing" → redirect URL not in the allowlist (exact string, no trailing slash) or `www`/apex mismatch.
- `Invalid API key` → `@supabase/ssr` older than `^0.7` predates publishable-key support; upgrade it and `@supabase/supabase-js`, then redeploy.
- Domain returns `X-Vercel-Error: NOT_FOUND` → no production deployment attached, or the domain is not assigned to the project (Vercel → Settings → Domains).
- Rotate the Supabase secret key if it was ever committed; update `SUPABASE_SERVICE_ROLE_KEY` in Vercel and `.env.local` afterwards.
