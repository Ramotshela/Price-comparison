import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { getProductId, parsePrice } from "../utils/helpers";
import { useAuth } from "./AuthContext";
import { groceryListApi } from "../api/groceryListApi";
import type {
  Product,
  GroceryItem,
  GroceryListContextValue,
  BackendGroceryList,
  BackendListItem,
} from "../types/models";

const GroceryListContext = createContext<GroceryListContextValue | null>(null);

function backendItemToGroceryItem(bi: BackendListItem): GroceryItem {
  return {
    _id: bi.product_id,
    "Product Name": bi.product_name,
    Price: bi.price,
    "Image URL": bi.image_url ?? "",
    quantity: bi.quantity,
    backendItemId: bi.id,
  };
}

export function GroceryListProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [list, setList] = useState<GroceryItem[]>([]);
  const [budget, setBudgetState] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const activeListId = useRef<number | null>(null);

  // Load list from backend when user logs in, clear when they log out
  useEffect(() => {
    if (!user) {
      setList([]);
      setBudgetState(null);
      activeListId.current = null;
      return;
    }

    setSyncing(true);
    groceryListApi
      .getLists()
      .then((lists) => {
        if (lists.length > 0) {
          const active = lists[0];
          activeListId.current = active.id;
          setList(active.items.map(backendItemToGroceryItem));
          setBudgetState(active.budget ? parseFloat(active.budget) : null);
        } else {
          return groceryListApi.createList("My List").then((newList) => {
            activeListId.current = newList.id;
            setList([]);
            setBudgetState(null);
          });
        }
      })
      .catch((err) => console.error("Failed to load grocery list:", err))
      .finally(() => setSyncing(false));
  }, [user]);

  const totalPrice = useMemo(
    () =>
      list
        .reduce((sum, item) => sum + parsePrice(item.Price) * item.quantity, 0)
        .toFixed(2),
    [list]
  );

  const itemCount = useMemo(
    () => list.reduce((sum, item) => sum + item.quantity, 0),
    [list]
  );

  const isOverBudget = useMemo(
    () => budget !== null && parseFloat(totalPrice) > budget,
    [totalPrice, budget]
  );

  const setBudget = useCallback((amount: number | null) => {
    const val = amount !== null && amount > 0 ? amount : null;
    setBudgetState(val);
    if (activeListId.current) {
      groceryListApi.updateBudget(activeListId.current, val).catch(console.error);
    }
  }, []);

  const addItem = useCallback((product: Product) => {
    const pid = getProductId(product);
    if (!pid || !activeListId.current) return;

    groceryListApi
      .addItem(activeListId.current, {
        product_id: pid,
        product_name: product["Product Name"],
        price: product.Price,
        image_url: product["Image URL"],
        quantity: 1,
      })
      .then((backendItem) => {
        setList((prev) => {
          const idx = prev.findIndex((i) => getProductId(i) === pid);
          if (idx >= 0) {
            return prev.map((i) =>
              getProductId(i) === pid
                ? { ...i, quantity: backendItem.quantity, backendItemId: backendItem.id }
                : i
            );
          }
          return [...prev, backendItemToGroceryItem(backendItem)];
        });
      })
      .catch(console.error);
  }, []);

  const increment = useCallback((id: string) => {
    setList((prev) => {
      const item = prev.find((i) => getProductId(i) === id);
      if (!item?.backendItemId || !activeListId.current) return prev;

      const newQty = item.quantity + 1;
      groceryListApi
        .updateItemQuantity(activeListId.current!, item.backendItemId, newQty)
        .catch(console.error);

      return prev.map((i) =>
        getProductId(i) === id ? { ...i, quantity: newQty } : i
      );
    });
  }, []);

  const decrement = useCallback((id: string) => {
    setList((prev) => {
      const item = prev.find((i) => getProductId(i) === id);
      if (!item?.backendItemId || !activeListId.current || item.quantity <= 1) return prev;

      const newQty = item.quantity - 1;
      groceryListApi
        .updateItemQuantity(activeListId.current!, item.backendItemId, newQty)
        .catch(console.error);

      return prev.map((i) =>
        getProductId(i) === id ? { ...i, quantity: newQty } : i
      );
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setList((prev) => {
      const item = prev.find((i) => getProductId(i) === id);
      if (item?.backendItemId && activeListId.current) {
        groceryListApi
          .removeItem(activeListId.current, item.backendItemId)
          .catch(console.error);
      }
      return prev.filter((i) => getProductId(i) !== id);
    });
  }, []);

  const clearList = useCallback(() => {
    if (activeListId.current) {
      groceryListApi.deleteList(activeListId.current).then(() => {
        groceryListApi.createList("My List").then((newList) => {
          activeListId.current = newList.id;
        });
      }).catch(console.error);
    }
    setList([]);
    setBudgetState(null);
  }, []);

  return (
    <GroceryListContext.Provider
      value={{
        list, totalPrice, itemCount, budget, isOverBudget, syncing,
        addItem, increment, decrement, removeItem, clearList, setBudget,
      }}
    >
      {children}
    </GroceryListContext.Provider>
  );
}

export function useGroceryList(): GroceryListContextValue {
  const ctx = useContext(GroceryListContext);
  if (!ctx) throw new Error("useGroceryList must be used within GroceryListProvider");
  return ctx;
}
