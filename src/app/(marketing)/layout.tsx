import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-black">
      <div className="mx-auto w-full max-w-3xl px-5 pt-8 sm:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-md text-xs text-zinc-400 transition-colors hover:text-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to De`System
        </Link>
      </div>
      <main>{children}</main>
    </div>
  );
}
