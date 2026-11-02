import Link from "next/link";
import { redirect } from "next/navigation";
import { PayoutForm } from "@/components/settings/PayoutForm";
import { getUser } from "@/lib/auth";
import { payoutAccount } from "@/lib/data/earnings";

export const instant = false;

export default async function PayoutSettingsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in?next=/settings/payouts");

  const account = await payoutAccount();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/settings" className="text-xs text-zinc-500 hover:text-zinc-300">
        ← Settings
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Payouts</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Where you get paid when your books sell.
      </p>
      <div className="mt-6">
        <PayoutForm account={account} />
      </div>
    </div>
  );
}
