import React, { useMemo } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import "./PinKeypad.css";

interface PinKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  length?: number;
  title?: string;
  description?: string;
  submitLabel?: string;
  disabled?: boolean;
  shuffleNumbers?: boolean;
  showHeader?: boolean;
  helperText?: string;
}

const DEFAULT_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const createShuffledNumbers = () => {
  const numbers = [...DEFAULT_NUMBERS];

  for (let index = numbers.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [numbers[index], numbers[randomIndex]] = [numbers[randomIndex], numbers[index]];
  }

  return numbers;
};

const PinKeypad: React.FC<PinKeypadProps> = ({
  value,
  onChange,
  onSubmit,
  length = 6,
  title = "PIN 번호",
  description = "숫자 패드로 PIN을 입력해주세요.",
  submitLabel = "확인",
  disabled = false,
  shuffleNumbers = false,
  showHeader = true,
  helperText,
}) => {
  const numbers = useMemo(
    () => (shuffleNumbers ? createShuffledNumbers() : DEFAULT_NUMBERS),
    [shuffleNumbers],
  );

  const numberRows = shuffleNumbers
    ? numbers.filter((number) => number !== "0")
    : numbers.slice(0, 9);
  const zeroKey = "0";

  const safeValue = value.replace(/\D/g, "").slice(0, length);
  const canSubmit = safeValue.length === length && !disabled;

  const handlePress = (key: string) => {
    if (disabled) return;

    if (key === "clear") {
      onChange("");
      return;
    }

    if (key === "backspace") {
      onChange(safeValue.slice(0, -1));
      return;
    }

    if (safeValue.length >= length) return;
    onChange(`${safeValue}${key}`);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.(safeValue);
  };

  return (
    <div className="pin-keypad">
      {showHeader && (
        <div className="pin-keypad__head">
          <span className="pin-keypad__icon">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
      )}

      <div className="pin-keypad__dots" aria-label={`${length}자리 PIN 입력 상태`}>
        {Array.from({ length }).map((_, index) => (
          <span
            key={index}
            className={index < safeValue.length ? "is-filled" : ""}
          />
        ))}
      </div>

      <div className="pin-keypad__grid" aria-label="PIN 숫자 패드">
        {numberRows.map((number) => (
          <button
            type="button"
            key={number}
            className="pin-keypad__button"
            onClick={() => handlePress(number)}
            disabled={disabled}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          className="pin-keypad__button pin-keypad__button--sub"
          onClick={() => handlePress("clear")}
          disabled={disabled || safeValue.length === 0}
        >
          C
        </button>

        <button
          type="button"
          className="pin-keypad__button"
          onClick={() => handlePress(zeroKey)}
          disabled={disabled}
        >
          0
        </button>

        <button
          type="button"
          className="pin-keypad__button pin-keypad__button--sub"
          onClick={() => handlePress("backspace")}
          disabled={disabled || safeValue.length === 0}
          aria-label="한 자리 삭제"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <button
        type="button"
        className="pin-keypad__confirm"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {submitLabel}
      </button>

      {helperText && <p className="pin-keypad__helper">{helperText}</p>}
    </div>
  );
};

export default PinKeypad;
