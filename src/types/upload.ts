export type UploadFileStatus = '대기' | '분석중' | '완료' | '오류';

export type UploadDocumentCategory =
  | '계약서'
  | '영수증'
  | '병원/약국'
  | '보증서/A·S'
  | '기타';

export interface UploadFileItem {
  id: number;
  fileName: string;
  sizeMb: number;
  status: UploadFileStatus;
  progress: number;
  category?: UploadDocumentCategory;
}

export interface ExtractedField {
  label: string;
  value: string;
}

export interface UploadAnalysisResult {
  id: number;
  fileName: string;
  category: UploadDocumentCategory;
  fields: ExtractedField[];
  isReceipt: boolean;
}
