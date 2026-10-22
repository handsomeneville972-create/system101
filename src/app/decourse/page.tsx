import { NotifyForm } from "@/components/NotifyForm";

export const instant = false;

export default function DeCourse() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-center">
      <h1 className="text-2xl font-semibold">De-Course</h1>
      <p className="mt-2 text-sm text-zinc-400">Coming soon.</p>
      <div className="card mt-6 p-6 text-sm">
        We encourage upload of not only free but valuable courses to uplift one another.
      </div>
      <p className="mt-4 text-xs text-zinc-500">Free = free upload. Paid = $5 before upload (MVP).</p>
      <div className="mx-auto mt-6 max-w-sm text-left">
        <NotifyForm surface="decourse" />
      </div>
    </div>
  );
}
