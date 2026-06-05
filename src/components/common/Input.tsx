import React from "react";
import "./Input.css";

interface InputProps {
  type?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  suffix,
  prefix,
  required = false,
  maxLength,
  autoComplete,
}) => {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className={`input-field${error ? " input-field--error" : ""}${disabled ? " input-field--disabled" : ""}`}>
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          type={type}
          className="input-element"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;
