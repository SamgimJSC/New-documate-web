import React, { useState } from "react";
import { Camera, PencilLine } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import ReceiptUploadModal from "./ReceiptUploadModal";
import ReceiptManualModal from "./ReceiptManualModal";
import type { Receipt } from "../../types/receipt";
import "./ReceiptBranchModal.css";

interface ReceiptBranchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: (receipt: Receipt) => void;
}

function ReceiptBranchModal({
  isOpen = false,
  onClose,
  onSaved,
}: ReceiptBranchModalProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const openUpload = () => {
    onClose?.();
    setUploadOpen(true);
  };

  const openManual = () => {
    onClose?.();
    setManualOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose ?? (() => {})}
        title="영수증 추가"
        size="md"
      >
        <div className="receipt-branch-modal">
          <div className="receipt-branch-modal__options">
            <button
              type="button"
              className="receipt-branch-modal__option"
              onClick={openUpload}
            >
              <span className="receipt-branch-modal__icon receipt-branch-modal__icon--camera">
                <Camera size={22} />
              </span>
              <strong>사진으로 추가</strong>
              <span>영수증 사진을 촬영하거나 앨범에서 선택</span>
            </button>

            <button
              type="button"
              className="receipt-branch-modal__option"
              onClick={openManual}
            >
              <span className="receipt-branch-modal__icon receipt-branch-modal__icon--manual">
                <PencilLine size={22} />
              </span>
              <strong>수기로 추가</strong>
              <span>영수증 정보를 직접 입력</span>
            </button>
          </div>

          <div className="receipt-branch-modal__actions">
            <Button variant="ghost" onClick={onClose} fullWidth>
              취소
            </Button>
          </div>
        </div>
      </Modal>

      <ReceiptUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
      <ReceiptManualModal
        isOpen={manualOpen}
        onClose={() => setManualOpen(false)}
        mode="CREATE"
        onSaved={(receipt) => {
          setManualOpen(false);
          onSaved?.(receipt);
        }}
      />
    </>
  );
}

export default ReceiptBranchModal;
