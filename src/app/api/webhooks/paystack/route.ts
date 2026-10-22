import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ChargeData = {
  reference?: string;
  amount?: number;
  currency?: string;
  customer?: { email?: string };
  metadata?: Record<string, unknown>;
};

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as { event: string; data: ChargeData };
  const admin = supabaseAdmin();

  switch (event.event) {
    case "charge.success": {
      const d = event.data;
      const reference = String(d.reference ?? "");
      const amount = Number(d.amount ?? 0);
      const currency = String(d.currency ?? "");
      const meta = d.metadata ?? {};
      const kind = String(meta.kind ?? "");

      if (!reference || currency !== "USD") break;

      if (kind === "ebook") {
        const ebookId = String(meta.ebook_id ?? "");
        const buyerId = String(meta.buyer_id ?? "");
        const { data: ebook } = await admin
          .from("ebooks")
          .select("price_cents")
          .eq("id", ebookId)
          .maybeSingle();

        if (!ebook || !buyerId || amount < Number(ebook.price_cents ?? 0)) break;

        await admin.from("payments").upsert(
          {
            reference,
            ebook_id: ebookId,
            buyer_id: buyerId,
            amount_cents: amount,
            currency,
            status: "success",
          },
          { onConflict: "reference" }
        );
      } else if (kind === "donation") {
        await admin.from("donations").upsert(
          {
            reference,
            amount_cents: amount,
            currency,
            surface: String(meta.surface ?? "home"),
            email: String(d.customer?.email ?? ""),
          },
          { onConflict: "reference" }
        );
      }
      break;
    }
    case "transfer.success":
    case "transfer.failed":
      break;
  }

  return NextResponse.json({ received: event.event });
}
