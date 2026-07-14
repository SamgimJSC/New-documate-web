import React, { useEffect, useState } from "react";
import { CircleAlert, ExternalLink, Loader2 } from "lucide-react";
import Modal from "../common/Modal";
import CardArtwork from "../common/CardArtwork";
import { getCardDetail } from "../../api/card";
import type { CardDetail } from "../../types/card";
import { formatKRW } from "../../utils/formatCurrency";
import "./CardDetailModal.css";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string | null;
}

// 카드마다 새 인스턴스로 마운트되도록 부모에서 key={cardId}를 지정해 사용한다.
// (재조회 시 로딩 상태로 리셋하려고 effect 안에서 setState를 직접 호출하는 대신, 인스턴스를 새로 만든다.)
const CardDetailModal: React.FC<CardDetailModalProps> = ({ isOpen, onClose, cardId }) => {
  const [detail, setDetail] = useState<CardDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "not-found">("loading");

  useEffect(() => {
    if (!cardId) return;

    let cancelled = false;

    getCardDetail(cardId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        const httpStatus = (error as { response?: { status?: number } })?.response?.status;
        setStatus(httpStatus === 404 ? "not-found" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const benefits = detail?.benefits;
  const categoryEntries = benefits?.categories ? Object.entries(benefits.categories) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={detail?.cardName ?? "카드 상세"} size="lg">
      {status === "loading" && (
        <div className="card-detail-modal__state">
          <Loader2 size={24} className="card-detail-modal__spinner" />
          <p>카드 정보를 불러오고 있어요.</p>
        </div>
      )}

      {status === "error" && (
        <div className="card-detail-modal__state">
          <CircleAlert size={24} />
          <p>카드 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
        </div>
      )}

      {status === "not-found" && (
        <div className="card-detail-modal__state">
          <CircleAlert size={24} />
          <p>해당 카드 정보를 찾을 수 없어요.</p>
        </div>
      )}

      {status === "ready" && detail && (
        <div className="card-detail-modal__body">
          <div className="card-detail-modal__head">
            <CardArtwork imgUrl={detail.imgUrl} alt={detail.cardName} />
            <div>
              <p className="card-detail-modal__issuer">{detail.issuer}</p>
              <div className="card-detail-modal__meta-row">
                <span>연회비 {formatKRW(detail.annualFee)}</span>
                {benefits?.network && <span>{benefits.network}</span>}
              </div>
            </div>
          </div>

          {benefits?.annual_fee &&
            (benefits.annual_fee.domestic != null || benefits.annual_fee.overseas != null) && (
              <section className="card-detail-modal__section">
                <h3>연회비</h3>
                <div className="card-detail-modal__fee-row">
                  {benefits.annual_fee.domestic != null && (
                    <span>국내 전용 {formatKRW(benefits.annual_fee.domestic)}</span>
                  )}
                  {benefits.annual_fee.overseas != null && (
                    <span>해외겸용 {formatKRW(benefits.annual_fee.overseas)}</span>
                  )}
                </div>
              </section>
            )}

          {benefits?.summary && benefits.summary.length > 0 && (
            <section className="card-detail-modal__section">
              <h3>주요 혜택</h3>
              <ul className="card-detail-modal__summary-list">
                {benefits.summary.map((item, index) => (
                  <li key={`${item.title ?? "summary"}-${index}`}>
                    {item.title && <strong>{item.title}</strong>}
                    {item.value && <span className="card-detail-modal__summary-value">{item.value}</span>}
                    {item.note && <p>{item.note}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {categoryEntries.length > 0 && (
            <section className="card-detail-modal__section">
              <h3>카테고리별 혜택</h3>
              {categoryEntries.map(([category, items]) => (
                <div key={category} className="card-detail-modal__category">
                  <p className="card-detail-modal__category-title">{category}</p>
                  <ul>
                    {(items ?? []).map((line, index) => (
                      <li key={`${category}-${index}`}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {benefits?.details && benefits.details.length > 0 && (
            <section className="card-detail-modal__section">
              <h3>상세 안내</h3>
              <ul className="card-detail-modal__detail-list">
                {benefits.details.map((item, index) => (
                  <li key={`${item.title ?? "detail"}-${index}`}>
                    {item.title && <strong>{item.title}</strong>}
                    {item.desc && <p>{item.desc}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {detail.sourceUrl && (
            <a
              href={detail.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="card-detail-modal__source-link"
            >
              카드사 원문 보기
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CardDetailModal;
