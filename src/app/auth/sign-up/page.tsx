"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/onboarding")}`,
      },
    });
    if (error) {
      setMsg(error.message);
    } else {
      setSent(true);
      setMsg("Check your email to finish signing up.");
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign up</h1>
      <p className="mt-1 text-sm text-zinc-400">Join. Grow.</p>
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
          {sent ? "Link sent" : "Create account"}
        </button>
        {msg && <p className="text-xs text-zinc-400">{msg}</p>}
      </form>
      <p className="mt-4 text-xs text-zinc-500">
        Already have one?{" "}
        <Link href="/auth/sign-in" className="text-zinc-300 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
