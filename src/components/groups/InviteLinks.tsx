export function InviteLinks({
  invites,
}: {
  invites: { token: string; email: string | null; status: string }[];
}) {
  return (
    <div className="space-y-2">
      {invites.map((inv) => (
        <div key={inv.token} className="flex items-center gap-3 text-xs">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 ${
              inv.status === "accepted"
                ? "bg-white/10 text-zinc-200"
                : "border hairline text-zinc-400"
            }`}
          >
            {inv.status}
          </span>
          <code className="truncate text-zinc-400">
            {inv.email ? `${inv.email} · ` : ""}/groups/join?token={inv.token}
          </code>
        </div>
      ))}
    </div>
  );
}
