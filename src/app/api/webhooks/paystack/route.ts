import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ChargeData = {
  reference?: string;
  amount?: number;
  currency?: string;
  customer?: { email?: string };
  metadata?: Record<string, unknown>;
  transaction?: { reference?: string };
  transaction_reference?: string;
};

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: ChargeData };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const d = event.data ?? {};
  const reference = String(d.reference ?? "");

  switch (event.event) {
    case "charge.success": {
      const amount = Number(d.amount ?? 0);
      const currency = String(d.currency ?? "");

      const { data: payment, error: payError } = await admin
        .from("payments")
        .select("id,amount_cents,currency,status")
        .eq("reference", reference)
        .maybeSingle();
      if (payError) return NextResponse.json({ error: "Database error" }, { status: 500 });

      if (payment) {
        if (payment.status === "success") break;
        if (payment.status !== "pending") break;
        if (
          currency !== "USD" ||
          currency !== payment.currency ||
          amount !== payment.amount_cents
        ) {
          break;
        }
        const { error } = await admin
          .from("payments")
          .update({ status: "success" })
          .eq("id", payment.id)
          .eq("status", "pending");
        if (error) {
          if (error.code === "23505") {
            await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
            break;
          }
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
        break;
      }

      const meta = d.metadata ?? {};
      if (String(meta.kind ?? "") === "donation") {
        if (!reference || currency !== "USD" || amount < 200) break;
        const { error } = await admin.from("donations").upsert(
          {
            reference,
            amount_cents: amount,
            currency,
            surface: String(meta.surface ?? "home"),
            email: String(d.customer?.email ?? ""),
          },
          { onConflict: "reference" }
        );
        if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
      break;
    }
    case "charge.failed": {
      if (!reference) break;
      const { error } = await admin
        .from("payments")
        .update({ status: "failed" })
        .eq("reference", reference)
        .eq("status", "pending");
      if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
      break;
    }
    case "charge.refunded":
    case "refund.processed": {
      const refundRef =
        reference || String(d.transaction?.reference ?? d.transaction_reference ?? "");
      if (!refundRef) break;
      const { error } = await admin
        .from("payments")
        .update({ status: "refunded" })
        .eq("reference", refundRef)
        .eq("status", "success");
      if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
      break;
    }
    case "transfer.success":
    case "transfer.failed":
      break;
  }

  return NextResponse.json({ received: event.event });
}
