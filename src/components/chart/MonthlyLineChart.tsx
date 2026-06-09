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

const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({ data }) => {
  const maxData = data.reduce<MonthlyData | null>((max, current) => {
    if (!max) return current;

    return current.amount > max.amount ? current : max;
  }, null);

  const formatXAxisTick = (value: string, index: number) => {
    const day = getDayNumber(value);
    const isLastDay = index === data.length - 1;

    if (day === 1 || day === 10 || day === 20 || isLastDay) {
      return value;
    }

    return "";
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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

        {maxData && maxData.amount > 0 && (
          <ReferenceDot
            x={maxData.month}
            y={maxData.amount}
            r={6}
            fill="#5b9d99"
            stroke="#fff"
            strokeWidth={2}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyLineChart;
