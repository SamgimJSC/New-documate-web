import type { AiStatus, YnFlag } from "./common";

export type DocumentFileType = "JPG" | "PNG";
export type DocumentDownloadFormat = "PDF";
export type DocumentActivityType = "UPLOAD" | "AI_ANALYZED" | "NOTI_SET" | "TAG_ADDED" | "EDITED";
export type AlertOffsetType = "M1" | "M3" | "M6" | "CUSTOM";

export interface DocumentCategory {
  category_id: number;
  code: string;
  name: string;
  default_notify_offset_days: number;
  is_secured: boolean;
  description?: string;
}

export interface DocumentTagItem {
  tag_id: string;
  name: string;
}

export interface Document {
  document_id: string;
  user_id: string;
  category_id: number;
  title: string;
  file_url: string;
  file_name: string;
  file_type: DocumentFileType;
  file_size_bytes: number;
  page_count?: number;
  ocr_text?: string;
  extracted_data?: Record<string, unknown>;
  ai_confidence?: number;
  issue_date?: string;
  expiry_date?: string;
  renewal_date?: string;
  is_masked: boolean;
  is_favorite: boolean;
  ai_status: AiStatus;
  is_confirmed: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: YnFlag;
  tags: DocumentTagItem[];
}

export interface Tag {
  tag_id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface DocumentTag {
  document_id: string;
  tag_id: string;
}

export interface DocumentAlert {
  alert_id: string;
  document_id: string;
  user_id: string;
  offset_type: AlertOffsetType;
  notify_date: string;
  reason?: string;
  channel_email: boolean;
  channel_app_push: boolean;
  channel_web_push: boolean;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}
