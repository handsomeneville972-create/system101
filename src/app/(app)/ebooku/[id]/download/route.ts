import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUser } from "@/lib/auth";
import { RATE_LIMITS, rateLimit, requestIp } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/http";
import { attachmentFilename } from "@/lib/download-name";

export const maxDuration = 15;

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const wantsJson = req.headers.get("accept")?.includes("application/json") ?? false;

  const limited = rateLimit(
    `download.ebook:${requestIp(req.headers)}`,
    RATE_LIMITS.download
  );
  if (!limited.ok) return tooManyRequests(limited);

  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: ebook } = await admin
    .from("ebooks")
    .select("id,title,price_cents,file_path,status,uploader_id")
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
      if (wantsJson) {
        return NextResponse.json(
          { error: "Sign in to download this book." },
          { status: 401, headers: NO_STORE }
        );
      }
      const url = new URL(
        `/?mode=signin&next=/ebooku/${id}`,
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
      );
      return NextResponse.redirect(url, { headers: NO_STORE });
    }
    return NextResponse.json({ error: "Purchase required" }, { status: 402 });
  }

  const { data: signed, error } = await admin.storage
    .from("ebook-files")
    .createSignedUrl(ebook.file_path, 300, {
      download: attachmentFilename(
        ebook.title ?? "book",
        ebook.file_path,
        "book",
      ),
    });

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not create download" }, { status: 500 });
  }

  if (wantsJson) {
    return NextResponse.json({ url: signed.signedUrl }, { headers: NO_STORE });
  }

  return NextResponse.redirect(signed.signedUrl, { headers: NO_STORE });
}
