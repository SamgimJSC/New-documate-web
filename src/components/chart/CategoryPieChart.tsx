import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CHART_COLORS = ["#5b9d99", "#7c3aed", "#0891b2", "#d97706", "#16a34a", "#6b7280"];

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={80}
          innerRadius={40}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${Number(value ?? 0).toLocaleString()}원`, "지출"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
        />
        <Legend
          iconType="circle"
          iconSize={10}
          formatter={(value) => <span style={{ fontSize: 12, color: "#374151" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;
