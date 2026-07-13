import type { UserPlan } from "./user";

export type PaymentMethodType = "KAKAOPAY" | "NAVERPAY" | "CARD";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "CANCELED" | "EXPIRED";
export type PaymentStatus = "READY" | "APPROVED" | "CANCELED" | "FAILED";
export type PaymentFlow = "SUBSCRIBE" | "METHOD_CHANGE";

export interface SubscriptionPaymentMethod {
  method_id: string;
  method_type: PaymentMethodType;
  display_name: string;
  is_default: boolean;
}

export interface Subscription {
  plan: UserPlan;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start?: string;
  current_period_end?: string;
  next_billing_at?: string;
  is_canceled: boolean;
  canceled_at?: string;
  cancel_reason?: string;
  payment_method?: SubscriptionPaymentMethod;
}

export interface PaymentReady {
  payment_id: string;
  tid: string;
  redirect_url: string;
  app_redirect_url?: string;
  mobile_redirect_url: string;
  pc_redirect_url: string;
  status: PaymentStatus;
  billing_cycle: BillingCycle;
  amount: number;
}

export interface Payment {
  payment_id: string;
  subscription_id?: string;
  method_id?: string;
  status: PaymentStatus;
  amount: number;
  billing_cycle: BillingCycle;
  method_type?: PaymentMethodType;
  method_name?: string;
  fail_reason?: string;
  approved_at?: string;
  created_at: string;
}
