"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";
import { safeNotificationHref } from "@/lib/notifications";

export async function openNotification(formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in?next=/notifications");

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/notifications");

  const sb = await supabaseServer();
  const { data } = await sb
    .from("notifications")
    .select("href")
    .eq("id", id)
    .eq("recipient_id", user.id)
    .maybeSingle();

  if (!data) redirect("/notifications");

  await sb
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_id", user.id);

  revalidatePath("/notifications");
  revalidatePath("/home");
  revalidatePath("/", "layout");

  redirect(safeNotificationHref((data as { href: string }).href));
}

export async function markAllRead() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in?next=/notifications");

  const sb = await supabaseServer();
  await sb
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  revalidatePath("/notifications");
  revalidatePath("/home");
  revalidatePath("/", "layout");
}
