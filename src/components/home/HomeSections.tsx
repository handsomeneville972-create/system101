import Link from "next/link";
import { NeedsYou } from "@/components/home/NeedsYou";
import { Skeleton, SkeletonStatus } from "@/components/ui/skeleton";
import { ListCardSkeleton } from "@/components/ui/skeletons";
import type { EbookListItem } from "@/lib/data/ebooks";
import type { MyGroup } from "@/lib/data/groups";
import type { HomeInbox } from "@/lib/data/notifications";
import type { TrendingSignal } from "@/lib/data/suggy";

async function settle<T>(promise: Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error(`home section failed: ${label}`, error);
    return fallback;
  }
}

export async function NeedsYouSection({ inbox }: { inbox: Promise<HomeInbox> }) {
  const value = await settle(
    inbox,
    { unread: 0, requests: [], signals: [] },
    "needs-you"
  );
  return <NeedsYou inbox={value} />;
}

export function NeedsYouSkeleton({ label }: { label?: string }) {
  return (
    <section
      className="card mt-6 min-h-[184px] p-6"
      aria-hidden={label ? undefined : true}
    >
      {label && <SkeletonStatus label={label} />}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border hairline p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-8" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}

export async function MyGroupsCard({ groups }: { groups: Promise<MyGroup[]> }) {
  const list = await settle(groups, [], "my-groups");

  return (
    <div className="card p-6 md:col-span-1">
      <h2 className="text-sm font-medium">My groups</h2>
      {list.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">
          No groups yet.{" "}
          <Link href="/findem" className="text-zinc-200 underline">
            Find one
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list
            .filter((group) => group.group)
            .map((group) => (
              <li key={group.group!.id}>
                <Link
                  href={`/groups/${group.group!.slug}`}
                  className="flex items-center justify-between text-sm hover:text-white"
                >
                  <span>{group.group!.name}</span>
                  <span className="text-xs text-zinc-500">
                    {group.group!.active ? "active" : "forming"}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export function MyGroupsSkeleton() {
  return (
    <ListCardSkeleton
      rows={3}
      className="md:col-span-1"
      label="Loading your groups…"
    />
  );
}

export async function TrendingCard({
  signals,
}: {
  signals: Promise<TrendingSignal[]>;
}) {
  const list = await settle(signals, [], "trending");

  return (
    <div className="card p-6">
      <h2 className="text-sm font-medium">Trending suggies</h2>
      {list.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">
          Nothing yet.{" "}
          <Link href="/suggy" className="text-zinc-200 underline">
            Browse
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((signal) => (
            <li key={signal.id}>
              <Link
                href="/suggy"
                className="flex items-center justify-between text-sm hover:text-white"
              >
                <span className="truncate">{signal.title}</span>
                <span className="ml-3 shrink-0 text-xs text-zinc-500">
                  {signal.score}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TrendingSkeleton() {
  return <ListCardSkeleton rows={5} label="Loading trending signals…" />;
}

export async function NewEbooksCard({
  ebooks,
}: {
  ebooks: Promise<EbookListItem[]>;
}) {
  const list = await settle(ebooks, [], "new-ebooks");

  return (
    <div className="card p-6">
      <h2 className="text-sm font-medium">New ebooks</h2>
      {list.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">
          No books yet.{" "}
          <Link href="/ebooku/upload" className="text-zinc-200 underline">
            Upload one
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((book) => (
            <li key={book.id}>
              <Link
                href={`/ebooku/${book.id}`}
                className="flex items-center justify-between text-sm hover:text-white"
              >
                <span className="truncate">{book.title}</span>
                <span className="ml-3 shrink-0 text-xs text-zinc-500">
                  {book.price_cents === 0
                    ? "Free"
                    : `$${(book.price_cents / 100).toFixed(2)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/ebooku"
        className="mt-3 inline-block text-xs text-zinc-500 underline"
      >
        All books
      </Link>
    </div>
  );
}

export function NewEbooksSkeleton() {
  return <ListCardSkeleton rows={3} label="Loading new ebooks…" />;
}
