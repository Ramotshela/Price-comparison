import { useState, type FormEvent } from "react";
import { useGroceryList } from "../context/GroceryListContext";

function BudgetBar() {
  const { budget, totalPrice, isOverBudget, setBudget } = useGroceryList();
  const [input, setInput] = useState(budget?.toString() ?? "");

  const total = parseFloat(totalPrice);
  const pct = budget ? Math.min((total / budget) * 100, 100) : 0;
  const remaining = budget ? (budget - total).toFixed(2) : null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const val = parseFloat(input);
    setBudget(isNaN(val) || val <= 0 ? null : val);
  }

  function getBarClass(): string {
    if (!budget) return "";
    if (isOverBudget) return "budget__fill--over";
    if (pct >= 80) return "budget__fill--warn";
    return "budget__fill--ok";
  }

  return (
    <div className={`budget ${isOverBudget ? "budget--over" : ""}`}>
      <form className="budget__form" onSubmit={handleSubmit}>
        <label className="budget__label" htmlFor="budget-input">
          Budget (R)
        </label>
        <input
          id="budget-input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Set your budget..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="budget__input"
        />
        <button type="submit" className="btn btn--primary btn--sm">
          Set
        </button>
        {budget !== null && (
          <button
            type="button"
            className="btn btn--danger-outline btn--sm"
            onClick={() => { setBudget(null); setInput(""); }}
          >
            Clear
          </button>
        )}
      </form>

      {budget !== null && (
        <>
          <div className="budget__track">
            <div
              className={`budget__fill ${getBarClass()}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="budget__info">
            <span>R{totalPrice} of R{budget.toFixed(2)}</span>
            {isOverBudget ? (
              <span className="budget__warning">
                ⚠ Over budget by R{Math.abs(parseFloat(remaining!)).toFixed(2)}
              </span>
            ) : (
              <span className="budget__remaining">
                R{remaining} remaining
              </span>
            )}
          </div>
          {isOverBudget && (
            <div className="budget__alert" role="alert">
              🚨 You're over budget! Consider removing some items before checkout.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BudgetBar;
