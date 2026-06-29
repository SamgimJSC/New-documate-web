import { api } from "./api";

interface ApiResponse<T> {
  data: T;
}

interface StartSessionData {
  tempDocumentId: string;
}

interface UploadPageData {
  tempDocumentId: string;
  files: Array<{ id: string; fileUrl: string; pageNo: number }>;
}

interface CreateDocumentData {
  documentId: string;
}

export type AiStatus = "PENDING" | "DONE" | "FAILED";

interface AiStatusData {
  documentId: string;
  aiStatus: AiStatus;
}

export const uploadService = {
  async startSession(): Promise<string> {
    const res = await api.get<ApiResponse<StartSessionData>>("/upload/start");
    return res.data.data.tempDocumentId;
  },

  async uploadPage(
    tempDocumentId: string,
    file: File,
    pageNo: number,
  ): Promise<UploadPageData> {
    const form = new FormData();
    form.append("file", file);
    form.append("pageNo", String(pageNo));
    const res = await api.post<ApiResponse<UploadPageData>>(
      `/upload/${tempDocumentId}`,
      form,
      {
        headers: { "Content-Type": undefined },
      },
    );
    return res.data.data;
  },

  async reorder(
    tempDocumentId: string,
    files: Array<{ id: string; pageNo: number }>,
  ): Promise<void> {
    await api.patch(`/upload/${tempDocumentId}/reorder`, { files });
  },

  async requestAi(
    tempDocumentId: string,
    files: Array<{ id: string; pageNo: number }>,
  ): Promise<{ tempDocumentId: string }> {
    const res = await api.post<ApiResponse<{ tempDocumentId: string }>>(
      `/upload/${tempDocumentId}/ai`,
      { files },
    );
    return res.data.data;
  },

  async getTempList(): Promise<
    Array<{ tempDocumentId: string; aiStatus: AiStatus | "PROCESSING" }>
  > {
    const res =
      await api.get<
        ApiResponse<
          Array<{ tempDocumentId: string; aiStatus: AiStatus | "PROCESSING" }>
        >
      >("/upload/temp-list");
    return res.data.data;
  },

  async createDocument(body: {
    inputMethod: string;
    categoryId: number;
    title: string;
    issueDate?: string;
    expiryDate?: string;
    renewalDate?: string;
    extractedData?: Record<string, string>;
    files?: Array<{ fileUrl: string; pageNo: number }>;
  }): Promise<string> {
    const res = await api.post<ApiResponse<CreateDocumentData>>(
      "/documents",
      body,
    );
    return res.data.data.documentId;
  },

  async getAiStatus(documentId: string): Promise<AiStatus> {
    const res = await api.get<ApiResponse<AiStatusData>>(
      `/documents/${documentId}/ai-status`,
    );
    return res.data.data.aiStatus;
  },
};
