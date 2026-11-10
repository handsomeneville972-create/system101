import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { EbookCardSkeleton } from "@/components/ui/skeletons";

export default function EbookuLoading() {
  return (
    <LoadingRegion label="Loading books…" className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <div className="mt-5 flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-16 rounded-full" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <EbookCardSkeleton key={index} />
        ))}
      </div>
    </LoadingRegion>
  );
}
