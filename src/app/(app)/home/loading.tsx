import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { ListCardSkeleton } from "@/components/ui/skeletons";
import { NeedsYouSkeleton } from "@/components/home/HomeSections";

export default function HomeLoading() {
  return (
    <LoadingRegion label="Loading your home…" className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-72" />
      <NeedsYouSkeleton />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <ListCardSkeleton rows={3} className="md:col-span-1" />
        <ListCardSkeleton rows={5} />
        <ListCardSkeleton rows={3} />
      </div>
    </LoadingRegion>
  );
}
