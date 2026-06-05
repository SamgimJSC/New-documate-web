import React from "react";
import "./Select.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ label, value, options, onChange, disabled = false, placeholder }) => {
  return (
    <div className="select-wrapper">
      {label && <label className="select-label">{label}</label>}
      <div className={`select-field${disabled ? " select-field--disabled" : ""}`}>
        <select className="select-element" value={value} onChange={onChange} disabled={disabled}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="select-arrow">▾</span>
      </div>
    </div>
  );
};

export default Select;
