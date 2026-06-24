import type { Document } from "../types/document";
import type { Receipt, SpendCategory } from "../types/receipt";

export const filterDocuments = (
  documents: Document[],
  query: string,
  categoryId?: number
): Document[] => {
  return documents.filter((doc) => {
    if (doc.is_deleted === "Y") return false;
    const matchQuery = query
      ? doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.file_name.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchCategory = categoryId ? doc.category_id === categoryId : true;
    return matchQuery && matchCategory;
  });
};

export const filterReceipts = (
  receipts: Receipt[],
  query: string,
  categoryId?: number,
  from?: string,
  to?: string
): Receipt[] => {
  return receipts.filter((r) => {
    const matchQuery = query
      ? r.storeName.toLowerCase().includes(query.toLowerCase()) ||
        (r.memo?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        (r.paymentItem?.toLowerCase().includes(query.toLowerCase()) ?? false)
      : true;
    const matchCategory = categoryId ? r.spendCategoryId === categoryId : true;
    const matchFrom = from ? r.purchaseDate >= from : true;
    const matchTo = to ? r.purchaseDate <= to : true;
    return matchQuery && matchCategory && matchFrom && matchTo;
  });
};

export const groupReceiptsByMonth = (receipts: Receipt[]): Record<string, Receipt[]> => {
  return receipts.reduce<Record<string, Receipt[]>>((acc, r) => {
    const key = r.purchaseDate.substring(0, 7);
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});
};

export const sumByCategory = (
  receipts: Receipt[],
  categories: SpendCategory[]
): { name: string; value: number }[] => {
  const totals: Record<number, number> = {};
  receipts.forEach((r) => {
    if (r.spendCategoryId) {
      totals[r.spendCategoryId] = (totals[r.spendCategoryId] || 0) + r.totalAmount;
    }
  });
  return categories
    .map((c) => ({ name: c.name, value: totals[c.spendCategoryId] || 0 }))
    .filter((item) => item.value > 0);
};
