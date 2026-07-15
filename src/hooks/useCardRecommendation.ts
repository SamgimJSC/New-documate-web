import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCardCheck,
  requestCardAiRecommendation,
  getCardRecommendation,
} from "../api/card";
import { getCategorySummary } from "../api/report";
import type { CardBase, CardRecommendationItem } from "../types/card";
import type { CategorySummaryItem } from "../types/report";

export type InitialStatus = "loading" | "ready" | "error";
export type RequestStatus = "idle" | "polling" | "empty" | "error" | "no-receipt";

export interface DisplayCard extends CardBase {
  recommendationId: string;
  rank: number;
  reason?: string;
  matchScore?: number;
  recommendedAt?: string;
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60000;

const toDisplayCards = (items: CardRecommendationItem[]): DisplayCard[] =>
  [...items]
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((item, index) => ({ ...item, rank: index + 1 }));

const toDisplayCardsFromDefault = (items: CardBase[]): DisplayCard[] =>
  items.map((item, index) => ({
    ...item,
    recommendationId: item.cardId,
    rank: index + 1,
  }));

const fetchTopCategory = (): Promise<CategorySummaryItem | null> => {
  const now = new Date();
  return getCategorySummary({ year: now.getFullYear(), month: now.getMonth() + 1 })
    .then((summary) => {
      const sorted = [...summary.categories].sort((a, b) => b.totalSpend - a.totalSpend);
      return sorted[0] ?? null;
    })
    .catch(() => null);
};

// recommendedAt(추천 배치 기준)별로 topCategory 스냅샷을 저장해, 같은 추천 결과를
// 재방문해도 그 시점 소비 데이터가 아니라 항상 같은 값을 보여준다.
const TOP_CATEGORY_CACHE_PREFIX = "documate:cardTopCategory:";

const readCachedTopCategory = (recommendedAt: string): { value: CategorySummaryItem | null } | null => {
  try {
    const raw = window.localStorage.getItem(TOP_CATEGORY_CACHE_PREFIX + recommendedAt);
    return raw === null ? null : (JSON.parse(raw) as { value: CategorySummaryItem | null });
  } catch {
    return null;
  }
};

const writeCachedTopCategory = (recommendedAt: string, value: CategorySummaryItem | null) => {
  try {
    window.localStorage.setItem(TOP_CATEGORY_CACHE_PREFIX + recommendedAt, JSON.stringify({ value }));
  } catch {
    // localStorage를 못 쓰면 캐싱 없이 매번 재계산되는 것으로 자연히 폴백
  }
};

// 추천 결과가 있으면 그 추천 시점 스냅샷(캐시)을 쓰고, 없으면(=아직 추천 전) 현재 데이터를 그대로 보여준다.
const resolveTopCategory = async (recommendedAt?: string): Promise<CategorySummaryItem | null> => {
  if (!recommendedAt) return fetchTopCategory();

  const cached = readCachedTopCategory(recommendedAt);
  if (cached) return cached.value;

  const fresh = await fetchTopCategory();
  writeCachedTopCategory(recommendedAt, fresh);
  return fresh;
};

export function useCardRecommendation() {
  const [initialStatus, setInitialStatus] = useState<InitialStatus>("loading");
  const [hasReceipt, setHasReceipt] = useState(false);
  const [cards, setCards] = useState<DisplayCard[]>([]);
  const [defaultCards, setDefaultCards] = useState<DisplayCard[]>([]);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  // 카드 추천은 자동으로 다시 계산되지 않으므로, 마지막 추천 시점의 소비 패턴을 그대로 고정해서 보여준다.
  // 재추천을 받을 때만 현재 영수증 기준으로 다시 계산한다.
  const [topCategory, setTopCategory] = useState<CategorySummaryItem | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const clearPoll = () => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCardCheck(), getCardRecommendation()])
      .then(([check, recommendation]) => {
        if (cancelled) return;
        setHasReceipt(check.hasReceipt);
        setDefaultCards(toDisplayCardsFromDefault(check.defaultCards));
        const displayCards = toDisplayCards(recommendation.recommendations);
        setCards(displayCards);
        setInitialStatus("ready");

        resolveTopCategory(displayCards[0]?.recommendedAt).then((top) => {
          if (!cancelled) setTopCategory(top);
        });
      })
      .catch(() => {
        if (!cancelled) setInitialStatus("error");
      });

    return () => {
      cancelled = true;
      clearPoll();
    };
  }, []);

  const requestRecommendation = useCallback(() => {
    if (requestStatus === "polling") return;

    // 재추천 시 기존 결과가 테이블에 그대로 남아있으므로, 새로 계산된 결과인지
    // recommendedAt으로 구분한다 (없으면 최초 추천이라 바로 통과).
    const previousRecommendedAt = cards[0]?.recommendedAt;

    clearPoll();
    setRequestStatus("polling");

    requestCardAiRecommendation()
      .then(() => {
        const pollStartedAt = Date.now();
        pollTimerRef.current = window.setInterval(() => {
          getCardRecommendation()
            .then((data) => {
              const isFresh =
                data.recommendations.length > 0 &&
                (!previousRecommendedAt ||
                  data.recommendations.some((item) => item.recommendedAt !== previousRecommendedAt));

              if (isFresh) {
                const freshCards = toDisplayCards(data.recommendations);
                setCards(freshCards);
                resolveTopCategory(freshCards[0]?.recommendedAt).then(setTopCategory);
                setRequestStatus("idle");
                clearPoll();
                return;
              }
              if (Date.now() - pollStartedAt > POLL_TIMEOUT_MS) {
                setRequestStatus("empty");
                clearPoll();
              }
            })
            .catch(() => {
              // 네트워크 오류는 다음 폴링에서 재시도
            });
        }, POLL_INTERVAL_MS);
      })
      .catch((error) => {
        const errorCode = (error as { response?: { data?: { errorCode?: string } } })?.response?.data
          ?.errorCode;
        setRequestStatus(errorCode === "RECEIPT_NOT_FOUND" ? "no-receipt" : "error");
      });
  }, [requestStatus, cards]);

  return {
    initialStatus,
    hasReceipt,
    cards,
    defaultCards,
    requestStatus,
    requestRecommendation,
    topCategory,
  };
}
