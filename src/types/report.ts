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
