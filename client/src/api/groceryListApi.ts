import axiosClient from "./axiosClient";
import type { ApiResponse, BackendGroceryList, BackendListItem } from "../types/models";

export const groceryListApi = {
  getLists: (): Promise<BackendGroceryList[]> =>
    axiosClient.get<ApiResponse<BackendGroceryList[]>>("/lists").then((r) => r.data.data),

  getList: (id: number): Promise<BackendGroceryList> =>
    axiosClient.get<ApiResponse<BackendGroceryList>>(`/lists/${id}`).then((r) => r.data.data),

  createList: (name?: string, budget?: number | null): Promise<BackendGroceryList> =>
    axiosClient.post<ApiResponse<BackendGroceryList>>("/lists", { name, budget }).then((r) => r.data.data),

  updateBudget: (listId: number, budget: number | null): Promise<BackendGroceryList> =>
    axiosClient.patch<ApiResponse<BackendGroceryList>>(`/lists/${listId}/budget`, { budget }).then((r) => r.data.data),

  deleteList: (listId: number): Promise<void> =>
    axiosClient.delete(`/lists/${listId}`).then(() => undefined),

  addItem: (listId: number, item: {
    product_id: string;
    product_name: string;
    price: string;
    image_url?: string;
    quantity?: number;
  }): Promise<BackendListItem> =>
    axiosClient.post<ApiResponse<BackendListItem>>(`/lists/${listId}/items`, item).then((r) => r.data.data),

  updateItemQuantity: (listId: number, itemId: number, quantity: number): Promise<BackendListItem> =>
    axiosClient.patch<ApiResponse<BackendListItem>>(`/lists/${listId}/items/${itemId}`, { quantity }).then((r) => r.data.data),

  removeItem: (listId: number, itemId: number): Promise<void> =>
    axiosClient.delete(`/lists/${listId}/items/${itemId}`).then(() => undefined),
};
