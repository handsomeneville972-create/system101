import Link from "next/link";

export function AppCard({ app }: { app: { id: string; title: string; tagline: string | null; icon_url: string | null; category: string | null; tags: string[] | null; author: string | null; created_at: string } }) {
  return (
    <Link href={`/apps/${app.id}`} className="card flex gap-4 p-4 hover:bg-white/[0.02]">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border hairline bg-white/5">
        {app.icon_url ? (
          <img src={app.icon_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-zinc-600">
            No icon
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="truncate font-medium">{app.title}</h2>
          <span className="shrink-0 text-xs text-zinc-400">Free</span>
        </div>
        {app.tagline && <p className="mt-1 text-xs text-zinc-400 line-clamp-1">{app.tagline}</p>}
        <p className="mt-1 text-xs text-zinc-500">{app.author ?? "Unknown developer"}</p>
        <div className="mt-2 flex flex-wrap gap-1 text-xs text-zinc-500">
          {app.category && <span>#{app.category}</span>}
          {app.tags?.slice(0, 3).map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
