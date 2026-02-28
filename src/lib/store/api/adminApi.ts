import { apiSlice } from "./apiSlice";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "collaborator";
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminUsersResponse {
  users: AdminUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AdminUsersQueryParams {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface CreateAdminUserPayload {
  name: string;
  email: string;
  password: string;
  role: "admin" | "collaborator";
}

interface UpdateAdminUserPayload {
  id: string;
  data: {
    name?: string;
    email?: string;
    role?: "admin" | "collaborator";
    isActive?: boolean;
  };
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUsersResponse, AdminUsersQueryParams>({
      query: (params = {}) => ({
        url: "/admin/users",
        params: {
          role: params.role,
          search: params.search,
          page: params.page || 1,
          limit: params.limit || 50,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ _id }) => ({ type: "User" as const, id: _id })),
              { type: "User", id: "ADMIN_LIST" },
            ]
          : [{ type: "User", id: "ADMIN_LIST" }],
    }),
    createAdminUser: builder.mutation<{ message: string; user: AdminUser }, CreateAdminUserPayload>({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "ADMIN_LIST" }],
    }),
    updateAdminUser: builder.mutation<{ message: string; user: AdminUser }, UpdateAdminUserPayload>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "ADMIN_LIST" },
      ],
    }),
    deleteAdminUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "ADMIN_LIST" },
      ],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} = adminApi;
