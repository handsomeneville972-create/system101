import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const { surface } = await req.json().catch(() => ({ surface: "home" }));
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price_data: { currency: "usd", product_data: { name: `0.01%SYSTEM donation (${surface})` } }, unit_amount: 500 }, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${surface}?donated=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${surface}?donated=0`,
    metadata: { surface: String(surface), kind: "donation" },
  });
  return NextResponse.json({ url: session.url });
}
