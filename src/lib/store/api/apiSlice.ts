import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Custom base query to handle FormData
const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      // Don't set Content-Type for FormData - browser will set it with boundary
      return headers;
    },
  });

  // If args is a string, it's a simple GET request
  if (typeof args === "string") {
    return baseQuery(args, api, extraOptions);
  }

  // Check if body is FormData
  const isFormData = args.body instanceof FormData;
  
  // If it's FormData, don't modify headers (let browser set Content-Type with boundary)
  // If it's not FormData and has a body, set Content-Type to application/json
  if (!isFormData && args.body && typeof args.body === "object") {
    return baseQuery(
      {
        ...args,
        headers: {
          "Content-Type": "application/json",
          ...(args.headers || {}),
        },
      },
      api,
      extraOptions
    );
  }

  return baseQuery(args, api, extraOptions);
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,
  tagTypes: ["Workspace", "Channel", "Project", "User", "WorkspaceMember"],
  endpoints: () => ({}),
});

