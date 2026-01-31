import { apiSlice } from "./apiSlice";
import {
  Channel,
  ChannelsResponse,
  CreateChannelInput,
  UpdateChannelInput,
  ChannelsResponseSchema,
  ChannelSchema,
} from "@/lib/schemas";

interface ChannelsQueryParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface ChannelDetailResponse {
  channel: Channel;
  workspaces: Array<{ _id: string; name: string }>;
}

export const channelsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all channels
    getChannels: builder.query<ChannelsResponse, ChannelsQueryParams>({
      query: (params = {}) => ({
        url: "/channels",
        params: {
          search: params.search,
          isActive: params.isActive,
          page: params.page || 1,
          limit: params.limit || 20,
        },
      }),
      transformResponse: (response: unknown) => {
        const parsed = ChannelsResponseSchema.safeParse(response);
        if (!parsed.success) {
          console.error("Channels response validation error:", parsed.error);
          return { channels: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
        }
        return parsed.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.channels.map(({ _id }) => ({ type: "Channel" as const, id: _id })),
              { type: "Channel", id: "LIST" },
            ]
          : [{ type: "Channel", id: "LIST" }],
    }),

    // Get single channel
    getChannel: builder.query<ChannelDetailResponse, string>({
      query: (id) => `/channels/${id}`,
      transformResponse: (response: unknown) => {
        const data = response as ChannelDetailResponse;
        const parsed = ChannelSchema.safeParse(data.channel);
        if (!parsed.success) {
          console.error("Channel validation error:", parsed.error);
          throw new Error("Invalid channel data");
        }
        return data;
      },
      providesTags: (result, error, id) => [{ type: "Channel", id }],
    }),

    // Create channel
    createChannel: builder.mutation<{ message: string; channel: Channel }, CreateChannelInput>({
      query: (data) => ({
        url: "/channels",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Channel", id: "LIST" }],
    }),

    // Update channel
    updateChannel: builder.mutation<{ message: string; channel: Channel }, { id: string; data: UpdateChannelInput }>({
      query: ({ id, data }) => ({
        url: `/channels/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Channel", id },
        { type: "Channel", id: "LIST" },
      ],
    }),

    // Delete channel
    deleteChannel: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/channels/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Channel", id },
        { type: "Channel", id: "LIST" },
      ],
    }),

    // Connect YouTube credentials
    connectYouTube: builder.mutation<{ message: string }, { id: string; accessToken: string; refreshToken: string; expiresAt: string }>({
      query: ({ id, ...body }) => ({
        url: `/channels/${id}/connect-youtube`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Channel", id }],
    }),

    // Disconnect YouTube credentials
    disconnectYouTube: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/channels/${id}/disconnect-youtube`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Channel", id }],
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useGetChannelQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  useConnectYouTubeMutation,
  useDisconnectYouTubeMutation,
} = channelsApi;
