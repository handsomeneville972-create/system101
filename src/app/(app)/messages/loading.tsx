import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { ListRowsSkeleton } from "@/components/ui/page-skeletons";

export default function MessagesLoading() {
  return (
    <LoadingRegion label="Loading messages…" className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <div className="mt-5 flex gap-1 rounded-lg border hairline p-1">
        <Skeleton className="h-8 w-14 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <ListRowsSkeleton rows={5} />
    </LoadingRegion>
  );
}
