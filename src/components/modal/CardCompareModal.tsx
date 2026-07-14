import React, { useEffect, useState } from "react";
import { CircleAlert, Info, Loader2 } from "lucide-react";
import Modal from "../common/Modal";
import CardArtwork from "../common/CardArtwork";
import { getCardDetail } from "../../api/card";
import type { CardDetail } from "../../types/card";
import type { DisplayCard } from "../../hooks/useCardRecommendation";
import { formatKRW } from "../../utils/formatCurrency";
import "./CardCompareModal.css";

type CardTone = "green" | "blue" | "purple";

const TONE_BY_RANK: Record<number, CardTone> = { 1: "green", 2: "blue", 3: "purple" };
const getTone = (rank: number): CardTone => TONE_BY_RANK[rank] ?? "green";

const getBenefitLines = (detail: CardDetail): string[] => {
  const summary = detail.benefits?.summary ?? [];
  const summaryLines = summary
    .map((item) => [item.title, item.value, item.note].filter(Boolean).join(" "))
    .filter((line) => line.length > 0);

  if (summaryLines.length > 0) return summaryLines.slice(0, 4);

  const categoryLines = Object.values(detail.benefits?.categories ?? {}).flat();
  return categoryLines.slice(0, 4);
};

interface CardCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: DisplayCard[];
}

const CardCompareModal: React.FC<CardCompareModalProps> = ({ isOpen, onClose, cards }) => {
  const [detailByCardId, setDetailByCardId] = useState<Record<string, CardDetail>>({});
  const [failedCount, setFailedCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const idsKey = cards.map((card) => card.cardId).join(",");

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled(cards.map((card) => getCardDetail(card.cardId))).then((results) => {
      if (cancelled) return;

      const map: Record<string, CardDetail> = {};
      let failed = 0;
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          map[cards[index].cardId] = result.value;
        } else {
          failed += 1;
        }
      });

      setDetailByCardId(map);
      setFailedCount(failed);
      setStatus(Object.keys(map).length > 0 ? "ready" : "error");
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- idsKey는 cards 목록 내용을 그대로 나타내는 안정적인 키
  }, [idsKey]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="혜택 비교하기" size="xl">
      <p className="card-compare-modal__subtitle">카드를 선택하면 주요 혜택을 한눈에 비교할 수 있어요.</p>

      {status === "loading" && (
        <div className="card-compare-modal__state">
          <Loader2 size={24} className="card-compare-modal__spinner" />
          <p>카드별 혜택을 불러오고 있어요.</p>
        </div>
      )}

      {status === "error" && (
        <div className="card-compare-modal__state">
          <CircleAlert size={24} />
          <p>카드 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
        </div>
      )}

      {status === "ready" && (
        <>
          {failedCount > 0 && (
            <p className="card-compare-modal__notice">일부 카드 정보를 불러오지 못했어요.</p>
          )}

          <div className="card-compare-modal__grid">
            {cards.map((card) => {
              const detail = detailByCardId[card.cardId];
              if (!detail) return null;

              const tone = getTone(card.rank);
              const benefitLines = getBenefitLines(detail);

              const artwork = (
                <CardArtwork imgUrl={detail.imgUrl} alt={detail.cardName} tone={tone}>
                  <span className={`card-compare-modal__rank card-compare-modal__rank--${tone}`}>
                    {card.rank}위
                  </span>
                </CardArtwork>
              );

              return (
                <article key={card.cardId} className="card-compare-modal__column">
                  {detail.sourceUrl ? (
                    <a
                      href={detail.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="card-compare-modal__artwork-link"
                    >
                      {artwork}
                    </a>
                  ) : (
                    artwork
                  )}

                  <div className="card-compare-modal__info">
                    <strong>{detail.cardName}</strong>
                    <span>{detail.issuer}</span>
                  </div>

                  <div className="card-compare-modal__chip-row">
                    <span>연회비 {formatKRW(detail.annualFee)}</span>
                    {detail.benefits?.network && <span>{detail.benefits.network}</span>}
                  </div>

                  {benefitLines.length > 0 && (
                    <div className="card-compare-modal__benefit-list">
                      {benefitLines.map((line, index) => (
                        <p key={`${card.cardId}-benefit-${index}`}>{line}</p>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="card-compare-modal__footer">
            <Info size={15} />
            <span>혜택 정보는 카드사 사정에 따라 변경될 수 있습니다. 자세한 내용은 카드사 홈페이지를 확인해주세요.</span>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CardCompareModal;
