import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { InterestCardSkeleton } from "@/components/ui/skeletons";

export default function FindEmLoading() {
  return (
    <LoadingRegion label="Loading interests…" className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <InterestCardSkeleton key={index} />
        ))}
      </div>
    </LoadingRegion>
  );
}
