import axiosClient from "./axiosClient";
import type { ApiResponse, PaginatedProducts } from "../types/models";

export const productApi = {
  getVegetables: (page = 1, limit = 20): Promise<PaginatedProducts> =>
    axiosClient
      .get<ApiResponse<PaginatedProducts>>("/products/vegetables", {
        params: { page, limit },
      })
      .then((r) => {
        const body = r.data;
        // Handle both wrapped { data: { items, ... } } and raw array responses
        if (body?.data?.items) return body.data;
        if (Array.isArray(body?.data)) {
          return { items: body.data, total: body.data.length, page: 1, hasMore: false };
        }
        if (Array.isArray(body)) {
          return { items: body, total: body.length, page: 1, hasMore: false };
        }
        return { items: [], total: 0, page: 1, hasMore: false };
      }),

  verifyTotal: (payload: {
    productIds: string[];
    userTotalPrice: number;
    userEmail: string;
  }): Promise<ApiResponse<{ products: unknown[]; totalPrice: number }>> =>
    axiosClient.post("/verify-total", payload).then((r) => r.data),
};
