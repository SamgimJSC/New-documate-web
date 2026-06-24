import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import ReceiptManualModal from "../../components/modal/ReceiptManualModal";
import ReceiptDeleteConfirmModal from "../../components/modal/ReceiptDeleteConfirmModal";
import { getReceipt, deleteReceipt } from "../../api/receipt";
import { formatDate } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import { useToast } from "../../components/common/Toast";
import type { Receipt } from "../../types/receipt";
import "./ReceiptDetail.css";

const ReceiptDetail: React.FC = () => {
  const { receipt_id } = useParams<{ receipt_id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

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
    return <div style={{ padding: 32, textAlign: "center", color: "var(--color-muted)" }}>불러오는 중...</div>;
  }

  if (!receipt) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p>영수증을 찾을 수 없습니다.</p>
        <Button variant="primary" size="sm" onClick={() => navigate("/receipts")}>목록으로</Button>
      </div>
    );
  }

  return (
    <div className="receipt-detail">
      <button className="receipt-detail__back" onClick={() => navigate("/receipts")}>
        <ArrowLeft size={16} /> 영수증 목록
      </button>

      <div className="receipt-detail__layout">
        <div className="receipt-detail__image">
          {receipt.fileUrl ? (
            <img className="receipt-detail__image-file" src={receipt.fileUrl} alt="영수증" />
          ) : (
            <div className="receipt-detail__no-image">
              <span className="receipt-detail__no-image-icon">🧾</span>
              <p>영수증 이미지 없음</p>
            </div>
          )}
        </div>

        <div className="receipt-detail__info">
          <div className="receipt-detail__info-header">
            <div>
              <p className="receipt-detail__store">{receipt.storeName}</p>
              {receipt.storeAddress && (
                <p className="receipt-detail__address">{receipt.storeAddress}</p>
              )}
            </div>
            <div className="receipt-detail__actions">
              <button className="receipt-detail__icon-btn" onClick={() => setEditOpen(true)} title="수정">
                <Pencil size={16} />
              </button>
              <button className="receipt-detail__icon-btn receipt-detail__icon-btn--danger" onClick={() => setDeleteOpen(true)} title="삭제">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <p className="receipt-detail__amount">{formatKRW(receipt.totalAmount)}</p>

          <div className="receipt-detail__fields">
            <div className="receipt-detail__field">
              <span className="receipt-detail__field-label">결제일</span>
              <span className="receipt-detail__field-value">{formatDate(receipt.purchaseDate)}</span>
            </div>
            <div className="receipt-detail__field">
              <span className="receipt-detail__field-label">카테고리</span>
              <span className="receipt-detail__field-value">{receipt.categoryName || "-"}</span>
            </div>
            <div className="receipt-detail__field">
              <span className="receipt-detail__field-label">입력 방식</span>
              <span className="receipt-detail__field-value">{receipt.inputMethod === "OCR" ? "OCR 스캔" : "직접 입력"}</span>
            </div>
            {receipt.paymentItem && (
              <div className="receipt-detail__field">
                <span className="receipt-detail__field-label">결제 항목</span>
                <span className="receipt-detail__field-value">{receipt.paymentItem}</span>
              </div>
            )}
            {receipt.memo && (
              <div className="receipt-detail__field">
                <span className="receipt-detail__field-label">메모</span>
                <span className="receipt-detail__field-value">{receipt.memo}</span>
              </div>
            )}
          </div>
        </div>
      </div>

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
