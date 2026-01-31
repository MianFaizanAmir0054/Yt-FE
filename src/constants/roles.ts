import { Crown, ShieldCheck, User, LucideIcon } from "lucide-react";

export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  COLLABORATOR: "collaborator",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface RoleConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  badge: string;
  description: string;
}

export const ROLE_CONFIG: Record<string, RoleConfig> = {
  [USER_ROLES.SUPER_ADMIN]: {
    label: "Super Admin",
    icon: Crown,
    color: "text-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    description: "Full system access",
  },
  [USER_ROLES.ADMIN]: {
    label: "Admin",
    icon: ShieldCheck,
    color: "text-purple-500",
    badge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Can manage channels and users",
  },
  [USER_ROLES.COLLABORATOR]: {
    label: "Collaborator",
    icon: User,
    color: "text-blue-500",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Workspace member",
  },
};

export const WORKSPACE_ROLES = ["admin", "editor", "viewer"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];
