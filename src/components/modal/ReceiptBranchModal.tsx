import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import ReceiptUploadModal from "./ReceiptUploadModal";
import ReceiptManualModal from "./ReceiptManualModal";
import type { Receipt } from "../../types/receipt";

interface ReceiptBranchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: (receipt: Receipt) => void;
}

function ReceiptBranchModal({ isOpen = false, onClose, onSaved }: ReceiptBranchModalProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="영수증 추가">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)", marginBottom: 4 }}>
            영수증 추가 방법을 선택하세요.
          </p>
          <Button
            variant="ghost"
            onClick={() => { onClose?.(); setUploadOpen(true); }}
          >
            📷 OCR 스캔 (이미지 업로드)
          </Button>
          <Button
            variant="ghost"
            onClick={() => { onClose?.(); setManualOpen(true); }}
          >
            ✏️ 직접 입력
          </Button>
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
