import { useEffect, useState } from "react";
import { getSpendCategories } from "../api/spendCategories";
import type { SpendCategory } from "../types/receipt";

let cache: SpendCategory[] | null = null;

export function useSpendCategories() {
  const [categories, setCategories] = useState<SpendCategory[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    getSpendCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        cache = list;
        setCategories(list);
      })
      .catch(() => {
        cache = [];
      });
  }, []);

  return categories;
}
