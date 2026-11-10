import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { initTransaction } from "@/lib/paystack";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { parseJson, readBody, tooManyRequests } from "@/lib/http";
import { logSlow } from "@/lib/monitoring";

const APP_LISTING_FEE_CENTS = Number(process.env.APP_LISTING_FEE_CENTS ?? 499);
const MAX_BODY_BYTES = 8 * 1024;
const NO_STORE = { "Cache-Control": "no-store" };

export const maxDuration = 30;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function POST(req: Request) {
  const started = performance.now();

  const user = await getUser();
  if (!user) return json({ error: "Sign in required" }, 401);

  const limited = rateLimit(`checkout:${user.id}`, RATE_LIMITS.checkout);
  if (!limited.ok) return tooManyRequests(limited);

  const raw = await readBody(req, MAX_BODY_BYTES);
  if (raw === null) return json({ error: "Payload too large" }, 413);

  const body = parseJson<{ app_id?: unknown }>(raw);
  const appId = String(body?.app_id ?? "");
  if (!appId) return json({ error: "Missing app" }, 400);

  const admin = supabaseAdmin();
  const { data: app } = await admin
    .from("apps")
    .select("id,status,uploader_id,title")
    .eq("id", appId)
    .maybeSingle();

  if (!app) return json({ error: "App not found" }, 404);
  if (app.status !== "draft") {
    return json({ error: "Listing is not a draft" }, 400);
  }
  if (app.uploader_id !== user.id) {
    return json({ error: "Not your listing" }, 400);
  }
  if (!user.email) {
    return json({ error: "Account has no email" }, 400);
  }

  const { data: owned } = await admin
    .from("payments")
    .select("id")
    .eq("app_id", appId)
    .eq("buyer_id", user.id)
    .eq("status", "success")
    .maybeSingle();
  if (owned) {
    return json({ error: "Listing already published" }, 409);
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
    return json({ error: "Checkout already started" }, 409);
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
    platform_fee_cents: APP_LISTING_FEE_CENTS,
  });
  if (pendingError) {
    return json({ error: "Could not start checkout" }, 500);
  }

  try {
    const data = await initTransaction({
      email: user.email,
      amountUsd: APP_LISTING_FEE_CENTS / 100,
      amountCents: APP_LISTING_FEE_CENTS,
      reference,
      callbackUrl: `${site}/apps/publish/success`,
      metadata: {
        kind: "app_listing",
        app_id: appId,
        buyer_id: user.id,
        uploader_id: app.uploader_id,
      },
    });
    logSlow("checkout.app", started);
    return json({ url: data.authorization_url, reference: data.reference });
  } catch (e) {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return json({ error: (e as Error).message }, 500);
  }
}
