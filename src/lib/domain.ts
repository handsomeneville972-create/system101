export type InterestSlug =
  | "business"
  | "trading"
  | "tech"
  | "content"
  | "design"
  | "music"
  | "fitness"
  | "books"
  | "gaming"
  | "marketing"
  | "mindset"
  | "faith";

export const INTERESTS: { slug: InterestSlug; label: string; blurb: string }[] = [
  { slug: "business", label: "Business & Startups", blurb: "Build. Launch. Grow." },
  { slug: "trading", label: "Trading & Investing", blurb: "Markets. Discipline. Risk." },
  { slug: "tech", label: "Tech & Coding", blurb: "Learn. Build. Ship." },
  { slug: "content", label: "Content Creation", blurb: "Publish. Audience. Grow." },
  { slug: "design", label: "Art & Design", blurb: "Make. Refine. Show." },
  { slug: "music", label: "Music", blurb: "Create. Perform. Listen." },
  { slug: "fitness", label: "Fitness & Health", blurb: "Train. Fuel. Recover." },
  { slug: "books", label: "Books & Learning", blurb: "Read. Study. Apply." },
  { slug: "gaming", label: "Gaming", blurb: "Play. Compete. Connect." },
  { slug: "marketing", label: "Marketing & Growth", blurb: "Reach. Convert. Retain." },
  { slug: "mindset", label: "Personal Growth", blurb: "Focus. Habits. Progress." },
  { slug: "faith", label: "Faith & Purpose", blurb: "Believe. Serve. Grow." },
];

export function interestLabel(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return INTERESTS.find((i) => i.slug === slug)?.label ?? slug;
}

// 80% supermajority, 48h window, leader tie-break
export const VOTE_WINDOW_HOURS = 48;
export const PASS_RATIO = 0.8;

export function votePasses(yes: number, no: number, members: number, leaderYes: boolean): boolean {
  const cast = yes + no;
  if (cast === 0) return false;
  if (cast === members) return yes / members >= PASS_RATIO || (yes === no && leaderYes);
  return yes / cast >= PASS_RATIO;
}

export function voteExpired(createdAt: string): boolean {
  const ms = Date.now() - new Date(createdAt).getTime();
  return ms > VOTE_WINDOW_HOURS * 3600 * 1000;
}
