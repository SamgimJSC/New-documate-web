import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatKRW } from "../../utils/formatCurrency";

interface MonthlyData {
  month: string;
  amount: number;
}

interface MonthlyLineChartProps {
  data: MonthlyData[];
}

const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(value) => [formatKRW(Number(value ?? 0)), "지출"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#5b9d99"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#5b9d99" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyLineChart;
