import { apiSlice } from "./apiSlice";
import { ApiKeyConfig, UserPreferences } from "@/types";

interface UpdateApiKeysPayload {
  apiKeys?: Record<string, string>;
  preferences?: UserPreferences;
}

interface UpdateApiKeysResponse {
  message: string;
  preferences: UserPreferences;
}

interface DeleteApiKeyResponse {
  message: string;
  preferences: UserPreferences;
}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApiKeys: builder.query<ApiKeyConfig, void>({
      query: () => ({
        url: "/user/api-keys",
      }),
      providesTags: [{ type: "User", id: "API_KEYS" }],
    }),
    updateApiKeys: builder.mutation<UpdateApiKeysResponse, UpdateApiKeysPayload>({
      query: (body) => ({
        url: "/user/api-keys",
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "API_KEYS" }],
    }),
    deleteApiKey: builder.mutation<DeleteApiKeyResponse, string>({
      query: (key) => ({
        url: `/user/api-keys/${key}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "API_KEYS" }],
    }),
    deleteAllApiKeys: builder.mutation<DeleteApiKeyResponse, void>({
      query: () => ({
        url: "/user/api-keys",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "API_KEYS" }],
    }),
  }),
});

export const { 
  useGetApiKeysQuery, 
  useUpdateApiKeysMutation,
  useDeleteApiKeyMutation,
  useDeleteAllApiKeysMutation,
} = userApi;
