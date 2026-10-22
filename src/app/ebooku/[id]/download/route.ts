import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: ebook } = await admin
    .from("ebooks")
    .select("id,price_cents,file_path,status,uploader_id")
    .eq("id", id)
    .maybeSingle();

  if (!ebook || !ebook.file_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await getUser();
  const isUploader = !!user && ebook.uploader_id === user.id;

  let paid = false;
  if (user && !isUploader && ebook.price_cents > 0) {
    const { data: pay } = await admin
      .from("payments")
      .select("id")
      .eq("ebook_id", id)
      .eq("buyer_id", user.id)
      .eq("status", "success")
      .maybeSingle();
    paid = !!pay;
  }

  if (ebook.status !== "published" && !isUploader && !paid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (ebook.price_cents > 0 && !isUploader && !paid) {
    if (!user) {
      const url = new URL(
        `/auth/sign-in?next=/ebooku/${id}`,
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
      );
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ error: "Purchase required" }, { status: 402 });
  }

  const { data: signed, error } = await admin.storage
    .from("ebook-files")
    .createSignedUrl(ebook.file_path, 300);

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not create download" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
