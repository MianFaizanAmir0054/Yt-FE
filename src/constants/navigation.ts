import {
  Home,
  FolderKanban,
  Settings,
  Youtube,
  Building2,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/channels", label: "Channels", icon: Youtube },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/admin", label: "User Management", icon: ShieldCheck },
];
