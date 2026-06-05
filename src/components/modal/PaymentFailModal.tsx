import React from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  failReason?: string;
}

const PaymentFailModal: React.FC<Props> = ({ isOpen, onClose, failReason }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="결제 실패" size="sm">
      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>❌</p>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>결제에 실패했습니다.</p>
        {failReason && (
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)", marginBottom: 16 }}>
            사유: {failReason}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>닫기</Button>
          <Button variant="primary" onClick={onClose}>다시 시도</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentFailModal;
