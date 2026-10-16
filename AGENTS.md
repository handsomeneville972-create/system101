# AGENTS.md — 0.01%SYSTEM

## Commands
- `npm run dev` — dev server; `npm run build` — prod build; `npm run lint` — lint
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. Copy from `.env.example`.

## Rules
- Next.js App Router, TypeScript strict, Tailwind + shadcn/ui, lucide-react icons only.
- Dark UI only: bg #000, card #0A0A0A, border rgba(255,255,255,0.08). Fonts: Geist/Inter.
- Supabase RLS required on every table. Use signed URLs for private files. Never expose service key client-side.
- Stripe: verify webhook signature in route handler. Never trust client price.
- Voting logic: 80% yes of cast votes after 48h OR all members voted early = pass. Leader tie-break. Save dissenter reason.
- Keep files small, minimal words UI copy. Update `.opencode/memory/MEMORY.md` when stack/flow changes.
