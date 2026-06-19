import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import ReceiptManualModal from "../../components/modal/ReceiptManualModal";
import ReceiptDeleteConfirmModal from "../../components/modal/ReceiptDeleteConfirmModal";
import { mockReceipts, mockSpendCategories } from "../../data/mockReceipts";
import { formatDate } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import { useToast } from "../../components/common/Toast";
import "./ReceiptDetail.css";

const ReceiptDetail: React.FC = () => {
  const { receipt_id } = useParams<{ receipt_id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isNew = receipt_id === "confirm";
  const receipt = isNew ? mockReceipts[0] : mockReceipts.find((r) => r.receipt_id === receipt_id);

  if (!receipt) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p>영수증을 찾을 수 없습니다.</p>
        <Button variant="primary" size="sm" onClick={() => navigate("/receipts")}>목록으로</Button>
      </div>
    );
  }

  const category = mockSpendCategories.find((c) => c.spend_category_id === receipt.spend_category_id);

  const handleSave = () => {
    showToast("저장되었습니다.", "success");
    navigate("/receipts");
  };

  return (
    <div className="receipt-detail">
      <button className="receipt-detail__back" onClick={() => navigate("/receipts")}>
        <ArrowLeft size={16} /> 영수증 목록
      </button>

      <div className="receipt-detail__layout">
        <div className="receipt-detail__image">
          {receipt.file_url ? (
            <img className="receipt-detail__image-file" src={receipt.file_url} alt="영수증" />
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
              <p className="receipt-detail__store">{receipt.store_name}</p>
              {receipt.store_address && (
                <p className="receipt-detail__address">{receipt.store_address}</p>
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

          <p className="receipt-detail__amount">{formatKRW(receipt.total_amount)}</p>

          <div className="receipt-detail__fields">
            <div className="receipt-detail__field">
              <span className="receipt-detail__field-label">결제일</span>
              <span className="receipt-detail__field-value">{formatDate(receipt.purchase_date)}</span>
            </div>
            <div className="receipt-detail__field">
              <span className="receipt-detail__field-label">카테고리</span>
              <span className="receipt-detail__field-value">{category?.name || "-"}</span>
            </div>
            <div className="receipt-detail__field">
              <span className="receipt-detail__field-label">입력 방식</span>
              <span className="receipt-detail__field-value">{receipt.input_method === "OCR" ? "OCR 스캔" : "직접 입력"}</span>
            </div>
            {receipt.payment_item && (
              <div className="receipt-detail__field">
                <span className="receipt-detail__field-label">결제 항목</span>
                <span className="receipt-detail__field-value">{receipt.payment_item}</span>
              </div>
            )}
            {receipt.memo && (
              <div className="receipt-detail__field">
                <span className="receipt-detail__field-label">메모</span>
                <span className="receipt-detail__field-value">{receipt.memo}</span>
              </div>
            )}
          </div>

          {isNew && (
            <div className="receipt-detail__new-actions">
              <Button variant="ghost" onClick={() => navigate("/receipts")}>취소</Button>
              <Button variant="primary" onClick={handleSave}>저장</Button>
            </div>
          )}
        </div>
      </div>

      <ReceiptManualModal isOpen={editOpen} onClose={() => setEditOpen(false)} mode="EDIT" />
      <ReceiptDeleteConfirmModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => navigate("/receipts")} />
    </div>
  );
};

export default ReceiptDetail;
