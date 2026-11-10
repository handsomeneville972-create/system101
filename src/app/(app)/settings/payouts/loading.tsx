import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { FormCardSkeleton } from "@/components/ui/skeletons";
import { PageHeadingSkeleton } from "@/components/ui/page-skeletons";

export default function PayoutSettingsLoading() {
  return (
    <LoadingRegion label="Loading payout settings…" className="mx-auto max-w-2xl px-4 py-10">
      <Skeleton className="h-3 w-16" />
      <PageHeadingSkeleton className="mt-2" title="w-28" subtitle="w-72" />
      <FormCardSkeleton fields={5} />
    </LoadingRegion>
  );
}
