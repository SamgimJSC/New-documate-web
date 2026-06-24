import client from "./client";
import type {
  Receipt,
  ReceiptListResponse,
  CreateReceiptBody,
  UpdateReceiptBody,
  ReceiptListParams,
} from "../types/receipt";

export const getReceipts = (params?: ReceiptListParams) =>
  client.get<ReceiptListResponse>("/receipts", { params }).then((r) => r.data);

export const getReceipt = (id: string) =>
  client.get<Receipt>(`/receipts/${id}`).then((r) => r.data);

export const createReceipt = (body: CreateReceiptBody) =>
  client.post<Receipt>("/receipts", body).then((r) => r.data);

export const updateReceipt = (id: string, body: UpdateReceiptBody) =>
  client.patch<Receipt>(`/receipts/${id}`, body).then((r) => r.data);

export const deleteReceipt = (id: string) =>
  client.delete(`/receipts/${id}`);
