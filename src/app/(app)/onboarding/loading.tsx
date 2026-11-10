import { FormPageSkeleton } from "@/components/ui/page-skeletons";

export default function OnboardingLoading() {
  return (
    <FormPageSkeleton
      label="Loading onboarding…"
      title="w-44"
      subtitle="w-64"
      fields={3}
    />
  );
}
