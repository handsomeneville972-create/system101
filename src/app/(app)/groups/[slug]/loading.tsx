import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { ListCardSkeleton } from "@/components/ui/skeletons";

export default function GroupLoading() {
  return (
    <LoadingRegion label="Loading group…" className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-4 w-80" />
      <ListCardSkeleton rows={2} className="mt-6" />
      <div className="mt-6 space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <ListCardSkeleton key={index} rows={3} />
        ))}
      </div>
    </LoadingRegion>
  );
}
