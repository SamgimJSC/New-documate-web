import { api } from "./api";

interface ApiResponse<T = null> {
  message: string;
  error: string;
  errorCode: string;
  statusCode: number;
  data: T;
}

interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  pinNumber: string;
  emailVerificationId: string;
}

export const authService = {
  async sendEmailVerification(email: string, purpose: "SIGNUP" | "RESET_PASSWORD") {
    const res = await api.post<ApiResponse<{ emailVerificationId: string }>>(
      "/auth/email-verification/send",
      { email, purpose },
    );
    return res.data;
  },

  async verifyEmail(emailVerificationId: string, codeNumber: string) {
    const res = await api.post<ApiResponse>(
      "/auth/email-verification/verify",
      { emailVerificationId, codeNumber },
    );
    return res.data;
  },

  async signup(body: SignupRequest) {
    const res = await api.post<ApiResponse>("/auth/signup", body);
    return res.data;
  },

  async login(email: string, password: string, stayLoggedIn = false) {
    const res = await api.post<ApiResponse>("/auth/login", { email, password, stayLoggedIn });
    return res.data;
  },

  async logout() {
    const res = await api.post<ApiResponse>("/auth/logout");
    return res.data;
  },
};
