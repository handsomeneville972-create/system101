export type ProfessionSlug =
  | "traders"
  | "dropshippers"
  | "creators"
  | "startup-founders"
  | "founders"
  | "musicians"
  | "affiliates"
  | "engineers"
  | "developers";

export const PROFESSIONS: { slug: ProfessionSlug; label: string; blurb: string }[] = [
  { slug: "traders", label: "Traders", blurb: "Markets. Discipline." },
  { slug: "dropshippers", label: "Drop-shippers", blurb: "Stores. Systems." },
  { slug: "creators", label: "Content creators", blurb: "Publish. Grow." },
  { slug: "startup-founders", label: "Startup founders", blurb: "Build. Ship." },
  { slug: "founders", label: "Founders", blurb: "Lead. Endure." },
  { slug: "musicians", label: "Musicians", blurb: "Sound. Craft." },
  { slug: "affiliates", label: "Affiliate marketers", blurb: "Traffic. Convert." },
  { slug: "engineers", label: "Engineers", blurb: "Solve. Scale." },
  { slug: "developers", label: "Developers", blurb: "Code. Launch." },
];

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
