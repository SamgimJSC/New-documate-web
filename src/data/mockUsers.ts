import type { User, UserSettings, UserConsent } from "../types/user";

export const mockUsers: User[] = [
  {
    user_id: "user-001",
    email: "demo@documate.kr",
    nickname: "김민준",
    real_name: "김민준",
    birth_date: "1992-03-15",
    profile_img_url: undefined,
    role: "MEMBER",
    plan: "PRO",
    storage_used_bytes: 524288000,
    storage_quota_bytes: 5368709120,
    is_email_verified: true,
    last_login_at: "2026-05-28T09:00:00+09:00",
    created_at: "2025-01-10T12:00:00+09:00",
    updated_at: "2026-05-28T09:00:00+09:00",
    is_deleted: "N",
  },
];

export const mockCurrentUser: User = mockUsers[0];

export const mockUserSettings: UserSettings = {
  setting_id: "setting-001",
  user_id: "user-001",
  push_enabled: true,
  email_noti_enabled: true,
  camera_auto_ocr: true,
  dark_mode: false,
  app_lock_enabled: false,
  updated_at: "2026-05-01T09:00:00+09:00",
};

export const mockUserConsents: UserConsent[] = [
  {
    consent_id: "consent-001",
    user_id: "user-001",
    consent_type: "TERMS",
    is_required: true,
    is_agreed: true,
    agreed_at: "2025-01-10T12:00:00+09:00",
  },
  {
    consent_id: "consent-002",
    user_id: "user-001",
    consent_type: "PRIVACY",
    is_required: true,
    is_agreed: true,
    agreed_at: "2025-01-10T12:00:00+09:00",
  },
  {
    consent_id: "consent-003",
    user_id: "user-001",
    consent_type: "MARKETING",
    is_required: false,
    is_agreed: true,
    agreed_at: "2025-01-10T12:00:00+09:00",
  },
  {
    consent_id: "consent-004",
    user_id: "user-001",
    consent_type: "THIRD_PARTY",
    is_required: false,
    is_agreed: false,
  },
];
