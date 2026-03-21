import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthResponse, LoginRequest, RefreshRequest, RegisterRequest } from "./types";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:7000/api/auth",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    // REGISTER
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: builder.mutation<any, RegisterRequest>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),

    // LOGIN
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // сохраняем токены
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
        } catch (e) {
          console.error("Login error", e);
        }
      },
    }),

    // REFRESH
    refresh: builder.mutation<AuthResponse, RefreshRequest>({
      query: (body) => ({
        url: "/refresh",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          localStorage.setItem("accessToken", data.accessToken);
        } catch (e) {
          console.error("Refresh error", e);
        }
      },
    }),

    // LOGOUT
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch (e) {
          console.error("Logout error", e);
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApi;