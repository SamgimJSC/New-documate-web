import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronRight,
  Coffee,
  CreditCard,
  Download,
  Info,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  cardRecommendationSummary,
  recommendedCards,
  type RecommendedCard,
} from "../../data/mockCards";
import { formatKRW } from "../../utils/formatCurrency";
import "./Cards.css";

const getThumbLabel = (card: RecommendedCard) => {
  if (card.rank === 1) return "GOOD";
  if (card.rank === 2) return "CLEAR+";
  if (card.rank === 3) return "PASS";
  return card.englishName;
};

const Cards: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = useState(recommendedCards[0]?.id ?? "");

  const selectedCard = useMemo(
    () => recommendedCards.find((card) => card.id === selectedCardId) ?? recommendedCards[0],
    [selectedCardId],
  );

  const topBenefit = recommendedCards[0]?.expectedBenefit ?? 0;

  const handleSelectCard = (card: RecommendedCard) => {
    setSelectedCardId(card.id);
  };

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
            <span>
              <Coffee size={15} />
              {cardRecommendationSummary.topCategory} 중심 추천
            </span>
            <span>
              <Wallet size={15} />
              예상 월 지출 {formatKRW(cardRecommendationSummary.expectedMonthlySpend)}
            </span>
            <span>
              <CreditCard size={15} />
              추천 카드 {recommendedCards.length}개
            </span>
          </div>
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
            <strong>{cardRecommendationSummary.topCategory}</strong>
            <span>전체 소비의 {cardRecommendationSummary.topCategoryShare}%</span>
          </div>
        </article>

        <article className="cards-page__summary-card">
          <span className="cards-page__summary-icon cards-page__summary-icon--mint">
            <Wallet size={20} />
          </span>
          <div>
            <p>예상 월 혜택</p>
            <strong>최대 {formatKRW(topBenefit)}</strong>
            <span>추천 카드 기준</span>
          </div>
        </article>

        <article className="cards-page__summary-card">
          <span className="cards-page__summary-icon cards-page__summary-icon--orange">
            <BadgeCheck size={20} />
          </span>
          <div>
            <p>추천 기준</p>
            <strong>{cardRecommendationSummary.recommendationRule}</strong>
            <span>연회비 낮은 순 반영</span>
          </div>
        </article>
      </section>

      <section className="cards-page__ai-box" aria-label="AI 추천 요약">
        <span className="cards-page__ai-icon">
          <Sparkles size={21} />
        </span>
        <div>
          <strong>AI가 분석한 소비 패턴 결과예요!</strong>
          <p>
            전월 대비 소비가 증가했고, 특히 {cardRecommendationSummary.topCategory} 지출
            비중이 가장 높아요. 관련 소비 횟수나 금액을 한 번만 줄여도 다음 달 지출
            관리에 도움이 됩니다.
          </p>
        </div>
      </section>

      <section className="cards-page__section" aria-labelledby="recommended-card-title">
        <div className="cards-page__section-head">
          <div>
            <p className="cards-page__section-title" id="recommended-card-title">
              추천 카드 TOP 3
            </p>
            <p className="cards-page__section-desc">
              선택한 소비 패턴을 기반으로 예상 혜택이 높은 카드를 추천해드려요.
            </p>
          </div>

          <button type="button" className="cards-page__policy-button">
            추천 기준 및 정책 안내
            <Info size={15} />
          </button>
        </div>

        <div className="cards-page__recommend-grid">
          {recommendedCards.map((card) => (
            <article
              key={card.id}
              className={`cards-page__recommend-card cards-page__recommend-card--${card.tone}${
                selectedCardId === card.id ? " is-selected" : ""
              }`}
            >
              <div className={`cards-page__card-visual cards-page__card-visual--${card.tone}`}>
                <span className="cards-page__rank-badge">{card.rank}위</span>
                <CreditCard size={24} className="cards-page__card-chip" />
                <span className="cards-page__card-brand">{card.englishName}</span>
                <strong className="cards-page__card-label">{getThumbLabel(card)}</strong>
                <Coffee size={34} className="cards-page__card-symbol" />
              </div>

              <div className="cards-page__recommend-content">
                <div className="cards-page__recommend-title-row">
                  <div>
                    <strong>{card.name}</strong>
                    <span>{card.benefitTitle}</span>
                  </div>
                  {card.rank === 1 && <span className="cards-page__best-badge">BEST</span>}
                </div>

                <p>{card.benefitDescription}</p>

                <div className="cards-page__benefit-grid">
                  <div>
                    <span>예상 혜택</span>
                    <strong>{formatKRW(card.expectedBenefit)}</strong>
                  </div>
                  <div>
                    <span>전월 실적</span>
                    <strong>{card.monthlyRequirement}</strong>
                  </div>
                  <div>
                    <span>연회비</span>
                    <strong>{formatKRW(card.annualFee)}</strong>
                  </div>
                </div>

                <div className="cards-page__bottom-row">
                  <div className="cards-page__tag-row">
                    {card.tags.map((tag) => (
                      <span key={`${card.id}-${tag}`}>{tag}</span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="cards-page__detail-button"
                    onClick={() => handleSelectCard(card)}
                  >
                    상세 보기
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

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

          <button type="button" className="cards-page__download-button">
            <Download size={15} />
            혜택 비교표 다운로드
          </button>
        </div>

        <div className="cards-page__compare-table-wrap">
          <table className="cards-page__compare-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>카드명</th>
                <th>주요 혜택</th>
                <th>예상 월 혜택</th>
                <th>전월 실적</th>
                <th>연회비</th>
                <th>주요 카테고리</th>
              </tr>
            </thead>
            <tbody>
              {recommendedCards.map((card) => (
                <tr
                  key={`compare-${card.id}`}
                  className={selectedCardId === card.id ? "is-selected" : ""}
                >
                  <td>
                    <span className={`cards-page__table-rank cards-page__table-rank--${card.tone}`}>
                      {card.rank}위
                    </span>
                  </td>
                  <td>
                    <div className="cards-page__table-card">
                      <span
                        className={`cards-page__table-thumb cards-page__table-thumb--${card.tone}`}
                        aria-hidden="true"
                      >
                        {getThumbLabel(card)}
                      </span>
                      <strong>{card.name}</strong>
                    </div>
                  </td>
                  <td>{card.benefitTitle}</td>
                  <td className="cards-page__compare-benefit">
                    {formatKRW(card.expectedBenefit)}
                  </td>
                  <td>{card.monthlyRequirement}</td>
                  <td>{formatKRW(card.annualFee)}</td>
                  <td>{card.tags.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCard && (
          <p className="cards-page__compare-selected">
            현재 선택 카드: <strong>{selectedCard.name}</strong>
          </p>
        )}
      </section>

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
    </div>
  );
};

export default Cards;
