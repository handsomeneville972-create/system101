"use client";

import { Heart } from "lucide-react";
import type { DonateSurface } from "@/lib/donate";

export type { DonateSurface };

export function DonateButton({ surface }: { surface: DonateSurface }) {
  async function donate() {
    const res = await fetch("/api/checkout/donate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surface }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <button
      onClick={donate}
      className="btn-pill inline-flex items-center gap-2 border hairline px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
    >
      <Heart size={15} /> Support via Donation
    </button>
  );
}
