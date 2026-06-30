import React, { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import PinKeypad from "../common/PinKeypad";
import { useToast } from "../common/Toast";
import { userService } from "../../services/userService";
import "./PinResetModal.css";

type PinStep = "current" | "new" | "confirm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STEP_TEXT: Record<PinStep, { label: string; title: string; desc: string }> = {
  current: {
    label: "현재 PIN",
    title: "현재 PIN 입력",
    desc: "기존 캐비닛 PIN 6자리를 입력해주세요.",
  },
  new: {
    label: "새 PIN",
    title: "새 PIN 설정",
    desc: "앞으로 사용할 새 캐비닛 PIN 6자리를 입력해주세요.",
  },
  confirm: {
    label: "확인",
    title: "새 PIN 확인",
    desc: "방금 입력한 새 PIN을 한 번 더 입력해주세요.",
  },
};

const PinResetModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<PinStep>("current");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep("current");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    }
  }, [isOpen]);

  const activeValue = useMemo(() => {
    if (step === "current") return currentPin;
    if (step === "new") return newPin;
    return confirmPin;
  }, [confirmPin, currentPin, newPin, step]);

  const handleChange = (value: string) => {
    if (step === "current") {
      setCurrentPin(value);
      return;
    }

    if (step === "new") {
      setNewPin(value);
      return;
    }

    setConfirmPin(value);
  };

  const handleNext = async (pinValue: string) => {
    if (pinValue.length !== 6) {
      showToast("PIN 6자리를 입력해주세요.", "error");
      return;
    }

    if (step === "current") {
      setIsLoading(true);
      try {
        await userService.verifyPin(pinValue);
        setStep("new");
      } catch (err: any) {
        const errorCode = err?.response?.data?.errorCode;
        if (errorCode === "INVALID_PIN") {
          showToast("현재 PIN이 일치하지 않습니다.", "error");
        } else if (errorCode === "PIN_NOT_SET") {
          showToast("등록된 PIN이 없습니다.", "error");
        } else {
          showToast("PIN 확인에 실패했습니다. 다시 시도해주세요.", "error");
        }
        setCurrentPin("");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === "new") {
      setStep("confirm");
      return;
    }

    if (newPin !== pinValue) {
      setConfirmPin("");
      showToast("새 PIN이 일치하지 않습니다.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await userService.resetPin(currentPin, newPin);
      showToast("PIN이 변경되었습니다.", "success");
      onClose();
    } catch (err: any) {
      showToast("PIN 변경에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setConfirmPin("");
      setStep("new");
      return;
    }

    if (step === "new") {
      setNewPin("");
      setStep("current");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="캐비닛 PIN 재설정" size="sm">
      <div className="pin-reset">
        <div className="pin-reset__steps" aria-label="PIN 재설정 단계">
          {(["current", "new", "confirm"] as PinStep[]).map((item) => (
            <span
              key={item}
              className={item === step ? "is-active" : ""}
            >
              {STEP_TEXT[item].label}
            </span>
          ))}
        </div>

        <PinKeypad
          value={activeValue}
          onChange={handleChange}
          onSubmit={handleNext}
          title={STEP_TEXT[step].title}
          description={STEP_TEXT[step].desc}
          submitLabel={isLoading ? "처리 중..." : step === "confirm" ? "변경" : "다음"}
          helperText="숫자는 화면에 표시되지 않고 입력 자리만 표시됩니다."
        />

        <div className="pin-reset__actions">
          {step !== "current" && (
            <Button variant="ghost" onClick={handleBack} size="sm">
              이전
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} size="sm">
            취소
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PinResetModal;
