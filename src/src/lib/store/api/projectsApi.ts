import { apiSlice } from "./apiSlice";
import {
  Project,
  ProjectsResponse,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectsResponseSchema,
  ProjectSchema,
} from "@/lib/schemas";

interface ProjectsQueryParams {
  workspaceId?: string;
  channelId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ProjectDetailResponse {
  project: Project & {
    research?: unknown;
    script?: unknown;
    voiceover?: unknown;
    timeline?: unknown;
    output?: unknown;
  };
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
  };
}

export const projectsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all projects
    getProjects: builder.query<ProjectsResponse, ProjectsQueryParams>({
      query: (params = {}) => ({
        url: "/projects",
        params: {
          workspaceId: params.workspaceId,
          channelId: params.channelId,
          status: params.status,
          search: params.search,
          page: params.page || 1,
          limit: params.limit || 20,
        },
      }),
      transformResponse: (response: unknown) => {
        const parsed = ProjectsResponseSchema.safeParse(response);
        if (!parsed.success) {
          console.error("Projects response validation error:", parsed.error);
          return { projects: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
        }
        return parsed.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.projects.map(({ _id }) => ({ type: "Project" as const, id: _id })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),

    // Get single project
    getProject: builder.query<ProjectDetailResponse, string>({
      query: (id) => `/projects/${id}`,
      transformResponse: (response: unknown) => {
        const data = response as ProjectDetailResponse;
        const parsed = ProjectSchema.safeParse(data.project);
        if (!parsed.success) {
          console.error("Project validation error:", parsed.error);
          // Still return data even if validation fails for some fields
        }
        return data;
      },
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    // Create project
    createProject: builder.mutation<{ message: string; project: { id: string; title: string; status: string; requiresApproval: boolean } }, CreateProjectInput>({
      query: (data) => ({
        url: "/projects",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),

    // Update project
    updateProject: builder.mutation<{ message: string; project: Project }, { id: string; data: UpdateProjectInput }>({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),

    // Delete project
    deleteProject: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),

    // Approve project
    approveProject: builder.mutation<{ message: string; project: Project }, string>({
      query: (id) => ({
        url: `/projects/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),

    // Reject project
    rejectProject: builder.mutation<{ message: string; project: Project }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/projects/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),

    // Generate research
    generateResearch: builder.mutation<{ message: string; research: unknown }, string>({
      query: (id) => ({
        url: `/projects/${id}/research`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    // Generate script/timeline
    generateTimeline: builder.mutation<{ message: string; timeline: unknown }, string>({
      query: (id) => ({
        url: `/projects/${id}/timeline`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    // Generate images
    generateImages: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/projects/${id}/images`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    // Generate voiceover
    generateVoiceover: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/projects/${id}/voiceover`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    // Generate/assemble video
    generateVideo: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/projects/${id}/generate`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    // Update timeline
    updateTimeline: builder.mutation<{ message: string; timeline: unknown }, { id: string; timeline: unknown }>({
      query: ({ id, timeline }) => ({
        url: `/projects/${id}/timeline`,
        method: "PUT",
        body: { timeline },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useApproveProjectMutation,
  useRejectProjectMutation,
  useGenerateResearchMutation,
  useGenerateTimelineMutation,
  useGenerateImagesMutation,
  useGenerateVoiceoverMutation,
  useGenerateVideoMutation,
  useUpdateTimelineMutation,
} = projectsApi;
