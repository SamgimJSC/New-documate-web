import React from "react";
import "./RiskGauge.css";

interface RiskGaugeProps {
  score: number;
  label: string;
  color: string;
}

const ARC_LENGTH = Math.PI * 90;

const RiskGauge: React.FC<RiskGaugeProps> = ({ score, label, color }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const filled = (clamped / 100) * ARC_LENGTH;

  return (
    <div className="risk-gauge">
      <svg viewBox="0 0 200 115" className="risk-gauge__svg">
        <path
          d="M10,100 A90,90 0 0 1 190,100"
          fill="none"
          stroke="var(--color-bg-cool)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M10,100 A90,90 0 0 1 190,100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${ARC_LENGTH}`}
        />
      </svg>
      <div className="risk-gauge__center">
        <strong>{clamped}점</strong>
        <span>100점 만점</span>
      </div>
      <p className="risk-gauge__label" style={{ color }}>
        {label}
      </p>
    </div>
  );
};

export default RiskGauge;
