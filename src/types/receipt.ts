import type { AiStatus, YnFlag } from "./common";

export type ReceiptInputMethod = "OCR" | "MANUAL";

export interface SpendCategory {
  spend_category_id: number;
  name: string;
  icon?: string;
}

export interface Receipt {
  receipt_id: string;
  user_id: string;
  spend_category_id: number;
  input_method: ReceiptInputMethod;
  file_url?: string;
  store_name: string;
  store_address?: string;
  total_amount: number;
  purchase_date: string;
  payment_item?: string;
  memo?: string;
  ocr_text?: string;
  extracted_data?: Record<string, unknown>;
  ai_status: AiStatus;
  is_confirmed: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: YnFlag;
}
