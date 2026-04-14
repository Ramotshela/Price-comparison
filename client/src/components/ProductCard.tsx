import type { Product } from "../types/models";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-card__img-wrapper">
        <img
          src={product["Image URL"]}
          alt={product["Product Name"]}
          className="product-card__img"
          loading="lazy"
        />
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">{product["Product Name"]}</h3>
        <p className="product-card__price">{product.Price}</p>
        <button onClick={() => onAdd(product)} className="btn btn--primary">
          + Add to List
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
