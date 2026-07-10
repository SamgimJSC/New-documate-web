import { api } from "./api";
import type { Receipt, ReceiptInputMethod } from "../types/receipt";
import type { AiStatus } from "../types/common";

interface ReceiptApiItem {
  receiptId: string;
  userId: string;
  spendCategoryId: number;
  inputMethod: ReceiptInputMethod;
  fileUrl?: string;
  storeName: string;
  storeAddress?: string;
  totalAmount: number;
  purchaseDate: string;
  paymentItem?: string;
  memo?: string;
  ocrText?: string;
  extractedData?: Record<string, unknown>;
  aiStatus: AiStatus;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface ReceiptListData {
  receipts: ReceiptApiItem[];
  totalCount: number;
  totalPages: number;
  page: number;
  size: number;
}

interface ApiResponse<T> {
  message: string;
  statusCode: number;
  error: string;
  errorCode: string;
  data: T;
}

export interface GetReceiptsParams {
  page?: number;
  size?: number;
  query?: string;
  spendCategoryId?: number;
  fromDate?: string;
  toDate?: string;
  sort?: string;
}

export interface ReceiptSummary {
  totalAmount: number;
  count: number;
  topCategory: { name: string; icon: string } | null;
}

export interface CreateReceiptBody {
  storeName: string;
  totalAmount: number;
  purchaseDate: string;
  spendCategoryId?: number;
  storeAddress?: string;
  paymentItem?: string;
  memo?: string;
  inputMethod?: ReceiptInputMethod;
}

export type UpdateReceiptBody = Partial<CreateReceiptBody>;

const mapReceipt = (raw: ReceiptApiItem): Receipt => ({
  receipt_id: raw.receiptId,
  user_id: raw.userId,
  spend_category_id: raw.spendCategoryId,
  input_method: raw.inputMethod,
  file_url: raw.fileUrl,
  store_name: raw.storeName,
  store_address: raw.storeAddress,
  total_amount: raw.totalAmount,
  purchase_date: raw.purchaseDate,
  payment_item: raw.paymentItem,
  memo: raw.memo,
  ocr_text: raw.ocrText,
  extracted_data: raw.extractedData,
  ai_status: raw.aiStatus,
  is_confirmed: raw.isConfirmed,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
  is_deleted: raw.isDeleted ? "Y" : "N",
});

export const receiptService = {
  async getReceipts(
    params?: GetReceiptsParams,
  ): Promise<{ items: Receipt[]; totalCount: number }> {
    const res = await api.get<ApiResponse<ReceiptListData>>("/receipts", { params });
    const { receipts, totalCount } = res.data.data;
    return { items: receipts.map(mapReceipt), totalCount };
  },

  async getSummary(year: number, month: number): Promise<ReceiptSummary> {
    const res = await api.get<ApiResponse<ReceiptSummary>>("/receipts/summary", {
      params: { year, month },
    });
    return res.data.data;
  },

  async getReceipt(id: string): Promise<Receipt> {
    const res = await api.get<ApiResponse<ReceiptApiItem>>(`/receipts/${id}`);
    return mapReceipt(res.data.data);
  },

  async createReceipt(body: CreateReceiptBody): Promise<Receipt> {
    const res = await api.post<ApiResponse<ReceiptApiItem>>("/receipts", body);
    return mapReceipt(res.data.data);
  },

  async updateReceipt(id: string, body: UpdateReceiptBody): Promise<Receipt> {
    const res = await api.patch<ApiResponse<ReceiptApiItem>>(`/receipts/${id}`, body);
    return mapReceipt(res.data.data);
  },

  async deleteReceipt(id: string): Promise<void> {
    await api.delete(`/receipts/${id}`);
  },
};
