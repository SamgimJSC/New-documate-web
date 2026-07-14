export interface CardBase {
  cardId: string;
  cardName: string;
  issuer: string;
  annualFee: number;
  imgUrl?: string;
}

export interface CardCheckResponse {
  hasReceipt: boolean;
  defaultCards: CardBase[];
}

export interface CardAiQueueResponse {
  status: string;
  queue: string;
}

export interface CardRecommendationItem extends CardBase {
  recommendationId: string;
  reason: string;
  matchScore: number;
  recommendedAt: string;
}

export interface CardRecommendationResponse {
  recommendations: CardRecommendationItem[];
}

export interface CardBenefitSummaryItem {
  title?: string;
  value?: string;
  note?: string;
}

export interface CardBenefitDetailItem {
  title?: string;
  desc?: string | null;
}

export interface CardAnnualFeeDetail {
  domestic?: number;
  overseas?: number;
}

export interface CardBenefits {
  network?: string;
  annual_fee?: CardAnnualFeeDetail;
  summary?: CardBenefitSummaryItem[];
  categories?: Record<string, string[]>;
  details?: CardBenefitDetailItem[];
}

export interface CardDetail extends CardBase {
  sourceUrl?: string;
  benefits?: CardBenefits;
}
