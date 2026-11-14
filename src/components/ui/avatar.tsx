"use client";

import Link from "next/link";
import { BadgeCheck, UserRound } from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { chatInitials } from "@/lib/chat";
import { cn } from "@/lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "away" | "busy";

type AvatarProps = {
  /** Display name used for the initials fallback and the accessible label. */
  name?: string | null;
  /** Profile image URL. Signed URLs are supported; the image is not optimized. */
  src?: string | null;
  /** Alt text for the image. Use an empty string when a nearby label names the person. */
  alt?: string;
  /** Preset size, or a pixel value for one-off layouts. */
  size?: AvatarSize | number;
  /** Optional presence dot pinned to the bottom-right corner. */
  status?: AvatarStatus;
  /** Optional verification badge pinned to the bottom-left corner. */
  verified?: boolean;
  /** Hairline outline around the octagon. Defaults to true. */
  outline?: boolean;
  /** Sizing or layout overrides. Tailwind size utilities win over `size`. */
  className?: string;
  /** Replaces the initials fallback, for example a "No photo" label. */
  fallback?: ReactNode;
  loading?: "lazy" | "eager";
  /** Renders the avatar as a link. Do not use inside another link. */
  href?: string;
  /** Renders the avatar as a button. Do not use inside a link or button. */
  onClick?: () => void;
  /** Accessible label for interactive avatars. Falls back to `name`. */
  ariaLabel?: string;
  /** Native tooltip text. */
  title?: string;
  /** Absolutely positioned overlays such as custom badges. */
  children?: ReactNode;
};

const SIZES: Record<AvatarSize, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

const SIZE_PX: Record<AvatarSize, number> = {
  xs: 28,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
};

const STATUS_DOT: Record<AvatarSize, string> = {
  xs: "h-2 w-2",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-3.5 w-3.5",
};

const VERIFIED_BADGE: Record<AvatarSize, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[18px] w-[18px]",
  xl: "h-5 w-5",
};

const STATUS_COLOR: Record<AvatarStatus, string> = {
  online: "bg-emerald-400",
  offline: "bg-zinc-600",
  away: "bg-amber-400",
  busy: "bg-red-400",
};

const STATUS_LABEL: Record<AvatarStatus, string> = {
  online: "Online",
  offline: "Offline",
  away: "Away",
  busy: "Busy",
};

function nearestSize(value: number): AvatarSize {
  const entries = Object.entries(SIZE_PX) as [AvatarSize, number][];
  return entries.reduce((closest, entry) =>
    Math.abs(entry[1] - value) < Math.abs(closest[1] - value) ? entry : closest
  )[0];
}

/**
 * Application-wide octagonal profile picture.
 *
 * The outer element is never clipped so status dots and verification badges
 * stay fully visible. Two clipped layers keep the image inside a regular
 * octagon while painting a hairline border that follows the shape. Images use
 * object-cover, so every aspect ratio is center-cropped without stretching.
 */
export function Avatar({
  name,
  src,
  alt = "",
  size = "md",
  status,
  verified = false,
  outline = true,
  className,
  fallback,
  loading = "lazy",
  href,
  onClick,
  ariaLabel,
  title,
  children,
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && src !== failedSrc;
  const interactive = Boolean(href || onClick);

  const sizeKey = typeof size === "number" ? nearestSize(size) : size;
  const dimension =
    typeof size === "number"
      ? ({
          width: size,
          height: size,
          fontSize: Math.max(9, Math.round(size * 0.27)),
        } satisfies CSSProperties)
      : undefined;

  const baseLabel = ariaLabel ?? (name?.trim() ? name : alt) ?? "Profile photo";
  const label = [baseLabel, status ? STATUS_LABEL[status] : null, verified ? "Verified" : null]
    .filter(Boolean)
    .join(", ");
  const fallbackContent = fallback ?? (
    name?.trim() ? (
      chatInitials(name)
    ) : (
      <UserRound className="h-1/2 w-1/2" strokeWidth={1.5} aria-hidden="true" />
    )
  );

  const wrapperClassName = cn(
    "avatar-octagon-trigger relative inline-flex aspect-square shrink-0 isolate align-middle",
    typeof size === "number" ? "" : SIZES[size],
    interactive && "cursor-pointer focus-visible:outline-none",
    className
  );

  const content = (
    <>
      {interactive && (
        <span
          aria-hidden="true"
          className="avatar-octagon-halo avatar-octagon-clip pointer-events-none absolute -inset-[3px] bg-white/75 opacity-0 transition-opacity duration-150"
        />
      )}

      {/* The outer clipped layer paints the border; the inner one holds the photo. */}
      <span
        className={cn(
          "avatar-octagon-clip absolute inset-0 overflow-hidden",
          outline ? "bg-white/[0.14]" : "bg-transparent"
        )}
      >
        <span
          className={cn(
            "avatar-octagon-clip absolute overflow-hidden bg-white/[0.06] text-zinc-300",
            outline ? "inset-px" : "inset-0"
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            {fallbackContent}
          </span>
          {showImage && (
            // Signed Supabase URLs are short-lived, so next/image is not a fit.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src ?? undefined}
              alt={interactive ? "" : alt}
              loading={loading}
              decoding="async"
              draggable={false}
              onError={() => setFailedSrc(src ?? null)}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )}
        </span>
      </span>

      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 z-10 rounded-full ring-2 ring-black",
            STATUS_DOT[sizeKey],
            STATUS_COLOR[status]
          )}
        >
          <span className="sr-only">{STATUS_LABEL[status]}</span>
        </span>
      )}

      {verified && (
        <span
          className={cn(
            "absolute -bottom-0.5 -left-0.5 z-10 grid place-items-center rounded-full bg-black text-white ring-1 ring-white/20",
            VERIFIED_BADGE[sizeKey]
          )}
        >
          <BadgeCheck className="h-[72%] w-[72%]" strokeWidth={2.2} aria-hidden="true" />
          <span className="sr-only">Verified</span>
        </span>
      )}

      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        title={title}
        onClick={onClick}
        className={wrapperClassName}
        style={dimension}
      >
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={label}
        title={title}
        onClick={onClick}
        className={cn(wrapperClassName, "border-0 bg-transparent p-0")}
        style={dimension}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={wrapperClassName} style={dimension} title={title}>
      {content}
    </span>
  );
}
