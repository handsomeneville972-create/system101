import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { DetailHeroSkeleton, TextCardSkeleton } from "@/components/ui/page-skeletons";

export default function AppDetailLoading() {
  return (
    <LoadingRegion label="Loading app…" className="mx-auto max-w-3xl px-4 py-10">
      <Skeleton className="h-3 w-28" />
      <DetailHeroSkeleton coverClassName="h-40 w-40" title="w-64" />
      <TextCardSkeleton className="mt-6" rows={3} />
      <TextCardSkeleton rows={4} />
    </LoadingRegion>
  );
}
