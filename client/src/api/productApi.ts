import axiosClient from "./axiosClient";
import type { ApiResponse, PaginatedProducts, ProductFilters } from "../types/models";

export const productApi = {
  getProducts: (params: ProductFilters = {}): Promise<PaginatedProducts> =>
    axiosClient
      .get<ApiResponse<PaginatedProducts>>("/products", { params })
      .then((r) => r.data.data),

  getFilters: (): Promise<{ categories: string[]; shops: string[] }> =>
    axiosClient
      .get<ApiResponse<{ categories: string[]; shops: string[] }>>("/products/filters")
      .then((r) => r.data.data),

  verifyTotal: (payload: {
    productIds: string[];
    userTotalPrice: number;
    userEmail: string;
  }): Promise<ApiResponse<{ products: unknown[]; totalPrice: number }>> =>
    axiosClient.post("/verify-total", payload).then((r) => r.data),
};
