import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { AppCardSkeleton } from "@/components/ui/skeletons";

export default function AppsLoading() {
  return (
    <LoadingRegion
      label="Loading community apps…"
      className="mx-auto max-w-6xl px-4 py-10"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <AppCardSkeleton key={index} />
        ))}
      </div>
    </LoadingRegion>
  );
}
