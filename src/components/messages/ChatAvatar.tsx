import { chatInitials } from "@/lib/chat";
import { cn } from "@/lib/cn";

export function ChatAvatar({
  name,
  url,
  className,
}: {
  name: string;
  url: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border hairline bg-white/[0.06] text-[11px] font-medium text-zinc-300",
        className
      )}
    >
      {url ? (
        // Signed Supabase URLs are short-lived, so next/image is not a good fit.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        chatInitials(name)
      )}
    </span>
  );
}
