import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Stars({
  rating,
  size = 14,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const filled = Math.round(rating);

  return (
    <span
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          aria-hidden="true"
          className={n <= filled ? "fill-white text-white" : "text-zinc-700"}
        />
      ))}
    </span>
  );
}
