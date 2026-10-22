import crypto from "node:crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

export type InitInput = {
  email: string;
  amountUsd: number;
  amountCents?: number;
  reference?: string;
  callbackUrl?: string;
  subaccount?: string;
  metadata?: Record<string, unknown>;
};

export function toCents(usd: number): number {
  return Math.round(usd * 100);
}

export async function initTransaction(input: InitInput) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY missing");
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountCents ?? toCents(input.amountUsd),
      currency: "USD",
      reference: input.reference,
      callback_url: input.callbackUrl,
      subaccount: input.subaccount,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json?.status) {
    throw new Error(json?.message ?? "Paystack initialize failed");
  }
  return json.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyTransaction(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY missing");
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const json = await res.json();
  return json?.data as { status: string; amount: number; currency: string; reference: string };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
