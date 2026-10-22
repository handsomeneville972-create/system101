import Link from "next/link";
import { FileText, Play } from "lucide-react";
import type { CourseListItem } from "@/lib/data/courses";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function CourseCard({ course }: { course: CourseListItem }) {
  return (
    <Link href={`/decourse/${course.id}`} className="card block p-5 hover:bg-white/[0.02]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border hairline bg-white/5">
          <Play size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-medium">{course.title}</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {course.creator ?? "Member"} · {LEVEL_LABEL[course.level]}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{course.description}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
            {course.has_pdf && (
              <span className="inline-flex items-center gap-1">
                <FileText size={12} /> Notes
              </span>
            )}
            {course.tags?.length ? <span>{course.tags.map((t) => `#${t}`).join(" ")}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
