import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { TextCardSkeleton } from "@/components/ui/page-skeletons";

export default function EbookDetailLoading() {
  return (
    <LoadingRegion label="Loading book…" className="mx-auto max-w-4xl px-4 py-10">
      <Skeleton className="h-3 w-20" />

      <div className="card mt-4 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row">
          <Skeleton className="mx-auto aspect-[2/3] w-32 shrink-0 rounded-lg sm:mx-0 sm:w-44" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
            <Skeleton className="mt-3 h-10 w-36 rounded-full" />
          </div>
        </div>
      </div>

      <TextCardSkeleton rows={3} />

      <div className="card mt-4 p-5 sm:p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-9 w-full rounded-md" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </LoadingRegion>
  );
}
