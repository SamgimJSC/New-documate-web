export type PaymentMethodType = "KAKAOPAY" | "NAVERPAY" | "CARD";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "CANCELED" | "EXPIRED";
export type PaymentStatus = "READY" | "APPROVED" | "CANCELED" | "FAILED";

export interface Subscription {
  subscription_id: string;
  user_id: string;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  started_at?: string;
  current_period_end?: string;
  is_canceled: boolean;
  canceled_at?: string;
  created_at: string;
}

export interface Payment {
  payment_id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  status: PaymentStatus;
  fail_reason?: string;
  approved_at?: string;
  created_at: string;
}
