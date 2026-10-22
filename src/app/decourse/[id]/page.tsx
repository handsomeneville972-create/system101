import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink, FileText } from "lucide-react";
import { courseDetail } from "@/lib/data/courses";
import { embedUrl, providerLabel } from "@/lib/video";
import { removeCourse } from "@/lib/actions/courses";

export const instant = false;

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await courseDetail(id);
  if (!course) notFound();

  const embed = embedUrl(course.video_provider, course.video_id, course.video_hash);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/decourse" className="text-xs text-zinc-500 hover:text-zinc-300">
        ← De-Course
      </Link>

      <div className="card mt-4 overflow-hidden">
        {embed ? (
          <iframe
            src={embed}
            title={course.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="aspect-video w-full bg-black"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center text-sm text-zinc-500">
            Video unavailable.{" "}
            <a href={course.video_url} target="_blank" rel="noreferrer" className="ml-1 underline">
              Open link
            </a>
          </div>
        )}
      </div>

      <div className="mt-5">
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {course.creator_id ? (
            <Link href={`/u/${course.creator_id}`} className="hover:text-zinc-200">
              {course.creator ?? "Member"}
            </Link>
          ) : (
            course.creator ?? "Member"
          )}{" "}
          · {LEVEL_LABEL[course.level] ?? course.level} · {providerLabel(course.video_provider)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          {course.tags?.length ? <span>{course.tags.map((t) => `#${t}`).join(" ")}</span> : null}
          <a
            href={course.video_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-300"
          >
            <ExternalLink size={12} /> Open on {providerLabel(course.video_provider)}
          </a>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {course.has_pdf && (
            <a
              href={`/decourse/${course.id}/download`}
              className="btn-pill inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-medium text-black"
            >
              <Download size={15} /> Download notes
            </a>
          )}
          {course.is_creator && (
            <form action={removeCourse}>
              <input type="hidden" name="course_id" value={course.id} />
              <button className="text-xs text-zinc-500 hover:text-red-400">Remove course</button>
            </form>
          )}
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <FileText size={14} /> About this course
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm text-zinc-400">{course.description}</p>
      </div>
    </div>
  );
}
