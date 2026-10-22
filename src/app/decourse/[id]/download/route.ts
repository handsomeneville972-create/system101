import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: course } = await admin
    .from("courses")
    .select("id,pdf_path,status,creator_id")
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
    .createSignedUrl(course.pdf_path, 300);

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not create download" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
