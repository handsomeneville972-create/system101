"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function SignInForm({ authError }: { authError: boolean }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(authError ? "That link expired. Send a fresh one." : "");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabaseBrowser();
    const next = new URLSearchParams(window.location.search).get("next");
    const callback = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback },
    });
    if (error) {
      setMsg(error.message);
    } else {
      setSent(true);
      setMsg("Check your email for the sign-in link.");
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-zinc-400">Magic link. No password.</p>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
        <button
          disabled={sent}
          className="btn-pill w-full bg-white py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {sent ? "Link sent" : "Send link"}
        </button>
        {msg && <p className="text-xs text-zinc-400">{msg}</p>}
      </form>
      <p className="mt-4 text-xs text-zinc-500">
        No account?{" "}
        <Link href="/auth/sign-up" className="text-zinc-300 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
