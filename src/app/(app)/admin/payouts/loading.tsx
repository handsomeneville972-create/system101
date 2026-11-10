import { TablePageSkeleton } from "@/components/ui/page-skeletons";

export default function AdminPayoutsLoading() {
  return (
    <TablePageSkeleton
      label="Loading payout requests…"
      title="w-32"
      subtitle="w-96"
      rows={5}
      columns={5}
    />
  );
}
