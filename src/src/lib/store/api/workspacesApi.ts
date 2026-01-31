import { apiSlice } from "./apiSlice";
import {
  Workspace,
  WorkspacesResponse,
  WorkspaceDetailResponse,
  MembersResponse,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberInput,
  WorkspacesResponseSchema,
  WorkspaceDetailResponseSchema,
  MembersResponseSchema,
} from "@/lib/schemas";

interface WorkspacesQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface MembersQueryParams {
  workspaceId: string;
  status?: "pending" | "accepted" | "rejected" | "removed" | "all";
}

export const workspacesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all workspaces with pagination
    getWorkspaces: builder.query<WorkspacesResponse, WorkspacesQueryParams>({
      query: (params = {}) => ({
        url: "/workspaces",
        params: {
          search: params.search,
          page: params.page || 1,
          limit: params.limit || 20,
        },
      }),
      transformResponse: (response: unknown) => {
        const parsed = WorkspacesResponseSchema.safeParse(response);
        if (!parsed.success) {
          console.error("Workspace response validation error:", parsed.error);
          // Return empty response on validation error
          return { workspaces: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
        }
        return parsed.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.workspaces.map(({ _id }) => ({ type: "Workspace" as const, id: _id })),
              { type: "Workspace", id: "LIST" },
            ]
          : [{ type: "Workspace", id: "LIST" }],
    }),

    // Get single workspace details
    getWorkspace: builder.query<WorkspaceDetailResponse, string>({
      query: (id) => `/workspaces/${id}`,
      transformResponse: (response: unknown) => {
        const parsed = WorkspaceDetailResponseSchema.safeParse(response);
        if (!parsed.success) {
          console.error("Workspace detail validation error:", parsed.error);
          throw new Error("Invalid workspace data");
        }
        return parsed.data;
      },
      providesTags: (result, error, id) => [{ type: "Workspace", id }],
    }),

    // Create workspace
    createWorkspace: builder.mutation<{ message: string; workspace: Workspace }, CreateWorkspaceInput>({
      query: (data) => ({
        url: "/workspaces",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Workspace", id: "LIST" }],
    }),

    // Update workspace
    updateWorkspace: builder.mutation<{ message: string; workspace: Workspace }, { id: string; data: UpdateWorkspaceInput }>({
      query: ({ id, data }) => ({
        url: `/workspaces/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Workspace", id },
        { type: "Workspace", id: "LIST" },
      ],
    }),

    // Delete workspace
    deleteWorkspace: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/workspaces/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Workspace", id },
        { type: "Workspace", id: "LIST" },
      ],
    }),

    // Add channels to workspace
    addChannelsToWorkspace: builder.mutation<{ message: string; workspace: Workspace }, { id: string; channelIds: string[] }>({
      query: ({ id, channelIds }) => ({
        url: `/workspaces/${id}/channels`,
        method: "POST",
        body: { channelIds },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Workspace", id },
        { type: "Channel", id: "LIST" },
      ],
    }),

    // Remove channel from workspace
    removeChannelFromWorkspace: builder.mutation<{ message: string; workspace: Workspace }, { workspaceId: string; channelId: string }>({
      query: ({ workspaceId, channelId }) => ({
        url: `/workspaces/${workspaceId}/channels/${channelId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "Workspace", id: workspaceId },
        { type: "Channel", id: "LIST" },
      ],
    }),

    // Get workspace members
    getWorkspaceMembers: builder.query<MembersResponse, MembersQueryParams>({
      query: ({ workspaceId, status }) => ({
        url: `/workspaces/${workspaceId}/members`,
        params: status ? { status } : undefined,
      }),
      transformResponse: (response: unknown) => {
        const parsed = MembersResponseSchema.safeParse(response);
        if (!parsed.success) {
          console.error("Members response validation error:", parsed.error);
          return { owner: null, members: [], canManage: false };
        }
        return parsed.data;
      },
      providesTags: (result, error, { workspaceId }) => [
        { type: "WorkspaceMember", id: workspaceId },
      ],
    }),

    // Invite member to workspace
    inviteMember: builder.mutation<{ message: string; membership: unknown }, { workspaceId: string; data: InviteMemberInput }>({
      query: ({ workspaceId, data }) => ({
        url: `/workspaces/${workspaceId}/members/invite`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "WorkspaceMember", id: workspaceId },
      ],
    }),

    // Update member
    updateMember: builder.mutation<{ message: string; membership: unknown }, { workspaceId: string; memberId: string; data: UpdateMemberInput }>({
      query: ({ workspaceId, memberId, data }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "WorkspaceMember", id: workspaceId },
      ],
    }),

    // Remove member
    removeMember: builder.mutation<{ message: string }, { workspaceId: string; memberId: string }>({
      query: ({ workspaceId, memberId }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: "WorkspaceMember", id: workspaceId },
      ],
    }),

    // Leave workspace
    leaveWorkspace: builder.mutation<{ message: string }, string>({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}/leave`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Workspace", id: "LIST" }],
    }),

    // Accept invite
    acceptInvite: builder.mutation<{ message: string; workspace: { id: string; name: string } }, string>({
      query: (token) => ({
        url: "/workspaces/accept-invite",
        method: "POST",
        body: { token },
      }),
      invalidatesTags: [{ type: "Workspace", id: "LIST" }],
    }),

    // Decline invite
    declineInvite: builder.mutation<{ message: string }, string>({
      query: (token) => ({
        url: "/workspaces/decline-invite",
        method: "POST",
        body: { token },
      }),
    }),

    // Get channels user has access to in workspace
    getWorkspaceChannelAccess: builder.query<{ channels: unknown[]; fullAccess: boolean }, string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/channels-access`,
      providesTags: (result, error, workspaceId) => [
        { type: "Workspace", id: workspaceId },
        { type: "Channel", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useAddChannelsToWorkspaceMutation,
  useRemoveChannelFromWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useLeaveWorkspaceMutation,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
  useGetWorkspaceChannelAccessQuery,
} = workspacesApi;
