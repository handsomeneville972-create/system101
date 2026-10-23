# Deploy & environment setup

Project: **0.01%SYSTEM** · prod domain: **https://system101.network** · Supabase project ref: `geqyrbpdxlqhicoytgrq`

## 1. Supabase — apply schema

Supabase Dashboard → SQL Editor → paste all of `supabase/schema.sql` → Run. It is idempotent and ordered tables → helpers → RLS → trigger → RPCs → indexes.

Verify:

```sql
select table_name from information_schema.tables where table_schema = 'public' order by 1;
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' order by 1;
```

Expect 16 tables and 16 functions.

## 2. Supabase — Authentication URLs

Dashboard → Authentication → URL Configuration:

| Field | Value |
|---|---|
| Site URL | `https://system101.network` |
| Redirect URLs | `https://system101.network/auth/callback` |
| | `https://www.system101.network/auth/callback` (if `www` is used) |
| | `http://localhost:3000/auth/callback` |
| | `https://*-*.vercel.app/auth/callback` (optional, preview deploys) |

Magic links redirect to `/auth/callback`; a `next` parameter is added only when a protected route sent the user to sign-in. The callback sends completed profiles to `/home` and new users to `/onboarding`. If the origin is not allowlisted, Supabase falls back to the Site URL and the user lands with no session.

**Custom SMTP is required for real use** — the built-in sender is rate-limited to ~2 emails/hour. Set it under Authentication → Email → SMTP Settings.

## 3. Vercel — environment variables

Settings → Environment Variables, for **Production** and **Preview**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://geqyrbpdxlqhicoytgrq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | secret key (`sb_secret_...`) — server only |
| `PAYSTACK_SECRET_KEY` | `sk_...` — server only |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_...` |
| `NEXT_PUBLIC_SITE_URL` | `https://system101.network` |
| `PLATFORM_SPLIT_PERCENT` | `10` |
| `APP_LISTING_FEE_CENTS` | `499` ($4.99 developer-paid app listing fee) |
| `DONATION_EMAIL` | optional, fallback `support@001system.dev` |

Rules:
- Never prefix `SUPABASE_SERVICE_ROLE_KEY` or `PAYSTACK_SECRET_KEY` with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_*` values are inlined at build time — redeploy after any change.
- Keep one canonical origin (apex vs `www`) across the domain setting, the Supabase allowlist, and `NEXT_PUBLIC_SITE_URL`.

## 4. Paystack

- Settings → API & Webhooks → Webhook URL: `https://system101.network/api/webhooks/paystack`
- Confirm USD is enabled on the account (min charge $2.00, paid ebook floor $2.99).
- Webhooks cannot reach localhost; use a tunnel (e.g. ngrok) for local testing.
- Ebook checkout creates a pending `payments` row with a server-generated reference before Paystack init. `charge.success` trusts only that row/reference/amount/currency (not metadata ids); duplicates are idempotent, `charge.failed` marks failed, refund events mark `refunded`. Donations go to `donations` after a USD amount >= $2 check.
- Paid ebook checkout needs `PAYSTACK_SECRET_KEY` + USD enabled; until then the Buy button returns a checkout error.

## 5. Verification checklist

1. `/auth/sign-up` → email arrives → link lands on `/auth/callback` → `/onboarding` → `/home` shows your name.
2. Create a group at `/groups/new`; copy invite link; second account accepts it → group becomes `active`.
3. Join request → members vote yes → applicant becomes a member (80% + 48h + leader tie-break).
4. Leader posts a signal; members vote → appears on `/suggy`.
5. `/ebooku/upload` → signed uploads land in the private buckets → book appears on `/ebooku`; free download works; paid book shows Buy (checkout only once Paystack keys/USD are live).
6. `/u/<id>` shows a public profile; settings avatar upload/save/remove works; member names on a group page open profiles.
7. Leader can edit group name/rules, remove a member, and transfer leadership; non-leaders can leave. A denied applicant sees the reason + retry date and cannot re-request for 7 days.
8. `/decourse/upload` → YouTube/Vimeo link + optional PDF notes → course appears on `/decourse`; the detail page embeds the player and the notes download redirects to a signed URL. Free course uploads work now; the $5 paid tier is not built.
9. Trust flows: direct self-join is denied; join request appears only while pending and can be canceled; one vote of two stays pending; members can leave and the group shrinks; invites are single-use and the group activates only after 2 distinct members join; leader cannot consume an own invite; returning magic-link sign-in goes straight to `/home`; a paid buyer can still download a removed book.
10. `/apps/publish` → icon + optional screenshots + optional developer bio → draft listing → `/apps/publish/checkout/<id>` → Paystack $4.99 → webhook flips the listing to `published` → appears on `/apps`; `/apps/<id>` shows bio, screenshots and external Visit link. Direct DB writes cannot publish a listing (trigger forces `draft`).

## 6. Troubleshooting

- Login "does nothing" → redirect URL not in the allowlist (exact string, no trailing slash) or `www`/apex mismatch.
- `Invalid API key` → `@supabase/ssr` older than `^0.7` predates publishable-key support; upgrade it and `@supabase/supabase-js`, then redeploy.
- Domain returns `X-Vercel-Error: NOT_FOUND` → no production deployment attached, or the domain is not assigned to the project (Vercel → Settings → Domains).
- Rotate the Supabase secret key if it was ever committed; update `SUPABASE_SERVICE_ROLE_KEY` in Vercel and `.env.local` afterwards.
