import { api } from "./api";
import type { Document, DocumentCategory, DocumentTagItem } from "../types/document";

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
  documentTags?: Array<{ tag: { tagId: string; name: string } }>;
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
  tags: (raw.documentTags ?? []).map(
    (t): DocumentTagItem => ({ tag_id: t.tag.tagId, name: t.tag.name }),
  ),
});

export const documentService = {
  async getCategories(): Promise<DocumentCategory[]> {
    const res = await api.get<ApiResponse<Array<{
      categoryId: number;
      code: string;
      name: string;
      defaultNotifyOffsetDays: number;
      isSecured: boolean;
      description?: string;
    }>>>("/documents/categories");
    return res.data.data.map((c) => ({
      category_id: c.categoryId,
      code: c.code,
      name: c.name,
      default_notify_offset_days: c.defaultNotifyOffsetDays,
      is_secured: c.isSecured,
      description: c.description,
    }));
  },

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

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    await api.patch(`/documents/${id}/favorite`, { isFavorite });
  },

  async addTag(id: string, name: string): Promise<DocumentTagItem> {
    const res = await api.post<ApiResponse<{ documentId: string; tagId: string }>>(
      `/documents/${id}/tags`,
      { name },
    );
    return { tag_id: res.data.data.tagId, name };
  },

  async removeTag(id: string, tagId: string): Promise<void> {
    await api.delete(`/documents/${id}/tags/${tagId}`);
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};
