# AGENTS.md — De\`System

## Commands
- `npm run dev` — dev server; `npm run build` — prod build; `npm run lint` — lint
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`. Copy from `.env.example`.

## Rules
- Next.js App Router, TypeScript strict, Tailwind + shadcn/ui, lucide-react icons only.
- Dark UI only: bg #000, card #0A0A0A, border rgba(255,255,255,0.08). Fonts: Geist/Inter.
- Supabase RLS required on every table. Use signed URLs for private files. Never expose service key client-side.
- Paystack: verify webhook via HMAC-SHA512 of raw body (`x-paystack-signature`). Never trust client price. USD min $2.00; paid ebook floor $2.99. Author payouts via subaccounts/splits (platform 10%).
- Voting logic: 80% yes of cast votes after 48h OR all members voted early = pass. Leader tie-break. Save dissenter reason.
- Keep files small, minimal words UI copy. Update `.opencode/memory/MEMORY.md` when stack/flow changes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
