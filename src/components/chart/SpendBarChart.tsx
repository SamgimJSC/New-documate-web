import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatKRW } from "../../utils/formatCurrency";

interface DailySpend {
  date: string;
  amount: number;
}

interface SpendBarChartProps {
  data: DailySpend[];
  selectedDate?: string;
  onDateClick?: (date: string) => void;
}

const SpendBarChart: React.FC<SpendBarChartProps> = ({ data, selectedDate, onDateClick }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(value) => [formatKRW(Number(value ?? 0)), "지출"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
        />
        <Bar
          dataKey="amount"
          radius={[4, 4, 0, 0]}
          cursor="pointer"
          onClick={(entry) => onDateClick?.((entry as unknown as DailySpend).date)}
        >
          {data.map((entry) => (
            <Cell
              key={entry.date}
              fill={entry.date === selectedDate ? "#5b9d99" : "#bfdbfe"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SpendBarChart;
