import type { Subscription, Payment } from "../types/payment";

export const mockSubscription: Subscription = {
  subscription_id: "sub-001",
  user_id: "user-001",
  billing_cycle: "MONTHLY",
  status: "ACTIVE",
  started_at: "2025-06-01T00:00:00+09:00",
  current_period_end: "2026-06-01T00:00:00+09:00",
  is_canceled: false,
  created_at: "2025-06-01T00:00:00+09:00",
};

export const mockPayments: Payment[] = [
  {
    payment_id: "pay-001",
    user_id: "user-001",
    subscription_id: "sub-001",
    amount: 5900,
    status: "APPROVED",
    approved_at: "2026-05-01T00:00:00+09:00",
    created_at: "2026-05-01T00:00:00+09:00",
  },
  {
    payment_id: "pay-002",
    user_id: "user-001",
    subscription_id: "sub-001",
    amount: 5900,
    status: "APPROVED",
    approved_at: "2026-04-01T00:00:00+09:00",
    created_at: "2026-04-01T00:00:00+09:00",
  },
  {
    payment_id: "pay-003",
    user_id: "user-001",
    subscription_id: "sub-001",
    amount: 5900,
    status: "APPROVED",
    approved_at: "2026-03-01T00:00:00+09:00",
    created_at: "2026-03-01T00:00:00+09:00",
  },
];
