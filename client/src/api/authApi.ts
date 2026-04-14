import axiosClient from "./axiosClient";
import type { User, ApiResponse } from "../types/models";

interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  register: (name: string, email: string, password: string): Promise<LoginResponse> =>
    axiosClient
      .post<ApiResponse<LoginResponse>>("/auth/register", { name, email, password })
      .then((r) => r.data.data),

  login: (email: string, password: string): Promise<LoginResponse> =>
    axiosClient
      .post<ApiResponse<LoginResponse>>("/auth/login", { email, password })
      .then((r) => r.data.data),

  getMe: (): Promise<User> =>
    axiosClient.get<ApiResponse<User>>("/auth/me").then((r) => r.data.data),
};
