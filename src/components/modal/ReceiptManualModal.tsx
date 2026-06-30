import React, { useState, useEffect, useRef } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import { mockSpendCategories } from "../../data/mockReceipts";
import { useToast } from "../common/Toast";
import { createReceipt, updateReceipt } from "../../api/receipt";
import type { ModalMode } from "../../types/common";
import type { Receipt } from "../../types/receipt";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode?: ModalMode;
  receipt?: Receipt;
  onSaved?: (receipt: Receipt) => void;
}

const ReceiptManualModal: React.FC<Props> = ({ isOpen, onClose, mode = "CREATE", receipt, onSaved }) => {
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
      setAmount(String(receipt.totalAmount));
      setDate(receipt.purchaseDate);
      setCategoryId(receipt.spendCategoryId ? String(receipt.spendCategoryId) : "");
      setPaymentItem(receipt.paymentItem && !/^\s*\[/.test(receipt.paymentItem) ? receipt.paymentItem : "");
      setMemo(receipt.memo ?? "");
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

  const categoryOptions = mockSpendCategories.map((c) => ({
    value: String(c.spendCategoryId),
    label: c.name,
  }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!storeName || !amount || !date) return;
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
        saved = await createReceipt({ ...body, inputMethod: "MANUAL" }, image ?? undefined);
      }

      showToast(mode === "CREATE" ? "영수증이 추가되었습니다." : "영수증이 수정되었습니다.", "success");
      onSaved?.(saved);
      onClose();
    } catch {
      showToast("저장 중 오류가 발생했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "CREATE" ? "영수증 직접 입력" : "영수증 수정"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="가맹점명" placeholder="가맹점명을 입력하세요" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
        <Input label="주소" placeholder="주소를 입력하세요 (선택)" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} />
        <Input label="결제 금액" type="number" placeholder="금액을 입력하세요" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input label="결제일" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Select label="카테고리" value={categoryId} options={categoryOptions} onChange={(e) => setCategoryId(e.target.value)} placeholder="카테고리 선택" required />
        <Input label="결제 항목" placeholder="결제 항목을 입력하세요 (선택)" value={paymentItem} onChange={(e) => setPaymentItem(e.target.value)} />
        <Input label="메모" placeholder="메모를 입력하세요 (선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />

        {mode === "CREATE" && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block", color: "#374151" }}>
              영수증 사진{" "}
              <span style={{ color: "#9ca3af", fontWeight: 400 }}>(선택)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div style={{ position: "relative" }}>
                <img
                  src={imagePreview}
                  alt="영수증 미리보기"
                  style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", display: "block" }}
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  style={{
                    position: "absolute", top: 6, right: 6,
                    background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%",
                    width: 24, height: 24, cursor: "pointer", color: "#fff",
                    fontSize: 16, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{
                  width: "100%", padding: "16px 0", border: "2px dashed #d1d5db",
                  borderRadius: 8, background: "#f9fafb", cursor: "pointer",
                  color: "#6b7280", fontSize: 13, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 6,
                }}
              >
                <span style={{ fontSize: 22 }}>📷</span>
                <span>사진 추가 또는 여기에 드래그</span>
              </button>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>취소</Button>
          <Button variant="primary" onClick={handleSave} disabled={!storeName || !amount || !date || saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptManualModal;
