import { api } from "./api";
import type {
  BillingCycle,
  Payment,
  PaymentMethodType,
  PaymentReady,
  PaymentStatus,
  Subscription,
  SubscriptionStatus,
} from "../types/payment";
import type { UserPlan } from "../types/user";

interface ApiResponse<T> {
  data: T;
}

interface SubscriptionPaymentMethodApiResponse {
  methodId: string;
  methodType: PaymentMethodType;
  displayName: string;
  isDefault: boolean;
}

interface SubscriptionApiResponse {
  plan: UserPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  nextBillingAt?: string | null;
  isCanceled: boolean;
  canceledAt: string | null;
  cancelReason: string | null;
  paymentMethod: SubscriptionPaymentMethodApiResponse | null;
}

interface PaymentReadyApiResponse {
  paymentId: string;
  tid: string;
  redirectUrl: string;
  appRedirectUrl?: string | null;
  mobileRedirectUrl: string;
  pcRedirectUrl: string;
  status: PaymentStatus;
  billingCycle: BillingCycle;
  amount: number;
}

interface PaymentApiResponse {
  paymentId: string;
  subscriptionId?: string | null;
  methodId?: string | null;
  status: PaymentStatus;
  amount: number;
  billingCycle: BillingCycle;
  methodType?: PaymentMethodType | null;
  methodName?: string | null;
  failReason: string | null;
  approvedAt: string | null;
  createdAt: string;
}

interface PaymentListApiResponse {
  items: PaymentApiResponse[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

const mapSubscription = (raw: SubscriptionApiResponse): Subscription => ({
  plan: raw.plan,
  status: raw.status,
  billing_cycle: raw.billingCycle,
  current_period_start: raw.currentPeriodStart ?? undefined,
  current_period_end: raw.currentPeriodEnd ?? undefined,
  next_billing_at: raw.nextBillingAt ?? undefined,
  is_canceled: raw.isCanceled,
  canceled_at: raw.canceledAt ?? undefined,
  cancel_reason: raw.cancelReason ?? undefined,
  payment_method: raw.paymentMethod
    ? {
        method_id: raw.paymentMethod.methodId,
        method_type: raw.paymentMethod.methodType,
        display_name: raw.paymentMethod.displayName,
        is_default: raw.paymentMethod.isDefault,
      }
    : undefined,
});

const mapPaymentReady = (raw: PaymentReadyApiResponse): PaymentReady => ({
  payment_id: raw.paymentId,
  tid: raw.tid,
  redirect_url: raw.redirectUrl,
  app_redirect_url: raw.appRedirectUrl ?? undefined,
  mobile_redirect_url: raw.mobileRedirectUrl,
  pc_redirect_url: raw.pcRedirectUrl,
  status: raw.status,
  billing_cycle: raw.billingCycle,
  amount: raw.amount,
});

const mapPayment = (raw: PaymentApiResponse): Payment => ({
  payment_id: raw.paymentId,
  subscription_id: raw.subscriptionId ?? undefined,
  method_id: raw.methodId ?? undefined,
  status: raw.status,
  amount: raw.amount,
  billing_cycle: raw.billingCycle,
  method_type: raw.methodType ?? undefined,
  method_name: raw.methodName ?? undefined,
  fail_reason: raw.failReason ?? undefined,
  approved_at: raw.approvedAt ?? undefined,
  created_at: raw.createdAt,
});

export const paymentService = {
  async readyKakaoPay(billingCycle: BillingCycle = "MONTHLY"): Promise<PaymentReady> {
    const res = await api.post<ApiResponse<PaymentReadyApiResponse>>(
      "/payments/kakao/ready",
      { billingCycle },
    );
    return mapPaymentReady(res.data.data);
  },

  async getSubscription(): Promise<Subscription> {
    const res = await api.get<ApiResponse<SubscriptionApiResponse>>(
      "/subscriptions/me",
    );
    return mapSubscription(res.data.data);
  },

  async cancelSubscription(cancelAtPeriodEnd: boolean): Promise<Subscription> {
    const res = await api.patch<ApiResponse<SubscriptionApiResponse>>(
      "/subscriptions/me/cancel",
      { cancelAtPeriodEnd },
    );
    return mapSubscription(res.data.data);
  },

  async undoCancelSubscription(): Promise<Subscription> {
    const res = await api.patch<ApiResponse<SubscriptionApiResponse>>(
      "/subscriptions/me/cancel/undo",
    );
    return mapSubscription(res.data.data);
  },

  async getPayments(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ items: Payment[]; total: number; page: number; limit: number; hasNext: boolean }> {
    const res = await api.get<ApiResponse<PaymentListApiResponse>>("/payments", {
      params,
    });
    return {
      items: res.data.data.items.map(mapPayment),
      total: res.data.data.total,
      page: res.data.data.page,
      limit: res.data.data.limit,
      hasNext: res.data.data.hasNext,
    };
  },

  async readyKakaoPayMethodChange(): Promise<PaymentReady> {
    const res = await api.post<ApiResponse<PaymentReadyApiResponse>>(
      "/payments/kakao/method-change/ready",
    );
    return mapPaymentReady(res.data.data);
  },
};

export const pickKakaoRedirectUrl = (ready: PaymentReady): string => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    return ready.mobile_redirect_url || ready.redirect_url;
  }

  return ready.pc_redirect_url || ready.redirect_url;
};
