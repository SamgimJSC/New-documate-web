import React, { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import PinKeypad from "../common/PinKeypad";
import { useToast } from "../common/Toast";
import "./PinResetModal.css";

interface PinVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (pin: string) => void;
  title?: string;
  description?: string;
}

const PinVerifyModal: React.FC<PinVerifyModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  title = "캐비닛 PIN 입력",
  description = "잠긴 문서를 열려면 캐비닛 PIN 6자리를 입력해주세요.",
}) => {
  const { showToast } = useToast();
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!isOpen) setPin("");
  }, [isOpen]);

  const handleSubmit = (value: string) => {
    if (value.length !== 6) {
      showToast("PIN 6자리를 입력해주세요.", "error");
      return;
    }

    // TODO: API 연결 시 /auth/pin/verify 결과로 성공 여부 처리
    onVerified(value);
    setPin("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="pin-verify">
        <div className="pin-verify__notice">
          <LockKeyhole size={18} />
          <div>
            <strong>보안 문서 확인</strong>
            <p>현재 단계에서는 프론트 UI만 구현되어 있어 6자리 입력 시 해제 처리됩니다.</p>
          </div>
        </div>

        <PinKeypad
          value={pin}
          onChange={setPin}
          onSubmit={handleSubmit}
          title="PIN 입력"
          description={description}
          submitLabel="해제"
          helperText="API 연결 후에는 서버 검증 결과에 따라 문서가 열립니다."
        />

        <div className="pin-verify__actions">
          <Button variant="ghost" onClick={onClose} size="sm">
            취소
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PinVerifyModal;
