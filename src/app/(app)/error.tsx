"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-400">
        The page couldn&apos;t load. Try again, or head home.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-pill inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-medium text-black"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </button>
        <Link
          href="/home"
          className="btn-pill border hairline px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.04]"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
