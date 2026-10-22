# 0.01%SYSTEM — Agent Memory
Slogan: Grow. Audience: aspirational builders, dreamers, goal-oriented community.

## Locked decisions
- Stack: Next.js 16 App Router + TypeScript + Tailwind + shadcn/ui + Supabase (Auth/DB/Storage/Realtime) + Paystack live + Vercel
- Voting: SUPERMAJORITY 80% + 48h timeout (not unanimous veto) for join-requests and Suggy
- Build order: Groups-first (P0 landing/auth/design → P1 Find'em → P2 Suggy → P3 Ebooku → P4 Apps/Donations/De-Course stub)
- Money: Paystack USD (min $2.00). Paid ebook floor $2.99. Platform takes 10% via subaccounts/splits. Donations $5.
- Supabase project ref: geqyrbpdxlqhicoytgrq (prior ref had a typo and never existed). Keys in C:\Users\Neville\.keys (rotated out of repo).
- DonateButton: `<DonateButton surface>` with per-surface visibility toggles in settings (home|ebooku|suggy|apps), reversible not delete.
- UI: dark #000/#0A0A0A, hairline rgba(255,255,255,0.08), Geist/Inter, minimal words, lucide icons, 3-col app shell.

## Current state
- P0 DONE: scaffold (Next 16.4.2/Tailwind v4 in temp, copied), dark system, landing, Navbar/Footer, DonateButton
- P1 DONE: Find'em list/profession/group pages + voting util (80%/48h) + schema
- P2 DONE: Suggy feed, Ebooku list/upload, Apps soon, De-Course soon, Settings toggles, Auth OTP, Paystack donate + webhook
- 2026-10-17: Paystack swapped in (src/lib/paystack.ts), .env.local created, secrets moved out. TODO: add PAYSTACK_SECRET_KEY, apply schema.sql in dashboard, Storage buckets, server actions for votes/uploads, splits payouts, RLS tightening, npm install + build
- 2026-10-17: Find'em wired to real data. `src/proxy.ts` (Next16 proxy replaces middleware; Supabase session refresh + protected /home /groups/new /groups/join /onboarding /settings). `/auth/callback` exchanges code. Email magic-link auth (sign-in/sign-up both `signInWithOtp` + emailRedirectTo). `src/lib/auth.ts` (getUser/requireUser/getProfile), `src/lib/supabase-public.ts` (anon, no-cookie reads), `src/lib/data/groups.ts` (professionCounts/groupsByProfession/groupBySlug/myGroups), `src/lib/actions/{auth,groups}.ts`. Schema: profiles.goals, group_invites table, RPCs settle_join_request / accept_group_invite / join_invite_info, votes update policy. Navbar AuthNav in Suspense. Lint+build green (22 routes).
- 2026-10-17: Suggy end-to-end. Schema: suggies.outcome_reason, suggy_votes update policy, suggy_global_votes table (RLS: read all, insert/update own when published), RPC settle_suggy (80% of members, 48h, leader tie-break, dissenter reason), idx_suggies_group_status. `src/lib/data/suggy.ts` (publishedFeed/trendingSignals/groupSignals), `src/lib/actions/suggy.ts` (createSuggy leader+active only, voteSuggy down needs reason, voteGlobalSuggy), components/suggy/{SuggyCard,SuggyVotePanel,CreateSuggyForm}. /suggy real feed, /groups/[slug] Signals card, /home trending. Lint+build green.
- 2026-10-20: PROD LIVE https://system101.network. Vercel project `prj_16jsuv3jfT6eXR02HSRmSp9ffpkq` (team `team_lvooIWiHEazsdemrPkSn9YrC`, repo github:handsomeneville972-create/system101, branch main, framework=nextjs). Vercel 404 root cause was empty sourceless deployments — fixed with a real git deployment. Env added (all targets): NEXT_PUBLIC_SITE_URL=https://system101.network, PLATFORM_SPLIT_PERCENT=10; Supabase vars come from the Vercel↔Supabase integration. Ref typo corrected everywhere (old `geqyrbdxlqhicoytgrq` = NXDOMAIN); schema already applied to real project (14 tables), sb_publishable/sb_secret keys validated against it.
- 2026-10-20: Supabase auth config set via Management API (new all-permissions PAT): site_url=https://system101.network; uri_allow_list=https://system101.network/auth/callback,https://www.system101.network/auth/callback,http://localhost:3000/auth/callback,https://*-*.vercel.app/auth/callback. external_email_enabled=true, mailer_autoconfirm=false.
- 2026-10-20: Smoke test D1+D2 PASSED end-to-end on prod project (test data then deleted). Verified: admin user create + magiclink verify; profile auto-created by trigger; group insert; leader member; invites; invite accept + group activation on 2nd accept; suggy leader-only insert (non-leader 403 RLS); suggy votes; global vote blocked pre-publish (403) + allowed post-publish; settle_suggy→published; join_request + votes + settle_join_request→approved; cleanup removed all test rows (suggies/join_requests/votes = 0).
- 2026-10-20: Setup tokens at C:\Users\Neville\.keys\system101-setup-tokens.txt (VERCEL_TOKEN + SUPABASE_PAT, all-perms superseded). A loose copy was moved out of the repo root.
- 2026-10-22: P3 Ebooku DONE + DEPLOYED (abd3271, dpl_BPt8GrQ3zGvMwSsrxSxML6to6QxR): schema §7 applied via Management API (profiles.donate_surfaces, notify_requests, private buckets ebook-files/ebook-covers + own-folder storage policies). Signed upload flow (`prepareUpload` → `uploadToSignedUrl` → `createEbook` validating path/size/mime/price), list + filters, detail with reviews, 302 download route, `POST /api/checkout/ebook`, webhook persists payments/donations idempotently by `reference` with HMAC + amount/currency checks, owner soft-delete, settings persistence, notify capture (apps/decourse), donate gating per surface, home "New ebooks". Lint 0 errors (2 `<img>` warnings by design), build green (30 routes). Prod smoke: /ebooku 200, /apps 200, /decourse 200, upload+settings+home 307→sign-in, checkout unauth 401, missing download 404. Storage e2e (service key): buckets private, upload→list(10B)→sign→fetch 200→delete ok, cover signable.

## Still TODO
- Paystack USD not activated yet (live account, approval pending). Keys still absent: PAYSTACK_SECRET_KEY + NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY → Vercel env + .env.local + webhook URL https://system101.network/api/webhooks/paystack + redeploy. Paid checkout is built but cannot be live-tested until then.
- Seller 90% payout ledger/UI (manual for now); Paystack subaccount/split wiring after USD activation.
- Rotate Supabase secret key (sb_secret_… seen in chat/keys file) → update Vercel SUPABASE_SERVICE_ROLE_KEY + .env.local
- Revoke setup tokens (C:\Users\Neville\.keys\system101-setup-tokens.txt) after setup
- Custom SMTP for magic links (built-in ~2 emails/hr)

## Conventions
- Run: npm run dev / build / lint. Node 24, npm 11.
- Supabase RLS on all tables. Signed URLs for ebooks. No public buckets.
- Paystack webhooks verify HMAC-SHA512 raw body. Never commit .env.local.
- Secrets: `0.01SYSTEM-supabase-keys.txt` lives in C:\Users\Neville\.keys (outside repo). Paid ebook floor $2.99 USD.
