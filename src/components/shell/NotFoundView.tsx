import Link from "next/link";

export function NotFoundView() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">404</p>
      <h1 className="mt-3 text-2xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-zinc-400">
        This page doesn&apos;t exist or was removed.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/home"
          className="btn-pill bg-white px-5 py-2.5 text-sm font-medium text-black"
        >
          Home
        </Link>
        <Link
          href="/findem"
          className="btn-pill border hairline px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.04]"
        >
          Find&apos;em
        </Link>
      </div>
    </div>
  );
}
