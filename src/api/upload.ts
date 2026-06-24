import client from "./client";

interface StartUploadResponse {
  tempDocumentId: string;
}

interface TempFileItem {
  id: string;
  fileUrl: string;
  pageNo: number;
}

interface UploadTempFileResponse {
  tempDocumentId: string;
  files: TempFileItem[];
}

export const startUpload = () =>
  client.get<StartUploadResponse>("/upload/start").then((r) => r.data);

export const uploadTempFile = (tempDocumentId: string, file: File, pageNo: number) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pageNo", String(pageNo));
  return client
    .post<UploadTempFileResponse>(`/upload/${tempDocumentId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const requestAiAnalyse = (tempDocumentId: string, files: { id: string; pageNo: number }[]) =>
  client.post(`/upload/${tempDocumentId}/ai`, { files }).then((r) => r.data);
