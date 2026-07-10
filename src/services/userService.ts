import { api } from "./api";
import type { User, UserSettings } from "../types/user";

interface ApiResponse<T = null> {
  message: string;
  error: string;
  errorCode: string;
  statusCode: number;
  data: T;
}

interface UserApiResponse {
  userId: string;
  email: string;
  nickname: string;
  realName: string | null;
  profileImgUrl: string | null;
  role: "ADMIN" | "MEMBER";
  plan: "FREE" | "PRO";
  storageUsedBytes: string | null;
  storageQuotaBytes: string | null;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserSettingsApiResponse {
  settingId: string;
  userId: string;
  pushEnabled: boolean;
  emailNotiEnabled: boolean;
  cameraAutoOcr: boolean;
  darkMode: boolean;
  appLockEnabled: boolean;
  updatedAt: string;
}

const FREE_STORAGE_QUOTA_BYTES = 1 * 1024 * 1024 * 1024;
const PRO_STORAGE_QUOTA_BYTES = 10 * 1024 * 1024 * 1024;

const mapUser = (raw: UserApiResponse): User => ({
  user_id: raw.userId,
  email: raw.email,
  nickname: raw.nickname,
  real_name: raw.realName ?? undefined,
  profile_img_url: raw.profileImgUrl ?? undefined,
  role: raw.role,
  plan: raw.plan,
  storage_used_bytes: Number(raw.storageUsedBytes ?? 0),
  // 백엔드 storageQuotaBytes 값이 유저마다 제각각이라, 백엔드가 표준화하기 전까지는
  // plan 기준으로 프론트에서 직접 계산한다. (FREE 1GB / PRO 10GB로 통일)
  storage_quota_bytes:
    raw.plan === "PRO" ? PRO_STORAGE_QUOTA_BYTES : FREE_STORAGE_QUOTA_BYTES,
  is_email_verified: raw.isEmailVerified,
  last_login_at: raw.lastLoginAt ?? undefined,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
  is_deleted: "N",
});

const mapSettings = (raw: UserSettingsApiResponse): UserSettings => ({
  setting_id: raw.settingId,
  user_id: raw.userId,
  push_enabled: raw.pushEnabled,
  email_noti_enabled: raw.emailNotiEnabled,
  camera_auto_ocr: raw.cameraAutoOcr,
  dark_mode: raw.darkMode,
  app_lock_enabled: raw.appLockEnabled,
  updated_at: raw.updatedAt,
});

export const userService = {
  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<UserApiResponse>>("/users/me");
    return mapUser(res.data.data);
  },

  async getSettings(): Promise<UserSettings> {
    const res = await api.get<ApiResponse<UserSettingsApiResponse>>("/users/me/settings");
    return mapSettings(res.data.data);
  },

  async updateSettings(patch: Partial<Pick<UserSettings, "push_enabled" | "email_noti_enabled">>): Promise<UserSettings> {
    const body: Record<string, boolean> = {};
    if (patch.push_enabled !== undefined) body.pushEnabled = patch.push_enabled;
    if (patch.email_noti_enabled !== undefined) body.emailNotiEnabled = patch.email_noti_enabled;

    const res = await api.patch<ApiResponse<UserSettingsApiResponse>>("/users/me/settings", body);
    return mapSettings(res.data.data);
  },

  async verifyPin(pinNumber: string): Promise<void> {
    await api.post<ApiResponse>("/users/me/pin/verify", { pinNumber });
  },

  async resetPin(currentPin: string, newPin: string): Promise<void> {
    await api.patch<ApiResponse>("/users/me/pin", { currentPin, newPin });
  },

  async updateNickname(nickname: string): Promise<string> {
    const res = await api.patch<ApiResponse<{ success: boolean; nickname: string }>>(
      "/users/me/nickname",
      { nickname },
    );
    return res.data.data.nickname;
  },
};
