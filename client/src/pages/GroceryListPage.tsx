import { useGroceryList } from "../context/GroceryListContext";
import { getProductId, parsePrice } from "../utils/helpers";
import BudgetBar from "../components/BudgetBar";

function GroceryListPage() {
  const { list, totalPrice, itemCount, increment, decrement, removeItem, clearList, syncing } =
    useGroceryList();

  if (syncing) {
    return (
      <div className="state-message">
        <div className="spinner" />
        <p>Loading your list...</p>
      </div>
    );
  }

  return (
    <main className="page">
      <div className="page__header">
        <h2 className="page__title">My Grocery List ({itemCount} items)</h2>
        {list.length > 0 && (
          <button onClick={clearList} className="btn btn--danger-outline btn--sm">
            Clear All
          </button>
        )}
      </div>

      <BudgetBar />

      {list.length === 0 ? (
        <div className="state-message">
          <p>Your grocery list is empty.</p>
          <p className="state-message__detail">Browse products and add items to get started.</p>
        </div>
      ) : (
        <>
        <div className="grocery-grid">
        {list.map((item) => {
          const id = getProductId(item)!;
          const lineTotal = (parsePrice(item.Price) * item.quantity).toFixed(2);
          return (
            <div key={id} className="grocery-card">
              <img
                src={item["Image URL"]}
                alt={item["Product Name"]}
                className="grocery-card__img"
                loading="lazy"
              />
              <div className="grocery-card__body">
                <h3 className="grocery-card__name">{item["Product Name"]}</h3>
                <p className="grocery-card__price">{item.Price}</p>
                <div className="grocery-card__qty">
                  <button
                    onClick={() => decrement(id)}
                    className="btn btn--icon"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="grocery-card__qty-value">{item.quantity}</span>
                  <button onClick={() => increment(id)} className="btn btn--icon">
                    +
                  </button>
                </div>
                <p className="grocery-card__line-total">R{lineTotal}</p>
                <button
                  onClick={() => removeItem(id)}
                  className="btn btn--danger-outline btn--sm"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

        <div className="total-bar">
          <span>Total</span>
          <span className="total-bar__price">R{totalPrice}</span>
        </div>
        </>
      )}
    </main>
  );
}

export default GroceryListPage;
