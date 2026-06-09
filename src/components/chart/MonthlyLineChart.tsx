import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { formatKRW } from "../../utils/formatCurrency";

interface MonthlyData {
  month: string;
  amount: number;
  date?: string;
}

interface MonthlyLineChartProps {
  data: MonthlyData[];
  selectedDate?: string | null;
  onPointClick?: (date: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: MonthlyData;
  }>;
}

const formatDisplayDate = (dateString?: string) => {
  if (!dateString) return "";

  return dateString.replaceAll("-", ".");
};

const getDayNumber = (label: string) => {
  return Number(label.replace("일", ""));
};

const MonthlyTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0]?.payload;
  const amount = Number(payload[0]?.value ?? 0);

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        backgroundColor: "#fff",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        fontSize: 13,
      }}
    >
      <p style={{ margin: 0, marginBottom: 4, color: "#6b7280" }}>
        {formatDisplayDate(item?.date) || item?.month}
      </p>
      <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
        지출 금액 {formatKRW(amount)}
      </p>
    </div>
  );
};

const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({
  data,
  selectedDate,
  onPointClick,
}) => {
  const maxData = data.reduce<MonthlyData | null>((max, current) => {
    if (!max) return current;

    return current.amount > max.amount ? current : max;
  }, null);

  const selectedData = selectedDate
    ? data.find((item) => item.date === selectedDate)
    : null;

  const formatXAxisTick = (value: string, index: number) => {
    const day = getDayNumber(value);
    const isLastDay = index === data.length - 1;

    if (day === 1 || day === 10 || day === 20 || isLastDay) {
      return value;
    }

    return "";
  };

  const handleChartClick = (state: any) => {
    const activeLabel = state?.activeLabel;

    if (!activeLabel) return;

    const clickedData = data.find((item) => item.month === activeLabel);

    if (!clickedData?.date) return;

    onPointClick?.(clickedData.date);
  };
  return (
    <div className="monthly-line-chart">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 12, right: 42, left: 42, bottom: 0 }}
          onClick={handleChartClick}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f8fafc"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickFormatter={formatXAxisTick}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            padding={{ left: 16, right: 16 }}
          />

          <YAxis hide />

          <Tooltip content={<MonthlyTooltip />} />

          <Line
            type="monotone"
            dataKey="amount"
            stroke="#5b9d99"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 6,
              fill: "#5b9d99",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />

          {maxData && maxData.amount > 0 && maxData.date !== selectedDate && (
            <ReferenceDot
              x={maxData.month}
              y={maxData.amount}
              r={6}
              fill="#5b9d99"
              stroke="#fff"
              strokeWidth={2}
            />
          )}

          {selectedData && (
            <ReferenceDot
              x={selectedData.month}
              y={selectedData.amount}
              r={7}
              fill="#5b9d99"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyLineChart;
