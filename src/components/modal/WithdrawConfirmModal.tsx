import React from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawConfirmModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleWithdraw = () => {
    showToast("회원탈퇴가 완료되었습니다.", "info");
    onClose();
    navigate("/login");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="최종 탈퇴 확인" size="sm">
      <div style={{ padding: "8px 0 16px" }}>
        <div style={{ padding: 16, background: "var(--color-danger-light)", borderRadius: "var(--radius-sm)", marginBottom: 16, border: "1px solid #fecaca" }}>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-danger)", fontWeight: 600 }}>
            ⚠️ 이 작업은 되돌릴 수 없습니다.
          </p>
          <p style={{ fontSize: "var(--font-size-sm)", color: "#b91c1c", marginTop: 8 }}>
            모든 문서, 영수증, 데이터가 영구 삭제됩니다.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button variant="danger" onClick={handleWithdraw}>탈퇴하기</Button>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawConfirmModal;
