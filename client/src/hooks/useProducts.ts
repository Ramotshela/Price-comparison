import { useState, useEffect, useCallback, useRef } from "react";
import { productApi } from "../api/productApi";
import type { Product } from "../types/models";

const PAGE_SIZE = 20;

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);

  useEffect(() => {
    let cancelled = false;
    productApi
      .getVegetables(1, PAGE_SIZE)
      .then((result) => {
        if (cancelled) return;
        setProducts(result.items);
        setHasMore(result.hasMore);
        pageRef.current = 1;
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    productApi
      .getVegetables(nextPage, PAGE_SIZE)
      .then((result) => {
        setProducts((prev) => [...prev, ...result.items]);
        setHasMore(result.hasMore);
        pageRef.current = nextPage;
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore]);

  return { products, loading, loadingMore, error, hasMore, loadMore };
}
