import { useEffect, useRef, useState } from "react";
import {
  getCardCheck,
  requestCardAiRecommendation,
  getCardRecommendation,
} from "../api/card";
import type { CardBase, CardRecommendationItem } from "../types/card";

export type CardRecommendationStatus =
  | "loading"
  | "polling"
  | "ready"
  | "empty"
  | "error";

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

export function useCardRecommendation() {
  const [status, setStatus] = useState<CardRecommendationStatus>("loading");
  const [cards, setCards] = useState<DisplayCard[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const pollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const clearPoll = () => {
      if (pollTimerRef.current !== null) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const pollRecommendation = () => {
      const pollStartedAt = Date.now();
      pollTimerRef.current = window.setInterval(() => {
        getCardRecommendation()
          .then((data) => {
            if (cancelled) return;
            if (data.recommendations.length > 0) {
              setCards(toDisplayCards(data.recommendations));
              setStatus("ready");
              clearPoll();
              return;
            }
            if (Date.now() - pollStartedAt > POLL_TIMEOUT_MS) {
              setStatus("empty");
              clearPoll();
            }
          })
          .catch(() => {
            // 네트워크 오류는 다음 폴링에서 재시도
          });
      }, POLL_INTERVAL_MS);
    };

    const run = async () => {
      try {
        const check = await getCardCheck();
        if (cancelled) return;

        if (!check.hasReceipt) {
          setIsDefault(true);
          setCards(toDisplayCardsFromDefault(check.defaultCards));
          setStatus("ready");
          return;
        }

        const recommendation = await getCardRecommendation();
        if (cancelled) return;

        if (recommendation.recommendations.length > 0) {
          setCards(toDisplayCards(recommendation.recommendations));
          setStatus("ready");
          return;
        }

        setStatus("polling");
        await requestCardAiRecommendation();
        if (cancelled) return;
        pollRecommendation();
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    run();

    return () => {
      cancelled = true;
      clearPoll();
    };
  }, []);

  return { status, cards, isDefault };
}
