import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import { mockSpendCategories } from "../../data/mockReceipts";
import { useToast } from "../common/Toast";
import type { ModalMode } from "../../types/common";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode?: ModalMode;
}

const ReceiptManualModal: React.FC<Props> = ({ isOpen, onClose, mode = "CREATE" }) => {
  const { showToast } = useToast();
  const [storeName, setStoreName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [memo, setMemo] = useState("");

  const categoryOptions = mockSpendCategories.map((c) => ({
    value: String(c.spend_category_id),
    label: c.name,
  }));

  const handleSave = () => {
    showToast(mode === "CREATE" ? "영수증이 추가되었습니다." : "영수증이 수정되었습니다.", "success");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "CREATE" ? "영수증 직접 입력" : "영수증 수정"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="가맹점명" placeholder="가맹점명을 입력하세요" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
        <Input label="결제 금액" type="number" placeholder="금액을 입력하세요" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input label="결제일" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Select label="카테고리" value={categoryId} options={categoryOptions} onChange={(e) => setCategoryId(e.target.value)} placeholder="카테고리 선택" />
        <Input label="메모" placeholder="메모를 입력하세요 (선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleSave} disabled={!storeName || !amount || !date}>저장</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptManualModal;
