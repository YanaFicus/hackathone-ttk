import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthResponse, LoginRequest, RefreshRequest, RegisterRequest } from "./types";

const saveUserData = (data: AuthResponse) => {
  localStorage.setItem("accessToken", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);
  
  // Сохраняем информацию о пользователе
  const userInfo = {
    userId: data.userId,
    login: data.login,
    fullName: data.fullName,
    roles: data.roles,
  };
  localStorage.setItem("user", JSON.stringify(userInfo));
  
  console.log("User data saved:", userInfo);
};

const clearUserData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const baseQuery = fetchBaseQuery({
  baseUrl: "http://95.174.104.223:7401/api/auth",
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
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body: {
          Login: body.username,
          FullName: body.fullName,
          Password: body.password,
          ConfirmPassword: body.confirmPassword,
        },
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Сохраняем данные пользователя после успешной регистрации
          saveUserData(data);
        } catch (e) {
          console.error("Register error", e);
        }
      },
    }),

    // LOGIN
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body: {
          Login: body.username,
          Password: body.password
        },
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          saveUserData(data);
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

          localStorage.setItem("accessToken", data.token);
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
          clearUserData();
        } catch (e) {
          console.error("Logout error", e);
          clearUserData();
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