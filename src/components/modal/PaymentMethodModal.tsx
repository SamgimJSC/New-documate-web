import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";
import type { PaymentMethodType } from "../../types/payment";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentMethodModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<PaymentMethodType>("KAKAOPAY");

  const methods: { value: PaymentMethodType; label: string; desc: string }[] = [
    { value: "KAKAOPAY", label: "카카오페이", desc: "카카오페이로 간편 결제" },
    { value: "NAVERPAY", label: "네이버페이", desc: "네이버페이로 간편 결제" },
    { value: "CARD", label: "신용카드", desc: "신용카드 / 체크카드" },
  ];

  const handleSave = () => {
    showToast("결제 수단이 변경되었습니다.", "success");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="결제 수단 변경" size="sm">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {methods.map((m) => (
          <label
            key={m.value}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: "var(--radius-sm)",
              border: `1.5px solid ${selected === m.value ? "var(--color-primary)" : "var(--color-border)"}`,
              background: selected === m.value ? "var(--color-primary-light)" : "var(--color-surface)",
              cursor: "pointer",
            }}
          >
            <input type="radio" name="payment" value={m.value} checked={selected === m.value} onChange={() => setSelected(m.value)} />
            <div>
              <p style={{ fontWeight: 600, fontSize: "var(--font-size-md)" }}>{m.label}</p>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>{m.desc}</p>
            </div>
          </label>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button variant="primary" onClick={handleSave}>저장</Button>
      </div>
    </Modal>
  );
};

export default PaymentMethodModal;
