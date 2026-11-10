import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { initTransaction } from "@/lib/paystack";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { parseJson, readBody, tooManyRequests } from "@/lib/http";
import { logSlow } from "@/lib/monitoring";

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

  const body = parseJson<{ ebook_id?: unknown }>(raw);
  const ebookId = String(body?.ebook_id ?? "");
  if (!ebookId) return json({ error: "Missing book" }, 400);

  const admin = supabaseAdmin();
  const { data: ebook } = await admin
    .from("ebooks")
    .select("id,price_cents,currency,status,uploader_id,subaccount_code")
    .eq("id", ebookId)
    .maybeSingle();

  if (!ebook || ebook.status !== "published") {
    return json({ error: "Book not found" }, 404);
  }
  if (ebook.price_cents <= 0) {
    return json({ error: "This book is free" }, 400);
  }
  if (ebook.uploader_id === user.id) {
    return json({ error: "You uploaded this book" }, 400);
  }
  if (!user.email) {
    return json({ error: "Account has no email" }, 400);
  }

  const { data: owned } = await admin
    .from("payments")
    .select("id")
    .eq("ebook_id", ebookId)
    .eq("buyer_id", user.id)
    .eq("status", "success")
    .maybeSingle();
  if (owned) return json({ error: "You already own this book" }, 409);

  const recentCutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: openPending } = await admin
    .from("payments")
    .select("id")
    .eq("ebook_id", ebookId)
    .eq("buyer_id", user.id)
    .eq("status", "pending")
    .gt("created_at", recentCutoff)
    .maybeSingle();
  if (openPending) {
    return json({ error: "Checkout already started" }, 409);
  }

  const reference = `ebo_${randomUUID().replace(/-/g, "")}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const feePercent = Number(process.env.PLATFORM_SPLIT_PERCENT ?? 10);

  await admin
    .from("payments")
    .update({ status: "failed" })
    .eq("ebook_id", ebookId)
    .eq("buyer_id", user.id)
    .eq("status", "pending")
    .lt("created_at", recentCutoff);

  const { error: pendingError } = await admin.from("payments").insert({
    reference,
    ebook_id: ebookId,
    buyer_id: user.id,
    amount_cents: ebook.price_cents,
    currency: "USD",
    status: "pending",
    platform_fee_cents: Math.round((ebook.price_cents * feePercent) / 100),
  });
  if (pendingError) {
    return json({ error: "Could not start checkout" }, 500);
  }

  try {
    const data = await initTransaction({
      email: user.email,
      amountUsd: ebook.price_cents / 100,
      amountCents: ebook.price_cents,
      reference,
      callbackUrl: `${site}/ebooku/${ebook.id}`,
      subaccount: ebook.subaccount_code ?? undefined,
      metadata: {
        kind: "ebook",
        ebook_id: ebook.id,
        buyer_id: user.id,
        uploader_id: ebook.uploader_id,
        platform_fee_percent: feePercent,
      },
    });
    logSlow("checkout.ebook", started);
    return json({ url: data.authorization_url, reference: data.reference });
  } catch (e) {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return json({ error: (e as Error).message }, 500);
  }
}
