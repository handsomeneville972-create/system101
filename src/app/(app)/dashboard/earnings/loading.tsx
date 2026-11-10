import { TablePageSkeleton } from "@/components/ui/page-skeletons";

export default function EarningsLoading() {
  return (
    <TablePageSkeleton
      label="Loading earnings…"
      title="w-36"
      subtitle="w-80"
      stats={4}
      rows={4}
      columns={5}
    />
  );
}
