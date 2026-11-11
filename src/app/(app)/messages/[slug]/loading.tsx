import { LoadingRegion, Skeleton, SkeletonCircle } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <LoadingRegion
      label="Loading chat…"
      className="flex h-[calc(100dvh-3.5rem)] flex-col md:h-dvh"
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b hairline px-2 sm:px-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <SkeletonCircle className="h-8 w-8" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>

      <div className="flex-1 space-y-4 overflow-hidden px-3 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {[
            { own: false, width: "w-56", lines: 2 },
            { own: false, width: "w-72", lines: 1 },
            { own: true, width: "w-48", lines: 2 },
            { own: false, width: "w-64", lines: 1 },
            { own: true, width: "w-80", lines: 1 },
          ].map((row, index) => (
            <div
              key={index}
              className={row.own ? "flex justify-end" : "flex justify-start gap-2"}
            >
              {!row.own && <SkeletonCircle className="mt-0.5 h-7 w-7" />}
              <div className={`space-y-2 ${row.width}`} aria-hidden="true">
                <Skeleton className="h-16 w-full rounded-2xl" />
                {row.lines > 1 && <Skeleton className="h-2.5 w-20" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t hairline p-3 sm:p-4">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border hairline p-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </LoadingRegion>
  );
}
