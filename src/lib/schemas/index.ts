import { z } from "zod";

// ==================== User Schemas ====================
export const UserRoleSchema = z.enum(["super_admin", "admin", "collaborator"]);

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable().optional(),
  role: UserRoleSchema,
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserRefSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

// ==================== Channel Schemas ====================
export const ChannelSchema = z.object({
  _id: z.string(),
  name: z.string(),
  youtubeChannelId: z.string().nullable().optional(),
  youtubeHandle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  ownerId: z.union([z.string(), UserRefSchema]),
  defaultAspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  defaultVoiceId: z.string().nullable().optional(),
  brandColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number().optional(),
});

export const ChannelRefSchema = z.object({
  _id: z.string(),
  name: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
});

export const CreateChannelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  youtubeChannelId: z.string().optional(),
  youtubeHandle: z.string().optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  defaultAspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  defaultVoiceId: z.string().optional(),
  brandColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
});

export const UpdateChannelSchema = CreateChannelSchema.partial();

// ==================== Workspace Schemas ====================
export const WorkspaceSettingsSchema = z.object({
  requireApproval: z.boolean().default(false),
  defaultAspectRatio: z.enum(["9:16", "16:9", "1:1"]).optional(),
  allowCollaboratorImageUpload: z.boolean().optional(),
});

export const WorkspaceSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  ownerId: z.union([z.string(), UserRefSchema]).nullable(),
  channelIds: z.array(z.union([z.string(), ChannelRefSchema])).default([]),
  settings: WorkspaceSettingsSchema.optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number().optional(),
});

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  channelIds: z.array(z.string()).optional(),
  settings: WorkspaceSettingsSchema.optional(),
});

export const UpdateWorkspaceSchema = CreateWorkspaceSchema.partial();

// ==================== Workspace Member Schemas ====================
export const MemberRoleSchema = z.enum(["admin", "editor", "viewer"]);
export const MemberStatusSchema = z.enum(["pending", "accepted", "rejected", "removed"]);

export const WorkspaceMemberSchema = z.object({
  _id: z.string(),
  workspaceId: z.string(),
  userId: z.union([z.string(), UserRefSchema]),
  role: MemberRoleSchema,
  invitedBy: z.union([z.string(), UserRefSchema]).optional(),
  status: MemberStatusSchema,
  permissions: z.object({
    canCreateProjects: z.boolean().optional(),
    canEditProjects: z.boolean().optional(),
    canDeleteProjects: z.boolean().optional(),
    canUploadMedia: z.boolean().optional(),
    canPublish: z.boolean().optional(),
    channelIds: z.array(z.string()).optional(),
  }).optional(),
  inviteExpiresAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const InviteMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: MemberRoleSchema.default("editor"),
});

export const UpdateMemberSchema = z.object({
  role: MemberRoleSchema.optional(),
  permissions: z.object({
    canCreateProjects: z.boolean().optional(),
    canEditProjects: z.boolean().optional(),
    canDeleteProjects: z.boolean().optional(),
    canUploadMedia: z.boolean().optional(),
    canPublish: z.boolean().optional(),
    channelIds: z.array(z.string()).optional(),
  }).optional(),
});

// ==================== Project Schemas ====================
export const ProjectStatusSchema = z.enum([
  "draft",
  "pending-approval",
  "research",
  "scripting",
  "generating-images",
  "generating-voiceover",
  "assembling",
  "review",
  "approved",
  "published",
  "failed",
]);

export const ProjectSchema = z.object({
  _id: z.string(),
  workspaceId: z.union([z.string(), z.object({ _id: z.string(), name: z.string() })]),
  channelId: z.union([z.string(), ChannelRefSchema]).nullable().optional(),
  createdBy: z.union([z.string(), UserRefSchema]),
  title: z.string(),
  reelIdea: z.string(),
  status: ProjectStatusSchema,
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number().optional(),
});

export const CreateProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  reelIdea: z.string().min(1, "Reel idea is required").max(2000, "Idea too long"),
  workspaceId: z.string().min(1, "Workspace is required"),
  channelId: z.string().min(1, "Channel is required"),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
});

export const UpdateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  reelIdea: z.string().min(1).max(2000).optional(),
  status: ProjectStatusSchema.optional(),
});

// ==================== API Response Schemas ====================
export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  pages: z.number(),
});

export const WorkspacesResponseSchema = z.object({
  workspaces: z.array(WorkspaceSchema),
  pagination: PaginationSchema,
});

export const WorkspaceDetailResponseSchema = z.object({
  workspace: WorkspaceSchema,
  memberCount: z.number(),
  projectCount: z.number(),
  userRole: z.string(),
});

export const MembersResponseSchema = z.object({
  owner: UserRefSchema.nullable().optional(),
  members: z.array(WorkspaceMemberSchema),
  canManage: z.boolean(),
});

export const ChannelsResponseSchema = z.object({
  channels: z.array(ChannelSchema),
  pagination: PaginationSchema,
});

export const ProjectsResponseSchema = z.object({
  projects: z.array(ProjectSchema),
  pagination: PaginationSchema,
});

// ==================== Type Exports ====================
export type User = z.infer<typeof UserSchema>;
export type UserRef = z.infer<typeof UserRefSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

export type Channel = z.infer<typeof ChannelSchema>;
export type ChannelRef = z.infer<typeof ChannelRefSchema>;
export type CreateChannelInput = z.infer<typeof CreateChannelSchema>;
export type UpdateChannelInput = z.infer<typeof UpdateChannelSchema>;

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>;
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>;

export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;
export type MemberRole = z.infer<typeof MemberRoleSchema>;
export type MemberStatus = z.infer<typeof MemberStatusSchema>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export type Pagination = z.infer<typeof PaginationSchema>;
export type WorkspacesResponse = z.infer<typeof WorkspacesResponseSchema>;
export type WorkspaceDetailResponse = z.infer<typeof WorkspaceDetailResponseSchema>;
export type MembersResponse = z.infer<typeof MembersResponseSchema>;
export type ChannelsResponse = z.infer<typeof ChannelsResponseSchema>;
export type ProjectsResponse = z.infer<typeof ProjectsResponseSchema>;
