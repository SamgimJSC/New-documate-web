import type { AiStatus } from "./common";

export type ReceiptInputMethod = "OCR" | "MANUAL";

export interface SpendCategory {
  spendCategoryId: number;
  name: string;
  icon?: string;
}

export interface Receipt {
  receiptId: string;
  userId: string;
  inputMethod: ReceiptInputMethod;
  storeName: string;
  totalAmount: number;
  purchaseDate: string;
  spendCategoryId: number | null;
  categoryName?: string;
  icon?: string;
  fileUrl?: string | null;
  storeAddress?: string | null;
  paymentItem?: string | null;
  memo?: string | null;
  ocrText?: string;
  extractedData?: Record<string, unknown>;
  aiStatus: AiStatus;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptListResponse {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
  receipts: Receipt[];
}

export interface CreateReceiptBody {
  inputMethod: ReceiptInputMethod;
  storeName: string;
  totalAmount: number;
  purchaseDate: string;
  spendCategoryId?: number | null;
  fileUrl?: string;
  storeAddress?: string;
  paymentItem?: string;
  memo?: string;
  isConfirmed?: boolean;
}

export interface UpdateReceiptBody {
  storeName?: string;
  totalAmount?: number;
  purchaseDate?: string;
  spendCategoryId?: number | null;
  storeAddress?: string;
  paymentItem?: string;
  memo?: string | null;
  isConfirmed?: boolean;
}

export interface ReceiptListParams {
  year?: number;
  month?: number;
  date?: string;
  fromDate?: string;
  toDate?: string;
  categoryId?: number;
  keyword?: string;
  sort?: "latest" | "purchaseDate" | "amountDesc" | "amountAsc";
  page?: number;
  size?: number;
}
