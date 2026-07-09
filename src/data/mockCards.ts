export type RecommendedCardTone = "green" | "purple" | "blue";

export interface RecommendedCard {
  id: string;
  rank: number;
  name: string;
  englishName: string;
  benefitTitle: string;
  benefitDescription: string;
  expectedBenefit: number;
  monthlyRequirement: string;
  annualFee: number;
  tags: string[];
  tone: RecommendedCardTone;
}

export const cardRecommendationSummary = {
  기준월: "2026년 6월",
  topCategory: "카페",
  topCategoryShare: 50,
  expectedMonthlySpend: 316000,
  recommendationRule: "카테고리 혜택 중심",
};

export const recommendedCards: RecommendedCard[] = [
  {
    id: "cafe-life-pick",
    rank: 1,
    name: "카페생활 PICK 카드",
    englishName: "CAFE LIFE",
    benefitTitle: "카페 10% 할인",
    benefitDescription: "월 최대 8,000원 혜택",
    expectedBenefit: 8000,
    monthlyRequirement: "30만원",
    annualFee: 10000,
    tags: ["카페", "편의점", "구독"],
    tone: "green",
  },
  {
    id: "shop-save",
    rank: 2,
    name: "쇼핑세이브 카드",
    englishName: "SHOP SAVE",
    benefitTitle: "쇼핑 7% 할인",
    benefitDescription: "월 최대 6,500원 혜택",
    expectedBenefit: 6500,
    monthlyRequirement: "30만원",
    annualFee: 12000,
    tags: ["쇼핑", "온라인", "마켓"],
    tone: "purple",
  },
  {
    id: "life-balance",
    rank: 3,
    name: "생활균형 카드",
    englishName: "LIFE BALANCE",
    benefitTitle: "생활 5% 할인",
    benefitDescription: "월 최대 5,200원 혜택",
    expectedBenefit: 5200,
    monthlyRequirement: "20만원",
    annualFee: 8000,
    tags: ["대중교통", "통신", "배달"],
    tone: "blue",
  },
];
