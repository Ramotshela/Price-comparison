import { useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useGroceryList } from "../context/GroceryListContext";
import { useAuth } from "../context/AuthContext";
import { getProductId } from "../utils/helpers";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/models";

interface HomePageProps {
  searchTerm: string;
}

function HomePage({ searchTerm }: HomePageProps) {
  const { products, loading, loadingMore, error, hasMore, loadMore } = useProducts();
  const { addItem } = useGroceryList();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleAdd = useCallback(
    (product: Product) => {
      if (!user) {
        navigate("/login");
        return;
      }
      addItem(product);
    },
    [user, addItem, navigate]
  );

  const filtered = useMemo(
    () =>
      (products ?? []).filter((p) =>
        p["Product Name"]?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  // Infinite scroll — observe sentinel element
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || searchTerm) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore, searchTerm]);

  if (loading) {
    return (
      <div className="state-message">
        <div className="spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-message state-message--error">
        <p>Failed to load products.</p>
        <p className="state-message__detail">{error}</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="state-message">
        <p>
          {searchTerm
            ? `No products match "${searchTerm}"`
            : "No products available."}
        </p>
      </div>
    );
  }

  return (
    <main className="page">
      <h2 className="page__title">Fresh Products</h2>
      <div className="product-grid">
        {filtered.map((veg) => (
          <ProductCard
            key={getProductId(veg) ?? undefined}
            product={veg}
            onAdd={handleAdd}
          />
        ))}
      </div>

      {/* Sentinel for infinite scroll — only when not filtering */}
      {!searchTerm && hasMore && (
        <div ref={sentinelRef} className="load-more-sentinel">
          {loadingMore && (
            <div className="state-message">
              <div className="spinner" />
            </div>
          )}
        </div>
      )}

      {!searchTerm && !hasMore && products.length > 0 && (
        <p className="end-of-list">You've seen all products</p>
      )}
    </main>
  );
}

export default HomePage;
