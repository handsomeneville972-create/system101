"use client";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signUp({ email, password: Math.random().toString(36).slice(2) + "Aa1!" });
    setMsg(error ? error.message : "Check email. Then complete onboarding.");
  }
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign up</h1>
      <p className="text-sm text-zinc-400">Join. Grow.</p>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
          className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <button className="btn-pill w-full bg-white py-2.5 text-sm text-black">Create account</button>
        {msg && <p className="text-xs text-zinc-400">{msg}</p>}
      </form>
    </div>
  );
}
