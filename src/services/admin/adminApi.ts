import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ChangePasswordRequest, GetUsersRequest, UpdateUserRequest, UserDto } from "./types";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:7000/api/admin/users",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // Получение списка пользователей
    getUsers: builder.query<UserDto[], GetUsersRequest>({
      query: (params) => ({
        url: "",
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
    }),

    // Обновление пользователя
    updateUser: builder.mutation<UserDto, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),

    // Смена пароля
    changePassword: builder.mutation<void, { id: string; data: ChangePasswordRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}/password`,
        method: "PUT",
        body: data,
      }),
    }),

    // Удаление пользователя
    deleteUser: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useDeleteUserMutation,
} = adminApi;