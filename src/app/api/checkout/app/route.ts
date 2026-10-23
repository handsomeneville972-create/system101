import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { initTransaction } from "@/lib/paystack";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const APP_LISTING_FEE_CENTS = Number(process.env.APP_LISTING_FEE_CENTS ?? 499);

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const appId = String(body.app_id ?? "");
  if (!appId) return NextResponse.json({ error: "Missing app" }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: app } = await admin
    .from("apps")
    .select("id,status,uploader_id,title")
    .eq("id", appId)
    .maybeSingle();

  if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });
  if (app.status !== "draft") {
    return NextResponse.json({ error: "Listing is not a draft" }, { status: 400 });
  }
  if (app.uploader_id !== user.id) {
    return NextResponse.json({ error: "Not your listing" }, { status: 400 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "Account has no email" }, { status: 400 });
  }

  const { data: owned } = await admin
    .from("payments")
    .select("id")
    .eq("app_id", appId)
    .eq("buyer_id", user.id)
    .eq("status", "success")
    .maybeSingle();
  if (owned) {
    return NextResponse.json({ error: "Listing already published" }, { status: 409 });
  }

  const recentCutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: openPending } = await admin
    .from("payments")
    .select("id")
    .eq("app_id", appId)
    .eq("buyer_id", user.id)
    .eq("status", "pending")
    .gt("created_at", recentCutoff)
    .maybeSingle();
  if (openPending) {
    return NextResponse.json({ error: "Checkout already started" }, { status: 409 });
  }

  const reference = `app_${randomUUID().replace(/-/g, "")}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await admin
    .from("payments")
    .update({ status: "failed" })
    .eq("app_id", appId)
    .eq("buyer_id", user.id)
    .eq("status", "pending")
    .lt("created_at", recentCutoff);

  const { error: pendingError } = await admin.from("payments").insert({
    reference,
    app_id: appId,
    buyer_id: user.id,
    amount_cents: APP_LISTING_FEE_CENTS,
    currency: "USD",
    status: "pending",
  });
  if (pendingError) {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }

  try {
    const data = await initTransaction({
      email: user.email,
      amountUsd: APP_LISTING_FEE_CENTS / 100,
      amountCents: APP_LISTING_FEE_CENTS,
      reference,
      callbackUrl: `${site}/apps/publish/success?app_id=${appId}`,
      metadata: {
        kind: "app_listing",
        app_id: appId,
        buyer_id: user.id,
        uploader_id: app.uploader_id,
      },
    });
    return NextResponse.json({ url: data.authorization_url, reference: data.reference });
  } catch (e) {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
