import React, { useState, useEffect } from "react";
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
  const [saving, setSaving] = useState(false);

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
    }
  }, [isOpen, mode, receipt]);

  const categoryOptions = mockSpendCategories.map((c) => ({
    value: String(c.spendCategoryId),
    label: c.name,
  }));

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
        saved = await createReceipt({ ...body, inputMethod: "MANUAL" });
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
        <Select label="카테고리" value={categoryId} options={categoryOptions} onChange={(e) => setCategoryId(e.target.value)} placeholder="카테고리 선택" />
        <Input label="결제 항목" placeholder="결제 항목을 입력하세요 (선택)" value={paymentItem} onChange={(e) => setPaymentItem(e.target.value)} />
        <Input label="메모" placeholder="메모를 입력하세요 (선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />
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
