import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
}

const ReceiptDeleteConfirmModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm?.();
      showToast("영수증이 삭제되었습니다.", "success");
      onClose();
    } catch {
      showToast("삭제에 실패했습니다.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="영수증 삭제" size="sm">
      <p style={{ marginBottom: 20, color: "var(--color-text-sub)" }}>
        이 영수증을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="ghost" onClick={onClose} disabled={deleting}>취소</Button>
        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "삭제 중..." : "삭제"}
        </Button>
      </div>
    </Modal>
  );
};

export default ReceiptDeleteConfirmModal;
