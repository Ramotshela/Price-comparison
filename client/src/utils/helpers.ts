import type { Product } from "../types/models";

export function getProductId(product: Product): string | null {
  if (!product?._id) return null;
  if (typeof product._id === "string") return product._id;
  if (product._id.$oid) return product._id.$oid;
  return String(product._id);
}

export function parsePrice(priceStr: string | number | undefined): number {
  if (typeof priceStr === "number") return priceStr;
  if (typeof priceStr !== "string") return 0;
  return parseFloat(priceStr.replace(/[R,\s]/g, "")) || 0;
}
