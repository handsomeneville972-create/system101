import Link from "next/link";
import { CourseCard } from "@/components/courses/CourseCard";
import { listCourses } from "@/lib/data/courses";

export const instant = false;

export default async function DeCourse() {
  const courses = await listCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">De-Course</h1>
          <p className="text-sm text-zinc-400">Free courses from members. Video + notes.</p>
        </div>
        <Link href="/decourse/upload" className="btn-pill bg-white px-5 py-2.5 text-sm text-black">
          Upload
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {courses.length === 0 && (
          <div className="card p-6 text-sm text-zinc-400">
            No courses yet. Upload the first.
          </div>
        )}
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        Free to teach. Free to learn.
      </p>
    </div>
  );
}
