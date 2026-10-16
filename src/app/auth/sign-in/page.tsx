"use client";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithOtp({ email });
    setMsg(error ? error.message : "Check email for link.");
  }
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
          className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm" />
        <button className="btn-pill w-full bg-white py-2.5 text-sm text-black">Send link</button>
        {msg && <p className="text-xs text-zinc-400">{msg}</p>}
      </form>
    </div>
  );
}
