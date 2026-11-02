import {
  BarChart3,
  BookOpen,
  BookUp,
  FileUp,
  GraduationCap,
  House,
  LayoutGrid,
  Lightbulb,
  Plus,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
};

export type TextLink = {
  href: string;
  label: string;
};

export const NAV_LINKS: NavItem[] = [
  { href: "/home", label: "Home", icon: House },
  { href: "/findem", label: "Find'em", icon: UsersRound },
  { href: "/ebooku", label: "Ebooku", icon: BookOpen },
  { href: "/suggy", label: "Suggy", icon: Lightbulb },
  { href: "/decourse", label: "De-Course", icon: GraduationCap },
  { href: "/apps", label: "Apps", icon: LayoutGrid },
];

export const WORK_NAV: NavItem[] = [
  { href: "/dashboard/apps", label: "My apps", icon: BarChart3 },
  { href: "/dashboard/earnings", label: "Earnings", icon: Wallet },
];

export const CONTRIBUTE_NAV: NavItem[] = [
  { href: "/groups/new", label: "Create a group", icon: Plus },
  { href: "/ebooku/upload", label: "Upload a book", icon: BookUp },
  { href: "/decourse/upload", label: "Upload a course", icon: FileUp },
];

export const SITE = {
  name: "De`System",
  tagline: "For those who aspire. Build something great. Find your people.",
  email: "support@001system.dev",
  company: "C. Levi Company",
} as const;

export const COMPANY_LINKS: TextLink[] = [
  { href: "/#about", label: "About us" },
  { href: `mailto:${SITE.email}`, label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];
