import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { GroupCardSkeleton } from "@/components/ui/skeletons";

export default function InterestLoading() {
  return (
    <LoadingRegion label="Loading groups…" className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-10 w-32 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <GroupCardSkeleton key={index} />
        ))}
      </div>
    </LoadingRegion>
  );
}
