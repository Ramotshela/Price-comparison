import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useGroceryList } from "../context/GroceryListContext";
import { useAuth } from "../context/AuthContext";
import { productApi } from "../api/productApi";
import { getProductId } from "../utils/helpers";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/models";

interface HomePageProps {
  searchTerm: string;
}

function HomePage({ searchTerm }: HomePageProps) {
  const [category, setCategory] = useState("");
  const [shop, setShop] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [shops, setShops] = useState<string[]>([]);

  const filters = useMemo(
    () => ({ category: category || undefined, shop: shop || undefined, search: searchTerm || undefined }),
    [category, shop, searchTerm]
  );

  const { products, loading, loadingMore, error, hasMore, loadMore } = useProducts(filters);
  const { addItem, budget, totalPrice, isOverBudget } = useGroceryList();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productApi.getFilters().then((f) => {
      setCategories(f.categories.filter(Boolean).sort());
      setShops(f.shops.filter(Boolean).sort());
    }).catch(() => {});
  }, []);

  const handleAdd = useCallback(
    (product: Product) => {
      if (!user) { navigate("/login"); return; }
      addItem(product);
    },
    [user, addItem, navigate]
  );

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      {budget !== null && (
        <button
          className={`budget__summary ${isOverBudget ? "budget__summary--over" : ""}`}
          onClick={() => navigate("/list")}
        >
          {isOverBudget
            ? `🚨 Over budget — R${totalPrice} of R${budget.toFixed(2)}`
            : `💰 R${totalPrice} of R${budget.toFixed(2)} spent`}
        </button>
      )}
      <div className="hero">
        <div className="hero__eyebrow">🛒 Compare &amp; Save</div>
        <h1 className="hero__title">Compare prices,<br /><span>save more</span></h1>
        <p className="hero__sub">Browse products across stores and build your grocery list in seconds.</p>
      </div>

      <main className="page" style={{ paddingTop: 0 }}>
        <div className="filters">
          <span className="filters__label">Category</span>
          <button
            className={`filter-chip ${category === "" ? "filter-chip--active" : ""}`}
            onClick={() => setCategory("")}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`filter-chip ${category === c ? "filter-chip--active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}

          {shops.length > 0 && <div className="filters__divider" />}

          {shops.length > 0 && (
            <div className="filter-select-wrapper">
              <select
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                className={`filter-select ${shop ? "filter-select--active" : ""}`}
              >
                <option value="">All Stores</option>
                {shops.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="state-message"><div className="spinner" /><p>Loading products...</p></div>
        ) : error ? (
          <div className="state-message state-message--error">
            <p>Failed to load products.</p>
            <p className="state-message__detail">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="state-message">
            <p>{searchTerm ? `No products match "${searchTerm}"` : "No products available."}</p>
          </div>
        ) : (
          <>
            <h2 className="page__title">
              {category || "All Products"}
              {shop && <span className="page__title-sub"> — {shop}</span>}
            </h2>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={getProductId(p) ?? undefined} product={p} onAdd={handleAdd} />
              ))}
            </div>
            <div ref={sentinelRef} className="load-more-sentinel">
              {loadingMore && <div className="state-message"><div className="spinner" /></div>}
            </div>
            {!hasMore && products.length > 0 && (
              <p className="end-of-list">You've seen all products</p>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default HomePage;
