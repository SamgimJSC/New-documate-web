import React, { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  ImagePlus,
  ListChecks,
  MapPin,
  ReceiptText,
  StickyNote,
  Store,
  Tags,
  Wallet,
  X,
} from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import { mockSpendCategories } from "../../data/mockReceipts";
import { useToast } from "../common/Toast";
import { createReceipt, updateReceipt } from "../../api/receipt";
import type { ModalMode } from "../../types/common";
import type { Receipt } from "../../types/receipt";
import "./ReceiptManualModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode?: ModalMode;
  receipt?: Receipt;
  onSaved?: (receipt: Receipt) => void;
}

const ReceiptManualModal: React.FC<Props> = ({
  isOpen,
  onClose,
  mode = "CREATE",
  receipt,
  onSaved,
}) => {
  const { showToast } = useToast();
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentItem, setPaymentItem] = useState("");
  const [memo, setMemo] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mode === "EDIT" && receipt) {
      setStoreName(receipt.storeName ?? "");
      setStoreAddress(receipt.storeAddress ?? "");
      setAmount(receipt.totalAmount != null ? String(receipt.totalAmount) : "");
      setDate(receipt.purchaseDate ?? "");
      setCategoryId(receipt.spendCategoryId ? String(receipt.spendCategoryId) : "");
      setPaymentItem(
        receipt.paymentItem && !/^\s*\[/.test(receipt.paymentItem)
          ? receipt.paymentItem
          : "",
      );
      setMemo(receipt.memo ?? "");
      setImage(null);
      setImagePreview(null);
    } else if (isOpen && mode === "CREATE") {
      setStoreName("");
      setStoreAddress("");
      setAmount("");
      setDate("");
      setCategoryId("");
      setPaymentItem("");
      setMemo("");
      setImage(null);
      setImagePreview(null);
    }
  }, [isOpen, mode, receipt]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const categoryOptions = mockSpendCategories.map((c) => ({
    value: String(c.spendCategoryId),
    label: c.name,
  }));

  const applyImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("JPG 또는 PNG 이미지를 선택해주세요.", "error");
      return;
    }

    setImage(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyImage(e.target.files?.[0]);
  };

  const handleImageRemove = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    applyImage(e.dataTransfer.files?.[0]);
  };

  const handleSave = async () => {
    if (!storeName || !amount || !date) {
      showToast("가맹점명, 결제 금액, 결제일을 입력해주세요.", "error");
      return;
    }

    setSaving(true);
    try {
      const body = {
        storeName,
        storeAddress: storeAddress || undefined,
        totalAmount: Number(amount),
        purchaseDate: date,
        spendCategoryId: categoryId ? Number(categoryId) : null,
        paymentItem: paymentItem || undefined,
        memo: memo || undefined,
      };

      let saved: Receipt;
      if (mode === "EDIT" && receipt) {
        saved = await updateReceipt(receipt.receiptId, body);
      } else {
        saved = await createReceipt(
          { ...body, inputMethod: "MANUAL" },
          image ?? undefined,
        );
      }

      showToast(
        mode === "CREATE" ? "영수증이 추가되었습니다." : "영수증이 수정되었습니다.",
        "success",
      );
      onSaved?.(saved);
      onClose();
    } catch {
      showToast("저장 중 오류가 발생했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "CREATE" ? "수기로 영수증 추가" : "영수증 수정"}
      size="lg"
    >
      <div className="receipt-manual-modal">
        {mode === "CREATE" && (
          <div className="receipt-manual-modal__notice">
            <ReceiptText size={18} />
            <div>
              <strong>이미지가 없어도 괜찮아요</strong>
              <p>필수 정보만 입력하면 영수증을 직접 등록할 수 있습니다.</p>
            </div>
          </div>
        )}

        <div className="receipt-manual-modal__grid">
          <div className="receipt-manual-modal__field receipt-manual-modal__field--wide">
            <span className="receipt-manual-modal__field-icon"><Store size={15} /></span>
            <Input
              label="가맹점명"
              placeholder="가맹점명을 입력하세요"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>

          <div className="receipt-manual-modal__field receipt-manual-modal__field--wide">
            <span className="receipt-manual-modal__field-icon"><MapPin size={15} /></span>
            <Input
              label="주소"
              placeholder="주소를 입력하세요 (선택)"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
            />
          </div>

          <div className="receipt-manual-modal__field">
            <span className="receipt-manual-modal__field-icon"><Wallet size={15} /></span>
            <Input
              label="결제 금액"
              type="number"
              placeholder="금액을 입력하세요"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="receipt-manual-modal__field">
            <span className="receipt-manual-modal__field-icon"><CalendarDays size={15} /></span>
            <Input
              label="결제일"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="receipt-manual-modal__field">
            <span className="receipt-manual-modal__field-icon"><Tags size={15} /></span>
            <Select
              label="카테고리"
              value={categoryId}
              options={categoryOptions}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="카테고리 선택"
              required
            />
          </div>

          <div className="receipt-manual-modal__field">
            <span className="receipt-manual-modal__field-icon"><ListChecks size={15} /></span>
            <Input
              label="결제 항목"
              placeholder="예: 아메리카노, 샌드위치"
              value={paymentItem}
              onChange={(e) => setPaymentItem(e.target.value)}
            />
          </div>

          <div className="receipt-manual-modal__field receipt-manual-modal__field--wide">
            <span className="receipt-manual-modal__field-icon"><StickyNote size={15} /></span>
            <Input
              label="메모"
              placeholder="메모를 입력하세요 (선택)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

        {mode === "CREATE" && (
          <div className="receipt-manual-modal__photo-field">
            <div className="receipt-manual-modal__photo-label">
              <strong>영수증 사진</strong>
              <span>선택</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="receipt-manual-modal__file-input"
              onChange={handleImageChange}
            />

            {imagePreview ? (
              <div className="receipt-manual-modal__preview-wrap">
                <img
                  src={imagePreview}
                  alt="영수증 미리보기"
                  className="receipt-manual-modal__preview"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="receipt-manual-modal__remove-image"
                  aria-label="사진 삭제"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="receipt-manual-modal__photo-drop"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <ImagePlus size={22} />
                <span>사진 추가 또는 여기에 드래그</span>
              </button>
            )}
          </div>
        )}

        <div className="receipt-manual-modal__actions">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!storeName || !amount || !date || saving}
            loading={saving}
          >
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptManualModal;
