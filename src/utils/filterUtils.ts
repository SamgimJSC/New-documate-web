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
    if (r.is_deleted === "Y") return false;
    const matchQuery = query
      ? r.store_name.toLowerCase().includes(query.toLowerCase()) ||
        (r.memo?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        (r.payment_item?.toLowerCase().includes(query.toLowerCase()) ?? false)
      : true;
    const matchCategory = categoryId ? r.spend_category_id === categoryId : true;
    const matchFrom = from ? r.purchase_date >= from : true;
    const matchTo = to ? r.purchase_date <= to : true;
    return matchQuery && matchCategory && matchFrom && matchTo;
  });
};

export const groupReceiptsByMonth = (receipts: Receipt[]): Record<string, Receipt[]> => {
  return receipts.reduce<Record<string, Receipt[]>>((acc, r) => {
    const key = r.purchase_date.substring(0, 7);
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
    totals[r.spend_category_id] = (totals[r.spend_category_id] || 0) + r.total_amount;
  });
  return categories
    .map((c) => ({ name: c.name, value: totals[c.spend_category_id] || 0 }))
    .filter((item) => item.value > 0);
};
