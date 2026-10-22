"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BuyButton({ ebookId, label }: { ebookId: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ebook_id: ebookId }),
      });
      if (res.status === 401) {
        router.push(`/auth/sign-in?next=${encodeURIComponent(`/ebooku/${ebookId}`)}`);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Could not start checkout.");
    } catch {
      setError("Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={buy}
        disabled={busy}
        className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
      >
        {busy ? "Starting…" : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
