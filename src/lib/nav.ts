import {
  BarChart3,
  BookOpen,
  BookUp,
  FileUp,
  GraduationCap,
  House,
  Info,
  LayoutGrid,
  Lightbulb,
  Mail,
  Plus,
  UsersRound,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
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
];

export const CONTRIBUTE_NAV: NavItem[] = [
  { href: "/groups/new", label: "Create a group", icon: Plus },
  { href: "/ebooku/upload", label: "Upload a book", icon: BookUp },
  { href: "/decourse/upload", label: "Upload a course", icon: FileUp },
];

export const SITE = {
  name: "0.01%SYSTEM",
  tagline: "For those who aspire. Build something great. Find your people.",
  email: "support@001system.dev",
  youtube: "https://www.youtube.com/@PERSPECTIVExGROWTH",
  company: "C. Levi Company",
} as const;

export const COMPANY_NAV: NavItem[] = [
  { href: "/#about", label: "About us", icon: Info },
  { href: `mailto:${SITE.email}`, label: "Contact", icon: Mail },
  { href: SITE.youtube, label: "YouTube", icon: Youtube, external: true },
];

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;
