import client from "./client";
import type { SpendCategory } from "../types/receipt";

export const getSpendCategories = () =>
  client.get<SpendCategory[]>("/spend-categories").then((r) => r.data);
