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
    `download.course:${requestIp(req.headers)}`,
    RATE_LIMITS.download
  );
  if (!limited.ok) return tooManyRequests(limited);

  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: course } = await admin
    .from("courses")
    .select("id,title,pdf_path,status,creator_id")
    .eq("id", id)
    .maybeSingle();

  if (!course || !course.pdf_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await getUser();
  const isCreator = !!user && course.creator_id === user.id;
  if (course.status !== "published" && !isCreator) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signed, error } = await admin.storage
    .from("course-files")
    .createSignedUrl(course.pdf_path, 300, {
      download: attachmentFilename(
        course.title ?? "course notes",
        course.pdf_path,
        "course notes",
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
