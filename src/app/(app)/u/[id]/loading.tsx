import { LoadingRegion, Skeleton, SkeletonCircle } from "@/components/ui/skeleton";
import { ListCardSkeleton } from "@/components/ui/skeletons";
import { TextCardSkeleton } from "@/components/ui/page-skeletons";

export default function ProfileLoading() {
  return (
    <LoadingRegion label="Loading profile…" className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start gap-5" aria-hidden="true">
        <SkeletonCircle className="h-24 w-24 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2 py-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <TextCardSkeleton className="mt-6" rows={3} />
      <ListCardSkeleton rows={3} className="mt-4" />
      <ListCardSkeleton rows={3} className="mt-4" />
    </LoadingRegion>
  );
}
