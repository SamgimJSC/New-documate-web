export interface MonthlyReport {
  report_id: string;
  user_id: string;
  report_year: number;
  report_month: number;
  total_spend: number;
  receipt_count: number;
  prev_month_diff_pct?: number;
  predicted_spend?: number;
  prediction_confidence?: number;
  category_breakdown?: Record<string, number>;
  ai_analysis?: string;
  created_at: string;
}

export interface CardRecommendation {
  recommendation_id: string;
  user_id: string;
  card_id: string;
  reason?: string;
  match_score?: number;
  recommended_at: string;
}

export interface MonthSummary {
  month: number;
  totalSpend: number;
  receiptCount: number;
}

export interface MonthlySpendResponse {
  year: number;
  totalSpend: number;
  months: MonthSummary[];
}

export interface DaySummary {
  date: string;
  day: number;
  totalSpend: number;
  receiptCount: number;
}

export interface DailySpendResponse {
  year: number;
  month: number;
  totalSpend: number;
  days: DaySummary[];
}

export interface CategorySummaryItem {
  spendCategoryId: number;
  name: string;
  icon: string;
  totalSpend: number;
  receiptCount: number;
  percentage: number;
}

export interface CategorySummaryResponse {
  year: number;
  month: number;
  date: string | null;
  totalSpend: number;
  categories: CategorySummaryItem[];
}

export interface TopStoreItem {
  storeName: string;
  totalSpend: number;
  visitCount: number;
}

export interface TopStoresResponse {
  year: number;
  month: number | null;
  stores: TopStoreItem[];
}

export interface WeekdaySummaryItem {
  weekday: number;
  totalSpend: number;
  receiptCount: number;
}

export interface WeekdaySummaryResponse {
  year: number;
  weekdays: WeekdaySummaryItem[];
}
