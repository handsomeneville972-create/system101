import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifyWebhookSignature } from "@/lib/paystack";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TAGS } from "@/lib/cache";
import { RATE_LIMITS, rateLimit, requestIp } from "@/lib/rate-limit";
import { parseJson, readBody, tooManyRequests } from "@/lib/http";
import { logSlow } from "@/lib/monitoring";

type ChargeData = {
  reference?: string;
  amount?: number;
  currency?: string;
  customer?: { email?: string };
  metadata?: Record<string, unknown>;
  transaction?: { reference?: string };
  transaction_reference?: string;
};

type PaystackEvent = { event: string; data: ChargeData };

export const maxDuration = 30;

const MAX_BODY_BYTES = 64 * 1024;
const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  const started = performance.now();

  const limited = rateLimit(
    `webhook.paystack:${requestIp(req.headers)}`,
    RATE_LIMITS.webhook
  );
  if (!limited.ok) return tooManyRequests(limited);

  const raw = await readBody(req, MAX_BODY_BYTES);
  if (raw === null) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413, headers: NO_STORE });
  }

  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401, headers: NO_STORE }
    );
  }

  const event = parseJson<PaystackEvent>(raw);
  if (!event || typeof event.event !== "string") {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400, headers: NO_STORE }
    );
  }

  const admin = supabaseAdmin();
  const d = event.data ?? {};
  const reference = String(d.reference ?? "");

  switch (event.event) {
    case "charge.success": {
      if (!reference) break;

      const amount = Number(d.amount ?? 0);
      const currency = String(d.currency ?? "");

      const { data: payment, error: payError } = await admin
        .from("payments")
        .select("id,amount_cents,currency,status")
        .eq("reference", reference)
        .maybeSingle();
      if (payError) {
        console.error("paystack webhook payment read failed:", payError.message);
        return NextResponse.json(
          { error: "Database error" },
          { status: 500, headers: NO_STORE }
        );
      }

      // Unknown or already-settled references are acknowledged so Paystack
      // stops retrying; only a pending row can transition.
      if (!payment || payment.status !== "pending") break;
      if (
        currency !== "USD" ||
        currency !== payment.currency ||
        amount !== payment.amount_cents
      ) {
        console.warn(
          JSON.stringify({
            level: "warn",
            event: "webhook_mismatch",
            reference,
            expected: payment.amount_cents,
            received: amount,
            expectedCurrency: payment.currency,
            receivedCurrency: currency,
          })
        );
        break;
      }

      // Atomic compare-and-set: concurrent duplicate webhooks cannot both win.
      const { data: updated, error } = await admin
        .from("payments")
        .update({ status: "success" })
        .eq("id", payment.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
      if (error) {
        console.error("paystack webhook payment update failed:", error.message);
        return NextResponse.json(
          { error: "Database error" },
          { status: 500, headers: NO_STORE }
        );
      }
      if (!updated) break;

      // Flip app listing from draft to published on successful payment.
      const meta = d.metadata ?? {};
      if (String(meta.kind ?? "") === "app_listing") {
        const appId = String(meta.app_id ?? "");
        if (appId) {
          const { error: publishError } = await admin
            .from("apps")
            .update({ status: "published" })
            .eq("id", appId)
            .eq("status", "draft");
          if (publishError) {
            console.error("paystack webhook publish failed:", publishError.message);
          } else {
            revalidateTag(TAGS.apps, "max");
          }
        }
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
      if (error) {
        console.error("paystack webhook fail update failed:", error.message);
        return NextResponse.json(
          { error: "Database error" },
          { status: 500, headers: NO_STORE }
        );
      }
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
      if (error) {
        console.error("paystack webhook refund update failed:", error.message);
        return NextResponse.json(
          { error: "Database error" },
          { status: 500, headers: NO_STORE }
        );
      }
      break;
    }
    case "transfer.success":
    case "transfer.failed":
      break;
  }

  logSlow("webhook.paystack", started, { event: event.event });
  return NextResponse.json({ received: event.event }, { headers: NO_STORE });
}
