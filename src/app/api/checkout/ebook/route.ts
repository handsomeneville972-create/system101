import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { initTransaction } from "@/lib/paystack";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ebookId = String(body.ebook_id ?? "");
  if (!ebookId) return NextResponse.json({ error: "Missing book" }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: ebook } = await admin
    .from("ebooks")
    .select("id,price_cents,currency,status,uploader_id,subaccount_code")
    .eq("id", ebookId)
    .maybeSingle();

  if (!ebook || ebook.status !== "published") {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (ebook.price_cents <= 0) {
    return NextResponse.json({ error: "This book is free" }, { status: 400 });
  }
  if (ebook.uploader_id === user.id) {
    return NextResponse.json({ error: "You uploaded this book" }, { status: 400 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "Account has no email" }, { status: 400 });
  }

  const { data: owned } = await admin
    .from("payments")
    .select("id")
    .eq("ebook_id", ebookId)
    .eq("buyer_id", user.id)
    .eq("status", "success")
    .maybeSingle();
  if (owned) return NextResponse.json({ error: "You already own this book" }, { status: 409 });

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
    return NextResponse.json({ error: "Checkout already started" }, { status: 409 });
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
  });
  if (pendingError) {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }

  try {
    const data = await initTransaction({
      email: user.email,
      amountUsd: ebook.price_cents / 100,
      amountCents: ebook.price_cents,
      reference,
      callbackUrl: `${site}/ebooku/${ebook.id}?bought=1`,
      subaccount: ebook.subaccount_code ?? undefined,
      metadata: {
        kind: "ebook",
        ebook_id: ebook.id,
        buyer_id: user.id,
        uploader_id: ebook.uploader_id,
        platform_fee_percent: feePercent,
      },
    });
    return NextResponse.json({ url: data.authorization_url, reference: data.reference });
  } catch (e) {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
