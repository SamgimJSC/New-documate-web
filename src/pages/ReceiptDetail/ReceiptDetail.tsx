import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
} from "lucide-react";
import Button from "../../components/common/Button";
import ReceiptManualModal from "../../components/modal/ReceiptManualModal";
import ReceiptDeleteConfirmModal from "../../components/modal/ReceiptDeleteConfirmModal";
import { getReceipt, deleteReceipt } from "../../api/receipt";
import { formatDate } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import { useToast } from "../../components/common/Toast";
import type { Receipt } from "../../types/receipt";
import "./ReceiptDetail.css";

const FieldMissing: React.FC<{ isOcr: boolean }> = ({ isOcr }) => (
  <span className="receipt-detail__ocr-missing">
    {isOcr ? "미인식" : "미입력"}
  </span>
);

const ReceiptDetail: React.FC = () => {
  const { receipt_id } = useParams<{ receipt_id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!receipt_id || receipt_id === "confirm") {
      setLoading(false);
      return;
    }
    getReceipt(receipt_id)
      .then(setReceipt)
      .catch(() => setReceipt(null))
      .finally(() => setLoading(false));
  }, [receipt_id]);

  // 전체화면에서 ESC 키로 닫기
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFullscreen]);

  const handleDelete = async () => {
    if (!receipt) return;
    try {
      await deleteReceipt(receipt.receiptId);
      showToast("영수증이 삭제되었습니다.", "success");
      navigate("/receipts");
    } catch {
      showToast("삭제 중 오류가 발생했습니다.", "error");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--color-muted)",
        }}
      >
        불러오는 중...
      </div>
    );
  }

  if (!receipt) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p>영수증을 찾을 수 없습니다.</p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/receipts")}
        >
          목록으로
        </Button>
      </div>
    );
  }

  const paymentItems = (() => {
    const formatPaymentAmount = (value: number | string) => {
      const amount =
        typeof value === "number"
          ? value
          : Number(String(value).replace(/[^0-9.-]/g, ""));

      if (Number.isNaN(amount)) return String(value);
      return `${amount.toLocaleString("ko-KR")}원`;
    };

    const prettifyPaymentText = (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return "";

      return trimmed.replace(/×\s*([0-9,]+)\s*(원)?/g, (_, amount: string) => {
        return `× ${formatPaymentAmount(amount)}`;
      });
    };

    const raw = receipt.paymentItem?.trim();
    if (!raw) return [];

    if (!/^\s*\[/.test(raw)) {
      return raw.split(",").map(prettifyPaymentText).filter(Boolean);
    }

    try {
      const json = raw
        .replace(/'/g, '"')
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false");

      const items = JSON.parse(json) as Array<{
        name?: string;
        quantity?: number | string | null;
        amount?: number | string | null;
        price?: number | string | null;
        totalPrice?: number | string | null;
      }>;

      return items
        .map((item) => {
          const name = item.name?.trim() || "상품명";
          const rawAmount =
            item.amount ?? item.price ?? item.totalPrice ?? item.quantity;

          if (rawAmount == null || rawAmount === "") return name;
          return `${name} × ${formatPaymentAmount(rawAmount)}`;
        })
        .filter(Boolean);
    } catch {
      return raw.split(",").map(prettifyPaymentText).filter(Boolean);
    }
  })();

  const isOcr = receipt.inputMethod === "OCR";
  const missingCount = [
    !receipt.storeName,
    receipt.totalAmount == null,
    !receipt.purchaseDate,
    !receipt.categoryName,
  ].filter(Boolean).length;
  const hasMissingFields = missingCount > 0;

  const fileExt = receipt.fileUrl
    ? (receipt.fileUrl.split(".").pop()?.toUpperCase() ?? "파일")
    : null;

  return (
    <div className="receipt-detail">
      <div className="receipt-detail__layout">
        {/* ── 왼쪽: 미리보기 ── */}
        <div className="receipt-detail__preview-card">
          <div className="receipt-detail__preview-header">
            <div className="receipt-detail__preview-header-left">
              <p className="receipt-detail__preview-title">영수증 미리보기</p>
              {fileExt && (
                <p className="receipt-detail__preview-meta">{fileExt}</p>
              )}
            </div>

            {receipt.fileUrl && (
              <div className="receipt-detail__preview-toolbar">
                <button
                  className="receipt-detail__toolbar-btn"
                  onClick={() => setZoom((z) => Math.max(z - 25, 50))}
                  disabled={zoom <= 50}
                  title="축소"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="receipt-detail__toolbar-zoom">{zoom}%</span>
                <button
                  className="receipt-detail__toolbar-btn"
                  onClick={() => setZoom((z) => Math.min(z + 25, 300))}
                  disabled={zoom >= 300}
                  title="확대"
                >
                  <ZoomIn size={13} />
                </button>
                <div className="receipt-detail__toolbar-divider" />
                <button
                  className="receipt-detail__toolbar-btn"
                  onClick={() => setIsFullscreen(true)}
                  title="전체화면"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="receipt-detail__preview-body">
            {receipt.fileUrl ? (
              <div className="receipt-detail__zoom-wrap">
                <img
                  className="receipt-detail__image-file"
                  src={receipt.fileUrl}
                  alt="영수증"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                  }}
                />
              </div>
            ) : (
              <div className="receipt-detail__no-image">
                <span className="receipt-detail__no-image-icon">🧾</span>
                <p>영수증 이미지 없음</p>
              </div>
            )}
          </div>
        </div>

        {/* ── 오른쪽: 문서 정보 ── */}
        <div className="receipt-detail__info-card">
          <div className="receipt-detail__info-card-header">
            <span className="receipt-detail__info-card-title">영수증 정보</span>
            <div className="receipt-detail__actions">
              <button
                className="receipt-detail__icon-btn"
                onClick={() => setEditOpen(true)}
                title="수정"
              >
                <Pencil size={14} />
              </button>
              <button
                className="receipt-detail__icon-btn receipt-detail__icon-btn--danger"
                onClick={() => setDeleteOpen(true)}
                title="삭제"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {hasMissingFields && (
            <div className="receipt-detail__ocr-banner">
              <AlertCircle
                size={15}
                className="receipt-detail__ocr-banner-icon"
              />
              <span>
                {isOcr
                  ? `OCR에서 인식하지 못한 항목이 ${missingCount}개 있습니다.`
                  : `입력되지 않은 항목이 ${missingCount}개 있습니다.`}
              </span>
              <button
                className="receipt-detail__ocr-banner-btn"
                onClick={() => setEditOpen(true)}
              >
                직접 입력하기
              </button>
            </div>
          )}

          <div className="receipt-detail__section">
            <p className="receipt-detail__section-title">기본 정보</p>
            <div className="receipt-detail__table">
              <div className="receipt-detail__table-row">
                <span className="receipt-detail__table-label">가게명</span>
                <span className="receipt-detail__table-value">
                  {receipt.storeName || <FieldMissing isOcr={isOcr} />}
                </span>
              </div>
              <div className="receipt-detail__table-row">
                <span className="receipt-detail__table-label">결제 금액</span>
                <span className="receipt-detail__table-value receipt-detail__table-value--amount">
                  {receipt.totalAmount != null ? (
                    formatKRW(receipt.totalAmount)
                  ) : (
                    <FieldMissing isOcr={isOcr} />
                  )}
                </span>
              </div>
              <div className="receipt-detail__table-row">
                <span className="receipt-detail__table-label">결제일</span>
                <span className="receipt-detail__table-value">
                  {receipt.purchaseDate ? (
                    formatDate(receipt.purchaseDate)
                  ) : (
                    <FieldMissing isOcr={isOcr} />
                  )}
                </span>
              </div>
              <div className="receipt-detail__table-row">
                <span className="receipt-detail__table-label">카테고리</span>
                <span className="receipt-detail__table-value">
                  {receipt.categoryName ? (
                    <span className="receipt-detail__category-badge">
                      {receipt.categoryName}
                    </span>
                  ) : (
                    <FieldMissing isOcr={isOcr} />
                  )}
                </span>
              </div>
              <div className="receipt-detail__table-row">
                <span className="receipt-detail__table-label">입력 방식</span>
                <span className="receipt-detail__table-value">
                  <span
                    className={`receipt-detail__method-badge receipt-detail__method-badge--${isOcr ? "ocr" : "manual"}`}
                  >
                    {isOcr ? "OCR 스캔" : "직접 입력"}
                  </span>
                </span>
              </div>
              {receipt.storeAddress && (
                <div className="receipt-detail__table-row">
                  <span className="receipt-detail__table-label">주소</span>
                  <span
                    className="receipt-detail__table-value"
                    style={{ fontWeight: 400 }}
                  >
                    {receipt.storeAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {paymentItems.length > 0 && (
            <div className="receipt-detail__section">
              <p className="receipt-detail__section-title">결제 항목</p>
              <div className="receipt-detail__items-chip-list">
                {paymentItems.map((item, index) => (
                  <span
                    className="receipt-detail__item-chip"
                    key={`${item}-${index}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {receipt.memo && (
            <div className="receipt-detail__section">
              <p className="receipt-detail__section-title">메모</p>
              <p className="receipt-detail__memo-text">{receipt.memo}</p>
            </div>
          )}
        </div>
      </div>

      {/* 전체화면 모달 */}
      {isFullscreen && receipt.fileUrl && (
        <div
          className="receipt-detail__fullscreen"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="receipt-detail__fullscreen-close"
            onClick={() => setIsFullscreen(false)}
          >
            <X size={20} />
          </button>
          <img
            src={receipt.fileUrl}
            alt="영수증 전체화면"
            className="receipt-detail__fullscreen-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ReceiptManualModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        mode="EDIT"
        receipt={receipt}
        onSaved={(updated) => setReceipt(updated)}
      />
      <ReceiptDeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ReceiptDetail;
