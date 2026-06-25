import React from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

const PlanCancelModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const { showToast } = useToast();

  const handleCancel = () => {
    onConfirm?.();
    showToast("요금제가 해지 예약되었습니다.", "info");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="요금제 해지" size="sm">
      <p style={{ marginBottom: 12, color: "var(--color-text-sub)" }}>
        PRO 요금제를 해지하시겠습니까?
      </p>

      <div
        style={{
          padding: 16,
          background: "var(--color-warning)1a",
          borderRadius: "var(--radius-sm)",
          marginBottom: 20,
          border: "1px solid #fde68a",
        }}
      >
        <p style={{ fontSize: "var(--font-size-sm)", color: "#92400e" }}>
          • 현재 결제 기간 종료 후 FREE 플랜으로 전환됩니다.
          <br />
          • 소비 리포트, AI 인사이트 등 PRO 기능을 이용할 수 없게 됩니다.
          <br />• 저장된 데이터는 유지됩니다.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="primary" onClick={onClose}>
          계속 사용하기
        </Button>
        <Button variant="ghost" onClick={handleCancel}>
          해지하기
        </Button>
      </div>
    </Modal>
  );
};

export default PlanCancelModal;
