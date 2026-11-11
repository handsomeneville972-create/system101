/**
 * Builds a safe `Content-Disposition` attachment filename from a title and the
 * stored object path (whose extension is authoritative).
 */
export function attachmentFilename(
  title: string,
  filePath: string,
  fallback = "file",
) {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "pdf";
  const base =
    title
      .replace(/[\\/:*?"<>|\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80)
      .replace(/[. ]+$/g, "") || fallback;
  return `${base}.${ext}`;
}
