import { useState, useEffect, useCallback, useRef } from "react";
import { productApi } from "../api/productApi";
import type { Product } from "../types/models";

const PAGE_SIZE = 20;

interface Filters {
  category?: string;
  shop?: string;
  search?: string;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export function useProducts(filters: Filters = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProducts([]);
    pageRef.current = 1;

    productApi
      .getProducts({ page: 1, limit: PAGE_SIZE, ...filters })
      .then((result) => {
        if (cancelled) return;
        setProducts(result.items);
        setHasMore(result.hasMore);
      })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters.category, filters.shop, filters.search]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    productApi
      .getProducts({ page: nextPage, limit: PAGE_SIZE, ...filters })
      .then((result) => {
        setProducts((prev) => [...prev, ...result.items]);
        setHasMore(result.hasMore);
        pageRef.current = nextPage;
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, filters.category, filters.shop, filters.search]);

  return { products, loading, loadingMore, error, hasMore, loadMore };
}
