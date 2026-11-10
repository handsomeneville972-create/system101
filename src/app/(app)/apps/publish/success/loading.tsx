import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function PublishSuccessLoading() {
  return (
    <LoadingRegion label="Checking payment status…" className="mx-auto max-w-2xl px-4 py-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-6 h-10 w-36 rounded-full" />
      <Skeleton className="mt-4 h-3 w-40" />
    </LoadingRegion>
  );
}
