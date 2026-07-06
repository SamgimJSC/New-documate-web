import React, { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import PinKeypad from "../common/PinKeypad";
import { useToast } from "../common/Toast";
import { userService } from "../../services/userService";
import "./PinResetModal.css";

interface PinVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (pin: string) => void;
  title?: string;
  description?: string;
  submitLabel?: string;
  // 단순 PIN 확인이 아니라 다른 동작(잠금 설정 변경 등)과 검증을 함께 처리해야 할 때 주입
  verify?: (pin: string) => Promise<void>;
}

const PinVerifyModal: React.FC<PinVerifyModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  title = "캐비닛 PIN 입력",
  description = "잠긴 문서를 열려면 캐비닛 PIN 6자리를 입력해주세요.",
  submitLabel = "확인",
  verify,
}) => {
  const { showToast } = useToast();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) setPin("");
  }, [isOpen]);

  const handleSubmit = async (value: string) => {
    if (value.length !== 6) {
      showToast("PIN 6자리를 입력해주세요.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await (verify ? verify(value) : userService.verifyPin(value));
      onVerified(value);
      setPin("");
      onClose();
    } catch (err: any) {
      const errorCode = err?.response?.data?.errorCode;
      if (errorCode === "INVALID_PIN") {
        showToast("PIN이 일치하지 않습니다.", "error");
      } else if (errorCode === "PIN_NOT_SET") {
        showToast("등록된 PIN이 없습니다.", "error");
      } else if (errorCode === "PIN_LOCKED") {
        showToast(
          "PIN 입력 횟수를 초과했습니다. 이메일 로그인을 이용해주세요.",
          "error",
        );
      } else {
        showToast("PIN 확인에 실패했습니다. 다시 시도해주세요.", "error");
      }
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="pin-verify">
        <div className="pin-verify__notice">
          <LockKeyhole size={18} />
          <div>
            <strong>디지털 캐비닛 PIN 확인</strong>
            <p>PIN은 화면에 표시되지 않으며 입력 자리만 표시됩니다.</p>
          </div>
        </div>

        <PinKeypad
          value={pin}
          onChange={setPin}
          onSubmit={handleSubmit}
          title="PIN 입력"
          description={description}
          submitLabel={isLoading ? "확인 중..." : submitLabel}
          helperText="숫자는 화면에 표시되지 않고 입력 자리만 표시됩니다."
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
