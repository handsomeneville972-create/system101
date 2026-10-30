import { markAllRead } from "@/lib/actions/notifications";

export function MarkAllRead({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <form action={markAllRead}>
      <button
        type="submit"
        className="text-xs text-zinc-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        Mark all read
      </button>
    </form>
  );
}
