import { NextResponse } from "next/server";
import { initTransaction } from "@/lib/paystack";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const surface = String(body.surface ?? "home");
  const amountUsd = Math.max(2, Number(body.amountUsd ?? 5));
  const email = String(body.email ?? process.env.DONATION_EMAIL ?? "support@001system.dev");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const data = await initTransaction({
      email,
      amountUsd,
      callbackUrl: `${site}/${surface}?donated=1`,
      metadata: { surface, kind: "donation", cancel_url: `${site}/${surface}?donated=0` },
    });
    return NextResponse.json({ url: data.authorization_url, reference: data.reference });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
