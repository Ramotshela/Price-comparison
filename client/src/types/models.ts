export interface ProductId {
  $oid: string;
}

export interface Product {
  _id: ProductId | string;
  "Product Name": string;
  Price: string;
  Category?: string;
  "Image URL": string;
  "Shop Name"?: string;
}

export interface GroceryItem extends Product {
  quantity: number;
  backendItemId?: number;
}

export interface GroceryListContextValue {
  list: GroceryItem[];
  totalPrice: string;
  itemCount: number;
  budget: number | null;
  isOverBudget: boolean;
  syncing: boolean;
  addItem: (product: Product) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearList: () => void;
  setBudget: (amount: number | null) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface BackendListItem {
  id: number;
  product_id: string;
  product_name: string;
  price: string;
  image_url: string | null;
  quantity: number;
}

export interface BackendGroceryList {
  id: number;
  user_id: number;
  name: string;
  budget: string | null;
  items: BackendListItem[];
  created_at: string;
  updated_at: string;
}
