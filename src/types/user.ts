import type { YnFlag } from "./common";

export type UserRole = "ADMIN" | "MEMBER";
export type UserPlan = "FREE" | "PRO";
export type VerificationPurpose = "SIGNUP" | "RESET_PW";
export type BiometricType = "FACE" | "FINGER";
export type ConsentType = "TERMS" | "PRIVACY" | "MARKETING" | "THIRD_PARTY";

export interface User {
  user_id: string;
  email: string;
  password?: string;
  nickname: string;
  real_name?: string;
  birth_date?: string;
  profile_img_url?: string;
  role: UserRole;
  plan: UserPlan;
  storage_used_bytes: number;
  storage_quota_bytes: number;
  is_email_verified: boolean;
  last_login_at?: string;
  withdrawal_reason?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  is_deleted: YnFlag;
}

export interface UserSettings {
  setting_id: string;
  user_id: string;
  push_enabled: boolean;
  email_noti_enabled: boolean;
  camera_auto_ocr: boolean;
  dark_mode: boolean;
  app_lock_enabled: boolean;
  updated_at: string;
}

export interface UserConsent {
  consent_id: string;
  user_id: string;
  consent_type: ConsentType;
  is_required: boolean;
  is_agreed: boolean;
  agreed_at?: string;
}
