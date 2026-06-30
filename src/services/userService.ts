import { api } from "./api";
import type { User } from "../types/user";

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

const mapUser = (raw: UserApiResponse): User => ({
  user_id: raw.userId,
  email: raw.email,
  nickname: raw.nickname,
  real_name: raw.realName ?? undefined,
  profile_img_url: raw.profileImgUrl ?? undefined,
  role: raw.role,
  plan: raw.plan,
  storage_used_bytes: Number(raw.storageUsedBytes ?? 0),
  // TODO: 백엔드에서 storageQuotaBytes 기본값 설정 후 제거 예정
  storage_quota_bytes: Number(raw.storageQuotaBytes ?? (1 * 1024 * 1024 * 1024)),
  is_email_verified: raw.isEmailVerified,
  last_login_at: raw.lastLoginAt ?? undefined,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
  is_deleted: "N",
});

export const userService = {
  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<UserApiResponse>>("/users/me");
    return mapUser(res.data.data);
  },

  async verifyPin(pinNumber: string): Promise<void> {
    await api.post<ApiResponse>("/users/me/pin/verify", { pinNumber });
  },

  async resetPin(currentPin: string, newPin: string): Promise<void> {
    await api.patch<ApiResponse>("/users/me/pin", { currentPin, newPin });
  },
};
