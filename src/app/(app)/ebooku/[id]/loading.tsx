import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { DetailHeroSkeleton, TextCardSkeleton } from "@/components/ui/page-skeletons";

export default function EbookDetailLoading() {
  return (
    <LoadingRegion label="Loading book…" className="mx-auto max-w-3xl px-4 py-10">
      <Skeleton className="h-3 w-20" />
      <DetailHeroSkeleton coverClassName="h-40 w-28" title="w-56" />
      <TextCardSkeleton className="mt-6" rows={3} />
      <TextCardSkeleton rows={2} />
      <TextCardSkeleton rows={4} />
    </LoadingRegion>
  );
}
