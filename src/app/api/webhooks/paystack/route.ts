import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as { event: string; data: Record<string, unknown> };
  switch (event.event) {
    case "charge.success": {
      // TODO: persist donation/sale to Supabase using event.data.reference + metadata
      break;
    }
    case "transfer.success":
    case "transfer.failed":
      // TODO: update payout records
      break;
  }

  return NextResponse.json({ received: event.event });
}
