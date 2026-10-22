import type { Profile } from "@/lib/auth";

export type DonateSurface = "home" | "ebooku" | "suggy" | "apps";

export const DONATE_SURFACES: DonateSurface[] = ["home", "ebooku", "suggy", "apps"];

export function donateVisible(profile: Profile | null, surface: DonateSurface): boolean {
  const defaults: Record<DonateSurface, boolean> = {
    home: true,
    ebooku: true,
    suggy: true,
    apps: true,
  };
  const map = { ...defaults, ...(profile?.donate_surfaces ?? {}) };
  return map[surface] !== false;
}
