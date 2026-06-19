import { api } from "./api";
import type { Document } from "../types/document";

interface ApiResponse<T> {
  data: T;
}

interface DocumentApiItem {
  documentId: string;
  userId: string;
  categoryId: number;
  title: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType: "JPG" | "PNG" | null;
  fileSizeBytes: string | number;
  pageCount?: number | null;
  ocrText?: string | null;
  extractedData?: Record<string, unknown> | null;
  aiConfidence?: number | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  renewalDate?: string | null;
  isMasked: boolean;
  isFavorite: boolean;
  aiStatus: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface DocumentListData {
  items: DocumentApiItem[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

const mapDocument = (raw: DocumentApiItem): Document => ({
  document_id: raw.documentId,
  user_id: raw.userId,
  category_id: raw.categoryId,
  title: raw.title,
  file_url: raw.fileUrl ?? "",
  file_name: raw.fileName ?? "",
  file_type: raw.fileType ?? "JPG",
  file_size_bytes: Number(raw.fileSizeBytes),
  page_count: raw.pageCount ?? undefined,
  ocr_text: raw.ocrText ?? undefined,
  extracted_data: raw.extractedData ?? undefined,
  ai_confidence: raw.aiConfidence ?? undefined,
  issue_date: raw.issueDate ?? undefined,
  expiry_date: raw.expiryDate ?? undefined,
  renewal_date: raw.renewalDate ?? undefined,
  is_masked: raw.isMasked,
  is_favorite: raw.isFavorite,
  ai_status: raw.aiStatus,
  is_confirmed: raw.isConfirmed,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
  is_deleted: raw.isDeleted ? "Y" : "N",
});

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    const res = await api.get<ApiResponse<DocumentListData>>("/documents");
    return res.data.data.items.map(mapDocument);
  },

  async getDocument(id: string): Promise<Document> {
    const res = await api.get<ApiResponse<DocumentApiItem>>(`/documents/${id}`);
    return mapDocument(res.data.data);
  },

  async updateCategory(
    categoryId: number,
    body: {
      name?: string;
      defaultNotifyOffsetDays?: number;
      isSecured?: boolean;
      description?: string;
    },
  ) {
    const res = await api.patch(`/documents/categories/${categoryId}`, body);
    return res.data.data;
  },

  async updateDocument(
    id: string,
    body: {
      title?: string;
      categoryId?: number;
      issueDate?: string;
      expiryDate?: string;
      renewalDate?: string;
      extractedData?: Record<string, string>;
    },
  ): Promise<Document> {
    const res = await api.patch<ApiResponse<DocumentApiItem>>(
      `/documents/${id}`,
      body,
    );
    return mapDocument(res.data.data);
  },
};
