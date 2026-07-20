import axiosClient from "./axiosClient";
import type { User, ApiResponse } from "../types/models";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  register: (name: string, email: string, password: string): Promise<AuthTokens> =>
    axiosClient
      .post<ApiResponse<AuthTokens>>("/auth/register", { name, email, password })
      .then((r) => r.data.data),

  login: (email: string, password: string): Promise<AuthTokens> =>
    axiosClient
      .post<ApiResponse<AuthTokens>>("/auth/login", { email, password })
      .then((r) => r.data.data),

  refresh: (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> =>
    axiosClient
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>("/auth/refresh", { refreshToken })
      .then((r) => r.data.data),

  logout: (refreshToken: string): Promise<void> =>
    axiosClient.post("/auth/logout", { refreshToken }).then(() => undefined),

  getMe: (): Promise<User> =>
    axiosClient.get<ApiResponse<User>>("/auth/me").then((r) => r.data.data),

  updateProfile: (fields: { name?: string; email?: string }): Promise<User> =>
    axiosClient
      .patch<ApiResponse<User>>("/auth/profile", fields)
      .then((r) => r.data.data),

  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    axiosClient
      .patch("/auth/password", { currentPassword, newPassword })
      .then(() => undefined),
};
