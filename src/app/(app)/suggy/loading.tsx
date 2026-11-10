import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { SuggyCardSkeleton } from "@/components/ui/skeletons";

export default function SuggyLoading() {
  return (
    <LoadingRegion label="Loading signals…" className="mx-auto max-w-3xl px-4 py-10">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <SuggyCardSkeleton key={index} />
        ))}
      </div>
    </LoadingRegion>
  );
}
