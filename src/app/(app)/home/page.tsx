import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { myGroups } from "@/lib/data/groups";
import { trendingSignals } from "@/lib/data/suggy";
import { recentEbooks } from "@/lib/data/ebooks";
import { homeInbox } from "@/lib/data/notifications";
import {
  MyGroupsCard,
  MyGroupsSkeleton,
  NeedsYouSection,
  NeedsYouSkeleton,
  NewEbooksCard,
  NewEbooksSkeleton,
  TrendingCard,
  TrendingSkeleton,
} from "@/components/home/HomeSections";

export const instant = false;

export default async function HomePage() {
  // The profile gate must resolve before the page renders so onboarding
  // redirects are never streamed as a half page. Everything else can stream.
  const profile = await getProfile();
  if (!profile?.interest) redirect("/onboarding");

  const groups = myGroups();
  const inbox = groups.then((memberships) => homeInbox(memberships));
  const trending = trendingSignals();
  const ebooks = recentEbooks(3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">
        {profile.display_name ? `Hey, ${profile.display_name}` : "Home"}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">Your groups, trending signals, new books.</p>

      <Suspense fallback={<NeedsYouSkeleton label="Loading what needs you…" />}>
        <NeedsYouSection inbox={inbox} />
      </Suspense>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Suspense fallback={<MyGroupsSkeleton />}>
          <MyGroupsCard groups={groups} />
        </Suspense>
        <Suspense fallback={<TrendingSkeleton />}>
          <TrendingCard signals={trending} />
        </Suspense>
        <Suspense fallback={<NewEbooksSkeleton />}>
          <NewEbooksCard ebooks={ebooks} />
        </Suspense>
      </div>
    </div>
  );
}
