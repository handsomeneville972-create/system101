import { CourseUploadForm } from "@/components/courses/CourseUploadForm";

export const instant = false;

export default function UploadCourse() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Upload course</h1>
      <p className="text-sm text-zinc-400">
        Share a course. YouTube or Vimeo link, optional notes.
      </p>
      <CourseUploadForm />
    </div>
  );
}
