import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
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

  // 인라인 줌 드래그 패닝
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const previewDragRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null);

  // 전체화면 드래그 패닝
  const [fullscreenPan, setFullscreenPan] = useState({ x: 0, y: 0 });
  const [isFullscreenDragging, setIsFullscreenDragging] = useState(false);
  const fullscreenDragRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null);
  const fullscreenMoved = useRef(false);

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

  // 줌이 100%로 돌아오면 패닝 초기화
  useEffect(() => {
    if (zoom === 100) setPan({ x: 0, y: 0 });
  }, [zoom]);

  // 전체화면 열릴 때 패닝 초기화
  useEffect(() => {
    if (isFullscreen) {
      setFullscreenPan({ x: 0, y: 0 });
      fullscreenMoved.current = false;
    }
  }, [isFullscreen]);

  // 인라인 줌 드래그 핸들러
  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 100) return;
    e.preventDefault();
    previewDragRef.current = { mouseX: e.clientX, mouseY: e.clientY, panX: pan.x, panY: pan.y };
    setIsDragging(true);
  };

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    if (!previewDragRef.current) return;
    setPan({
      x: previewDragRef.current.panX + e.clientX - previewDragRef.current.mouseX,
      y: previewDragRef.current.panY + e.clientY - previewDragRef.current.mouseY,
    });
  };

  const handlePreviewMouseUp = () => {
    previewDragRef.current = null;
    setIsDragging(false);
  };

  // 전체화면 드래그 핸들러
  const handleFullscreenImgMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    fullscreenMoved.current = false;
    fullscreenDragRef.current = { mouseX: e.clientX, mouseY: e.clientY, panX: fullscreenPan.x, panY: fullscreenPan.y };
    setIsFullscreenDragging(true);
  };

  const handleFullscreenMouseMove = (e: React.MouseEvent) => {
    if (!fullscreenDragRef.current) return;
    const dx = e.clientX - fullscreenDragRef.current.mouseX;
    const dy = e.clientY - fullscreenDragRef.current.mouseY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) fullscreenMoved.current = true;
    setFullscreenPan({ x: fullscreenDragRef.current.panX + dx, y: fullscreenDragRef.current.panY + dy });
  };

  const handleFullscreenMouseUp = () => {
    fullscreenDragRef.current = null;
    setIsFullscreenDragging(false);
  };

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

  type PaymentItemEntry = {
    name: string;
    qty: string | null;
    price: string | null;
    rawAmount: number | null;
  };

  const paymentItems = (() => {
    const parseAmount = (value: number | string): number | null => {
      const n =
        typeof value === "number"
          ? value
          : Number(String(value).replace(/[^0-9.-]/g, ""));
      return Number.isNaN(n) ? null : n;
    };
    const fmtAmount = (value: number | string): string => {
      const n = parseAmount(value);
      if (n === null) return String(value);
      return `${n.toLocaleString("ko-KR")}원`;
    };

    const raw = receipt.paymentItem?.trim();
    if (!raw) return [] as PaymentItemEntry[];

    if (!/^\s*\[/.test(raw)) {
      return raw
        .split(",")
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text): PaymentItemEntry => ({ name: text, qty: null, price: null, rawAmount: null }));
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
        .map((item): PaymentItemEntry => {
          const name = item.name?.trim() || "상품명";
          const monetaryValue = item.amount ?? item.price ?? item.totalPrice ?? null;
          const rawAmount =
            monetaryValue != null && monetaryValue !== ""
              ? parseAmount(monetaryValue)
              : null;
          const qty = item.quantity;
          return {
            name,
            qty: qty != null && qty !== "" && Number(qty) > 0 ? `×${qty}개` : null,
            price: rawAmount != null ? fmtAmount(rawAmount) : null,
            rawAmount,
          };
        })
        .filter((item) => item.name);
    } catch {
      return raw
        .split(",")
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text): PaymentItemEntry => ({ name: text, qty: null, price: null, rawAmount: null }));
    }
  })();

  const itemsTotalAmount = paymentItems.reduce((sum, item) => sum + (item.rawAmount ?? 0), 0);
  const itemsTotalText = itemsTotalAmount > 0
    ? `${itemsTotalAmount.toLocaleString("ko-KR")}원`
    : null;

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
              <div
                className="receipt-detail__zoom-wrap"
                onMouseMove={handlePreviewMouseMove}
                onMouseUp={handlePreviewMouseUp}
                onMouseLeave={handlePreviewMouseUp}
              >
                <img
                  className="receipt-detail__image-file"
                  src={receipt.fileUrl}
                  alt="영수증"
                  draggable={false}
                  style={{
                    transform: `scale(${zoom / 100}) translate(${pan.x * (100 / zoom)}px, ${pan.y * (100 / zoom)}px)`,
                    transformOrigin: "top center",
                    cursor: zoom > 100 ? (isDragging ? "grabbing" : "grab") : "default",
                    transition: isDragging ? "none" : "transform 0.15s",
                    userSelect: "none",
                  }}
                  onMouseDown={handlePreviewMouseDown}
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
              <AlertCircle size={15} className="receipt-detail__ocr-banner-icon" />
              <span>
                {isOcr
                  ? `OCR에서 인식하지 못한 항목이 ${missingCount}개 있습니다.`
                  : `입력되지 않은 항목이 ${missingCount}개 있습니다.`}
              </span>
              <button className="receipt-detail__ocr-banner-btn" onClick={() => setEditOpen(true)}>
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
                  {receipt.totalAmount != null ? formatKRW(receipt.totalAmount) : <FieldMissing isOcr={isOcr} />}
                </span>
              </div>
              <div className="receipt-detail__table-row">
                <span className="receipt-detail__table-label">결제일</span>
                <span className="receipt-detail__table-value">
                  {receipt.purchaseDate ? formatDate(receipt.purchaseDate) : <FieldMissing isOcr={isOcr} />}
                </span>
              </div>
              <div className="receipt-detail__table-row">
                <span className="receipt-detail__table-label">카테고리</span>
                <span className="receipt-detail__table-value">
                  {receipt.categoryName
                    ? <span className="receipt-detail__category-badge">{receipt.categoryName}</span>
                    : <FieldMissing isOcr={isOcr} />}
                </span>
              </div>
              <div className="receipt-detail__table-row">
                <span className="receipt-detail__table-label">입력 방식</span>
                <span className="receipt-detail__table-value">
                  <span className={`receipt-detail__method-badge receipt-detail__method-badge--${isOcr ? "ocr" : "manual"}`}>
                    {isOcr ? "OCR 스캔" : "직접 입력"}
                  </span>
                </span>
              </div>
              {receipt.storeAddress && (
                <div className="receipt-detail__table-row">
                  <span className="receipt-detail__table-label">주소</span>
                  <span className="receipt-detail__table-value" style={{ fontWeight: 400 }}>
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
                  <span className="receipt-detail__item-chip" key={`${item.name}-${index}`}>
                    <span className="receipt-detail__item-chip-name">
                      {item.name}{item.qty ? ` ${item.qty}` : ""}
                    </span>
                    {item.price && (
                      <span className="receipt-detail__item-chip-price">{item.price}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 전체화면 모달 */}
      {isFullscreen && receipt.fileUrl && (
        <div
          className="receipt-detail__fullscreen"
          onMouseMove={handleFullscreenMouseMove}
          onMouseUp={handleFullscreenMouseUp}
          onMouseLeave={handleFullscreenMouseUp}
          onClick={() => { if (!fullscreenMoved.current) setIsFullscreen(false); }}
        >
          <button
            className="receipt-detail__fullscreen-close"
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
          >
            <X size={20} />
          </button>
          <img
            src={receipt.fileUrl}
            alt="영수증 전체화면"
            className="receipt-detail__fullscreen-img"
            draggable={false}
            style={{
              transform: `translate(${fullscreenPan.x}px, ${fullscreenPan.y}px)`,
              cursor: isFullscreenDragging ? "grabbing" : "grab",
              transition: isFullscreenDragging ? "none" : "transform 0.1s",
              userSelect: "none",
            }}
            onMouseDown={handleFullscreenImgMouseDown}
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
