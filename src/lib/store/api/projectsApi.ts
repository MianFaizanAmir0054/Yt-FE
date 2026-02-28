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
        if (parsed.success) {
          return parsed.data;
        }

        const fallback = {
          projects: [] as Project[],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        };

        const raw = response as {
          projects?: unknown[];
          pagination?: { page?: number; limit?: number; total?: number; pages?: number };
        };

        if (!Array.isArray(raw?.projects)) {
          console.error("Projects response validation error:", parsed.error);
          return fallback;
        }

        const validProjects: Project[] = [];
        for (const item of raw.projects) {
          const normalizedItem = (() => {
            const candidate = { ...(item as Record<string, unknown>) };

            if (candidate.createdBy === undefined && candidate.userId !== undefined) {
              candidate.createdBy = candidate.userId;
            }

            if (candidate.workspaceId === undefined) {
              candidate.workspaceId = "";
            }

            if (candidate.channelId === undefined) {
              candidate.channelId = null;
            }

            return candidate;
          })();

          const projectParsed = ProjectSchema.safeParse(normalizedItem);
          if (projectParsed.success) {
            validProjects.push(projectParsed.data);
          }
        }

        if (validProjects.length !== raw.projects.length) {
          console.warn(
            `Filtered ${raw.projects.length - validProjects.length} invalid project(s) from response`
          );
        }

        return {
          projects: validProjects,
          pagination: {
            page: Number(raw.pagination?.page) || 1,
            limit: Number(raw.pagination?.limit) || 20,
            total: Number(raw.pagination?.total) || validProjects.length,
            pages: Number(raw.pagination?.pages) || 1,
          },
        };
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
    createProject: builder.mutation<{ message: string; project: Project }, CreateProjectInput>({
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
    generateResearch: builder.mutation<
      { message: string; researchData: unknown; script: unknown },
      { id: string; duration?: string; tone?: string }
    >({
      query: ({ id, duration, tone }) => ({
        url: `/projects/${id}/research`,
        method: "POST",
        body: { duration, tone },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),

    // Generate script/timeline (add scene)
    generateTimeline: builder.mutation<
      { message: string; scene: unknown; timeline: unknown },
      { id: string; afterSceneId?: string; scene?: unknown }
    >({
      query: ({ id, afterSceneId, scene }) => ({
        url: `/projects/${id}/timeline`,
        method: "POST",
        body: { afterSceneId, scene },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),

    // Generate images
    generateImages: builder.mutation<
      { message: string; results: unknown; timeline: unknown },
      { id: string; provider?: "pexels" | "segmind"; styleGuide?: string }
    >({
      query: ({ id, provider, styleGuide }) => ({
        url: `/projects/${id}/images`,
        method: "POST",
        body: { provider, styleGuide },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),

    // Upload voiceover (uses FormData)
    uploadVoiceover: builder.mutation<
      { message: string; voiceover: unknown; timeline: unknown },
      { id: string; audioFile: File }
    >({
      query: ({ id, audioFile }) => {
        const formData = new FormData();
        formData.append("audio", audioFile);
        return {
          url: `/projects/${id}/voiceover`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),

    // Generate/assemble video
    generateVideo: builder.mutation<
      { message: string; output: unknown },
      { id: string; subtitleStyle?: unknown }
    >({
      query: ({ id, subtitleStyle }) => ({
        url: `/projects/${id}/generate`,
        method: "POST",
        body: { subtitleStyle },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
    }),

    // Generate AI scene videos (Replicate minimax/video-01)
    generateSceneVideos: builder.mutation<
      { message: string; results: Array<{ sceneId: string; success: boolean; error?: string }>; timeline: unknown },
      { id: string; resolution?: "480p" | "720p"; useExisting?: boolean }
    >({
      query: ({ id, resolution, useExisting }) => ({
        url: `/projects/${id}/scene-videos`,
        method: "POST",
        body: { resolution, useExisting },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
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

    // Delete timeline scene
    deleteTimelineScene: builder.mutation<
      { message: string; timeline: unknown },
      { projectId: string; sceneId: string }
    >({
      query: ({ projectId, sceneId }) => ({
        url: `/projects/${projectId}/timeline/${sceneId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: "Project", id: projectId }],
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
  useUploadVoiceoverMutation,
  useGenerateVideoMutation,
  useGenerateSceneVideosMutation,
  useUpdateTimelineMutation,
  useDeleteTimelineSceneMutation,
} = projectsApi;
