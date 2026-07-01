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

export const createReceipt = (body: CreateReceiptBody, image?: File) => {
  if (image) {
    const formData = new FormData();
    (Object.entries(body) as [string, unknown][]).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });
    formData.append("image", image);
    return client
      .post<Receipt>("/receipts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  }
  return client.post<Receipt>("/receipts", body).then((r) => r.data);
};

export const updateReceipt = (id: string, body: UpdateReceiptBody) =>
  client.patch<Receipt>(`/receipts/${id}`, body).then((r) => r.data);

export const deleteReceipt = (id: string) =>
  client.delete(`/receipts/${id}`);
