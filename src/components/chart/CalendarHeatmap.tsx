import React from "react";
import { formatKRW } from "../../utils/formatCurrency";
import type { DailySpendResponse } from "../../types/report";

interface CalendarHeatmapProps {
  data: DailySpendResponse;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const getIntensityLevel = (amount: number, max: number) => {
  if (amount <= 0 || max <= 0) return 0;
  const ratio = amount / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
};

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data }) => {
  const { year, month, days } = data;
  const maxSpend = days.reduce((max, d) => Math.max(max, d.totalSpend), 0);
  const leadingBlankCount = new Date(year, month - 1, 1).getDay();

  return (
    <div className="calendar-heatmap">
      <div className="calendar-heatmap__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar-heatmap__grid">
        {Array.from({ length: leadingBlankCount }).map((_, i) => (
          <div key={`blank-${i}`} className="calendar-heatmap__cell calendar-heatmap__cell--blank" />
        ))}

        {days.map((d) => {
          const level = getIntensityLevel(d.totalSpend, maxSpend);
          return (
            <div
              key={d.date}
              className={`calendar-heatmap__cell calendar-heatmap__cell--level-${level}`}
              title={
                d.totalSpend > 0
                  ? `${d.date} · ${formatKRW(d.totalSpend)} · 영수증 ${d.receiptCount}건`
                  : `${d.date} · 지출 없음`
              }
            >
              <span className="calendar-heatmap__day">{d.day}</span>
            </div>
          );
        })}
      </div>

      <div className="calendar-heatmap__legend">
        <span>적음</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`calendar-heatmap__legend-swatch calendar-heatmap__cell--level-${level}`}
          />
        ))}
        <span>많음</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
