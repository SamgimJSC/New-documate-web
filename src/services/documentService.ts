import { api } from "./api";
import type {
  Document,
  DocumentAlert,
  DocumentCategory,
  DocumentTagItem,
  AlertOffsetType,
} from "../types/document";

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
  isLocked?: boolean | "Y" | "N";
  locked?: boolean;
  cabinetLocked?: boolean | "Y" | "N";
  lockStatus?: "LOCKED" | "UNLOCKED" | string;
  isFavorite: boolean;
  aiStatus: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  documentTags?: Array<{ tag: { tagId: string; name: string } }>;
  documentFiles?: Array<{ fileId: number; documentId: string; fileUrl: string; pageNo: number; createdAt: string }>;
}

interface DocumentAlertApiItem {
  alertId: string;
  documentId: string;
  userId: string;
  offsetType: string;
  notifyDate: string;
  reason: string | null;
  channelEmail: boolean;
  channelAppPush: boolean;
  channelWebPush: boolean;
  isSent: boolean;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const mapAlert = (raw: DocumentAlertApiItem): DocumentAlert => ({
  alert_id: raw.alertId,
  document_id: raw.documentId,
  user_id: raw.userId,
  offset_type: raw.offsetType as AlertOffsetType,
  notify_date: raw.notifyDate,
  reason: raw.reason ?? undefined,
  channel_email: raw.channelEmail,
  channel_app_push: raw.channelAppPush,
  channel_web_push: raw.channelWebPush,
  is_sent: raw.isSent,
  sent_at: raw.sentAt ?? undefined,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
});

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
  document_files: (raw.documentFiles ?? [])
    .sort((a, b) => a.pageNo - b.pageNo)
    .map((f) => ({
      file_id: f.fileId,
      document_id: f.documentId,
      file_url: f.fileUrl,
      page_no: f.pageNo,
      created_at: f.createdAt,
    })),
  file_url: raw.documentFiles?.[0]?.fileUrl ?? raw.fileUrl ?? "",
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
  is_locked: raw.isLocked ?? raw.locked ?? raw.cabinetLocked ?? (raw.lockStatus === "LOCKED"),
  locked: raw.locked,
  cabinet_locked: raw.cabinetLocked,
  lock_status: raw.lockStatus,
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
  async updateLock(
    id: string,
    isLocked: boolean,
    pinNumber: string,
  ): Promise<Document> {
    const res = await api.patch<ApiResponse<DocumentApiItem>>(
      `/documents/${id}/lock`,
      { isLocked, pinNumber },
    );
    return mapDocument(res.data.data);
  },

  // PIN 검증 성공 시 해당 문서에 한정된 단기 토큰 발급 (메모리에만 보관, 저장소에 남기지 않음)
  async unlockDocument(
    id: string,
    pinNumber: string,
  ): Promise<{ unlockToken: string; expiresIn: number }> {
    const res = await api.post<
      ApiResponse<{ unlockToken: string; expiresIn: number }>
    >(`/documents/${id}/unlock`, { pinNumber });
    return res.data.data;
  },

  async getCategories(): Promise<DocumentCategory[]> {
    const res = await api.get<
      ApiResponse<
        Array<{
          categoryId: number;
          code: string;
          name: string;
          defaultNotifyOffsetDays: number;
          isSecured: boolean;
          description?: string;
        }>
      >
    >("/documents/categories");
    return res.data.data.map((c) => ({
      category_id: c.categoryId,
      code: c.code,
      name: c.name,
      default_notify_offset_days: c.defaultNotifyOffsetDays,
      is_secured: c.isSecured,
      description: c.description,
    }));
  },

  async getDocuments(params?: {
    keyword?: string;
    searchField?: "title" | "tag" | "ocr";
    limit?: number;
    page?: number;
    categoryId?: number;
    sort?: string;
  }): Promise<Document[]> {
    const res = await api.get<ApiResponse<DocumentListData>>("/documents", {
      params,
    });
    return res.data.data.items.map(mapDocument);
  },

  async getDocument(id: string, unlockToken?: string): Promise<Document> {
    const res = await api.get<ApiResponse<DocumentApiItem>>(`/documents/${id}`, {
      headers: unlockToken ? { "x-document-unlock-token": unlockToken } : undefined,
    });
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
    const res = await api.post<
      ApiResponse<{ documentId: string; tagId: string }>
    >(`/documents/${id}/tags`, { name });
    return { tag_id: res.data.data.tagId, name };
  },

  async removeTag(id: string, tagId: string): Promise<void> {
    await api.delete(`/documents/${id}/tags/${tagId}`);
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async getAlerts(documentId: string): Promise<DocumentAlert[]> {
    const res = await api.get<ApiResponse<DocumentAlertApiItem[]>>(`/documents/${documentId}/alerts`);
    return res.data.data.map(mapAlert);
  },

  async createAlert(
    documentId: string,
    body: {
      offsetType: string;
      notifyDate: string;
      reason?: string | null;
      channelEmail?: boolean;
      channelAppPush?: boolean;
      channelWebPush?: boolean;
    },
  ): Promise<DocumentAlert> {
    const res = await api.post<ApiResponse<DocumentAlertApiItem>>(`/documents/${documentId}/alerts`, body);
    return mapAlert(res.data.data);
  },

  async updateAlert(
    documentId: string,
    alertId: string,
    body: {
      offsetType?: string;
      notifyDate?: string;
      reason?: string | null;
      channelEmail?: boolean;
      channelAppPush?: boolean;
      channelWebPush?: boolean;
    },
  ): Promise<DocumentAlert> {
    const res = await api.patch<ApiResponse<DocumentAlertApiItem>>(`/documents/${documentId}/alerts/${alertId}`, body);
    return mapAlert(res.data.data);
  },

  async deleteAlert(documentId: string, alertId: string): Promise<void> {
    await api.delete(`/documents/${documentId}/alerts/${alertId}`);
  },

  async downloadAsPdf(id: string, title: string, unlockToken?: string): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/documents/${id}/download`, {
      credentials: "include",
      headers: unlockToken ? { "x-document-unlock-token": unlockToken } : undefined,
    });
    if (!res.ok) throw new Error("PDF 다운로드 실패");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
