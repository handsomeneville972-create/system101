import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <LoadingRegion label="Loading checkout…" className="mx-auto max-w-2xl px-4 py-10">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div className="card mt-6 space-y-3 p-6" aria-hidden="true">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-10 w-40 rounded-full" />
      </div>
    </LoadingRegion>
  );
}
