import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function JoinLoading() {
  return (
    <LoadingRegion label="Loading invite…" className="mx-auto max-w-md px-4 py-16">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-64" />
      <Skeleton className="mt-6 h-10 w-full rounded-full" />
      <Skeleton className="mt-4 h-3 w-20" />
    </LoadingRegion>
  );
}
