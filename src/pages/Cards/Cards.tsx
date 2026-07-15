import React, { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  Coffee,
  CreditCard,
  Info,
  Loader2,
  Scale,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useCardRecommendation } from "../../hooks/useCardRecommendation";
import type { CategorySummaryItem } from "../../types/report";
import { formatKRW } from "../../utils/formatCurrency";
import CardDetailModal from "../../components/modal/CardDetailModal";
import CardCompareModal from "../../components/modal/CardCompareModal";
import { useToast } from "../../components/common/Toast";
import "./Cards.css";

const getCategoryName = (item: CategorySummaryItem) =>
  (item as unknown as { categoryName?: string }).categoryName ?? item.name ?? "기타";

type CardTone = "green" | "purple" | "blue";

const TONE_BY_RANK: Record<number, CardTone> = { 1: "green", 2: "purple", 3: "blue" };

const getTone = (rank: number): CardTone => TONE_BY_RANK[rank] ?? "green";

const getThumbLabel = (rank: number) => {
  if (rank === 1) return "GOOD";
  if (rank === 2) return "CLEAR+";
  if (rank === 3) return "PASS";
  return `${rank}위`;
};

const Cards: React.FC = () => {
  const {
    initialStatus,
    hasReceipt,
    cards,
    defaultCards,
    requestStatus,
    requestRecommendation,
    topCategory,
  } = useCardRecommendation();
  const [portraitCardIds, setPortraitCardIds] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  const handleAiRequestClick = () => {
    if (!hasReceipt) {
      showToast("등록된 영수증이 없습니다. 영수증을 등록하고 카드 추천을 받아보세요.", "info");
      return;
    }
    requestRecommendation();
  };

  const handleCardImageLoad = (recommendationId: string) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalHeight > img.naturalWidth) {
      setPortraitCardIds((prev) => ({ ...prev, [recommendationId]: true }));
    }
  };

  const prevRequestStatusRef = useRef(requestStatus);

  useEffect(() => {
    const prevRequestStatus = prevRequestStatusRef.current;
    prevRequestStatusRef.current = requestStatus;

    if (prevRequestStatus === "polling" && requestStatus === "idle") {
      showToast("새로운 소비 패턴으로 카드 추천을 완료했어요!", "success");
    } else if (requestStatus === "empty") {
      showToast("추천 결과를 받아오지 못했어요. 잠시 후 다시 시도해주세요.", "error");
    } else if (requestStatus === "error") {
      showToast("추천 요청에 실패했어요. 다시 시도해주세요.", "error");
    } else if (requestStatus === "no-receipt") {
      showToast("영수증이 삭제되어 추천을 진행할 수 없어요.", "error");
    }
  }, [requestStatus, showToast]);

  const [detailCardId, setDetailCardId] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  if (initialStatus === "loading") {
    return (
      <div className="cards-page">
        <section className="cards-page__state">
          <Loader2 size={28} className="cards-page__state-spinner" />
          <strong>카드 추천 정보를 불러오고 있어요</strong>
          <p>잠시만 기다려주세요.</p>
        </section>
      </div>
    );
  }

  if (initialStatus === "error") {
    return (
      <div className="cards-page">
        <section className="cards-page__state">
          <CircleAlert size={28} className="cards-page__state-alert" />
          <strong>카드 추천 정보를 불러오지 못했어요</strong>
          <p>잠시 후 페이지를 새로고침해 다시 시도해주세요.</p>
        </section>
      </div>
    );
  }

  const hasResult = cards.length > 0;
  const displayCards = hasResult ? cards : !hasReceipt ? defaultCards : [];

  return (
    <div className="cards-page">
      <section className="cards-page__hero" aria-labelledby="cards-page-title">
        <div className="cards-page__hero-content">
          <p className="cards-page__title" id="cards-page-title">
            소비 패턴에 맞는
            <br />
            혜택 카드를 추천해드려요.
          </p>
          <p className="cards-page__description">
            등록된 영수증의 카테고리와 지출 흐름을 기준으로 예상 혜택이 높은 카드를
            정리했어요.
          </p>

          <div className="cards-page__hero-chip-row" aria-label="카드 추천 기준">
            {topCategory && (
              <span>
                <Coffee size={15} />
                {getCategoryName(topCategory)} 중심 추천
              </span>
            )}
            {topCategory && (
              <span>
                <Wallet size={15} />
                이번 달 지출 {formatKRW(topCategory.totalSpend)}
              </span>
            )}

            <button
              type="button"
              className="cards-page__hero-cta"
              onClick={hasResult ? requestRecommendation : handleAiRequestClick}
              disabled={requestStatus === "polling"}
            >
              {requestStatus === "polling" ? (
                <Loader2 size={16} className="cards-page__hero-cta-spinner" />
              ) : (
                <Sparkles size={16} />
              )}
              {requestStatus === "polling" ? "분석 중..." : hasResult ? "다시 추천받기" : "AI 신용카드 추천받기"}
            </button>
          </div>

          {hasResult && (
            <p className="cards-page__hero-hint">
              새로운 영수증을 등록하셨으면 새롭게 추천을 받아보세요!
            </p>
          )}
        </div>

        <div className="cards-page__hero-visual" aria-hidden="true">
          <div className="cards-page__hero-card-shape">
            <span />
            <span />
            <span />
          </div>
          <div className="cards-page__hero-lens">
            <CreditCard size={38} />
          </div>
          <Sparkles size={22} className="cards-page__hero-sparkle cards-page__hero-sparkle--one" />
          <Sparkles size={16} className="cards-page__hero-sparkle cards-page__hero-sparkle--two" />
        </div>
      </section>

      <section className="cards-page__summary-grid" aria-label="카드 추천 핵심 요약">
        <article className="cards-page__summary-card">
          <span className="cards-page__summary-icon cards-page__summary-icon--green">
            <Coffee size={20} />
          </span>
          <div>
            <p>TOP 카테고리</p>
            <strong>{topCategory ? getCategoryName(topCategory) : "-"}</strong>
            <span>
              {topCategory ? `전체 소비의 ${Math.round(topCategory.percentage)}%` : "소비 데이터 없음"}
            </span>
          </div>
        </article>

        <article className="cards-page__summary-card">
          <span className="cards-page__summary-icon cards-page__summary-icon--mint">
            <Wallet size={20} />
          </span>
          <div>
            <p>{hasResult ? "AI 매칭 점수" : "추천 카드"}</p>
            <strong>
              {hasResult
                ? `${cards[0]?.matchScore ?? "-"}점`
                : !hasReceipt
                  ? `기본 카드 ${defaultCards.length}종`
                  : "대기 중"}
            </strong>
            <span>
              {hasResult ? "1위 카드 기준" : !hasReceipt ? "영수증 등록 전 기본 추천" : "AI 추천 요청 대기 중"}
            </span>
          </div>
        </article>

        <article className="cards-page__summary-card">
          <span className="cards-page__summary-icon cards-page__summary-icon--orange">
            <BadgeCheck size={20} />
          </span>
          <div>
            <p>추천 기준</p>
            <strong>{hasResult ? "카드 매칭 알고리즘" : !hasReceipt ? "기본 카드 안내" : "AI 추천 대기"}</strong>
            <span>연회비 낮은 순 반영</span>
          </div>
        </article>
      </section>

      {hasResult ? (
        <section className="cards-page__ai-box" aria-label="AI 추천 요약">
          <span className="cards-page__ai-icon">
            <Sparkles size={21} />
          </span>
          <div>
            <strong>AI가 분석한 소비 패턴 결과예요!</strong>
            <p>
              {topCategory ? `${getCategoryName(topCategory)} 지출 비중이 가장 높아요. ` : ""}
              관련 소비 횟수나 금액을 한 번만 줄여도 다음 달 지출 관리에 도움이 됩니다.
            </p>
          </div>
        </section>
      ) : !hasReceipt ? (
        <section className="cards-page__ai-box" aria-label="추천 안내">
          <span className="cards-page__ai-icon">
            <Sparkles size={21} />
          </span>
          <div>
            <strong>아직 등록된 영수증이 없어요</strong>
            <p>영수증을 등록하면 소비 패턴을 분석해 맞춤 카드를 추천해드려요. 지금은 기본 카드를 보여드리고 있어요.</p>
          </div>
        </section>
      ) : (
        <section className="cards-page__ai-box" aria-label="추천 안내">
          <span className="cards-page__ai-icon">
            <Sparkles size={21} />
          </span>
          <div>
            <strong>영수증이 등록되어 있어요!</strong>
            <p>아래 버튼을 눌러 AI에게 소비 패턴에 맞는 카드를 추천받아보세요.</p>
          </div>
        </section>
      )}

      <section className="cards-page__section" aria-labelledby="recommended-card-title">
        <div className="cards-page__section-head">
          <div>
            <p className="cards-page__section-title" id="recommended-card-title">
              {hasResult ? `추천 카드 TOP ${cards.length}` : !hasReceipt ? "기본 추천 카드" : "AI 카드 추천"}
            </p>
            <p className="cards-page__section-desc">
              {hasResult
                ? "선택한 소비 패턴을 기반으로 예상 혜택이 높은 카드를 추천해드려요."
                : !hasReceipt
                  ? "영수증 등록 전에는 누구에게나 인기 있는 기본 카드를 보여드려요."
                  : "AI 신용카드 추천받기를 누르면 소비 패턴에 맞는 카드를 분석해드려요."}
            </p>
          </div>
        </div>

        {requestStatus === "no-receipt" && (
          <div className="cards-page__no-receipt-banner">
            <CircleAlert size={16} className="cards-page__no-receipt-banner-icon" />
            <span>영수증이 삭제되어 추천을 진행할 수 없어요. 영수증을 다시 등록한 후 재추천을 받아보세요.</span>
          </div>
        )}

        {displayCards.length > 0 ? (
          <div className="cards-page__recommend-grid">
            {displayCards.map((card) => (
              <article
                key={card.recommendationId}
                className={`cards-page__recommend-card cards-page__recommend-card--${getTone(card.rank)}`}
              >
                <div className={`cards-page__card-visual cards-page__card-visual--${getTone(card.rank)}`}>
                  {card.imgUrl && (
                    <img
                      src={card.imgUrl}
                      alt={card.cardName}
                      className={`cards-page__card-img${
                        portraitCardIds[card.recommendationId] ? " cards-page__card-img--rotated" : ""
                      }`}
                      onLoad={handleCardImageLoad(card.recommendationId)}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <span className="cards-page__rank-badge">{card.rank}위</span>
                </div>

                <div className="cards-page__recommend-content">
                  <div className="cards-page__recommend-title-row">
                    <div>
                      <strong>{card.cardName}</strong>
                      <span>{card.issuer}</span>
                    </div>
                    {card.rank === 1 && <span className="cards-page__best-badge">BEST</span>}
                  </div>

                  {card.reason && <p>{card.reason}</p>}

                  <div className="cards-page__benefit-grid">
                    {typeof card.matchScore === "number" && (
                      <div>
                        <span>매칭 점수</span>
                        <strong>{card.matchScore}점</strong>
                      </div>
                    )}
                    <div>
                      <span>연회비</span>
                      <strong>{formatKRW(card.annualFee)}</strong>
                    </div>
                  </div>

                  <div className="cards-page__bottom-row">
                    <button
                      type="button"
                      className="cards-page__detail-button"
                      onClick={() => setDetailCardId(card.cardId)}
                    >
                      상세 보기
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="cards-page__request-empty">
            {requestStatus === "polling" && (
              <>
                <Loader2 size={24} className="cards-page__state-spinner" />
                <p>AI가 소비 패턴을 분석해 카드를 추천하고 있어요. 잠시만 기다려주세요.</p>
              </>
            )}
            {requestStatus === "empty" && (
              <p>아직 추천 결과가 준비되지 않았어요. 잠시 후 다시 시도해주세요.</p>
            )}
            {requestStatus === "error" && <p>추천 요청에 실패했어요. 다시 시도해주세요.</p>}
            {requestStatus === "idle" && (
              <p>아직 추천받은 카드가 없어요. 위 버튼을 눌러 AI 추천을 받아보세요.</p>
            )}
          </div>
        )}
      </section>

      {displayCards.length > 0 && (
        <section
          className="cards-page__section cards-page__compare"
          aria-labelledby="benefit-compare-title"
        >
          <div className="cards-page__section-head">
            <div>
              <p className="cards-page__section-title" id="benefit-compare-title">
                혜택 비교 요약
              </p>
              <p className="cards-page__section-desc">주요 조건을 한눈에 비교해보세요.</p>
            </div>

            <button
              type="button"
              className="cards-page__compare-button"
              onClick={() => setIsCompareOpen(true)}
            >
              <Scale size={15} />
              혜택 비교하기
            </button>
          </div>

          <div className="cards-page__compare-table-wrap">
            <table className="cards-page__compare-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>카드명</th>
                  <th>카드사</th>
                  <th>매칭 점수</th>
                  <th>연회비</th>
                </tr>
              </thead>
              <tbody>
                {displayCards.map((card) => (
                  <tr key={`compare-${card.recommendationId}`}>
                    <td>
                      <span className={`cards-page__table-rank cards-page__table-rank--${getTone(card.rank)}`}>
                        {card.rank}위
                      </span>
                    </td>
                    <td>
                      <div className="cards-page__table-card">
                        <span
                          className={`cards-page__table-thumb cards-page__table-thumb--${getTone(card.rank)}`}
                          aria-hidden="true"
                        >
                          {card.imgUrl ? (
                            <img src={card.imgUrl} alt="" className="cards-page__table-thumb-img" />
                          ) : (
                            getThumbLabel(card.rank)
                          )}
                        </span>
                        <strong>{card.cardName}</strong>
                      </div>
                    </td>
                    <td>{card.issuer}</td>
                    <td className="cards-page__compare-benefit">
                      {typeof card.matchScore === "number" ? `${card.matchScore}점` : "-"}
                    </td>
                    <td>{formatKRW(card.annualFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="cards-page__notice" aria-label="추천 안내">
        <Info size={18} />
        <div>
          <strong>안내</strong>
          <p>
            추천 결과는 등록된 영수증 소비 패턴을 기준으로 한 예시입니다. 실제 카드 혜택,
            전월 실적, 할인 한도는 카드사 정책에 따라 달라질 수 있습니다.
          </p>
        </div>
      </section>

      {isCompareOpen && (
        <CardCompareModal isOpen onClose={() => setIsCompareOpen(false)} cards={displayCards} />
      )}

      {detailCardId && (
        <CardDetailModal
          key={detailCardId}
          isOpen
          onClose={() => setDetailCardId(null)}
          cardId={detailCardId}
        />
      )}
    </div>
  );
};

export default Cards;
