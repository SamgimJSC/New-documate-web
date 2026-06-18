import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  식비: "#6DB6B1",
  카페: "#F8B84E",
  쇼핑: "#9B6BEE",
  교통: "#4A90F2",
  생활: "#4FD08B",
  의료: "#FF6B6B",
  기타: "#94A3B8",
};

export const getCategoryColor = (categoryName: string) => {
  return CATEGORY_COLOR_MAP[categoryName] || "#94a3b8";
};

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const visibleData = data.filter((item) => item.value > 0);

  if (visibleData.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={visibleData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={80}
          innerRadius={40}
        >
          {visibleData.map((item) => (
            <Cell key={item.name} fill={getCategoryColor(item.name)} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value) => [
            `${Number(value ?? 0).toLocaleString()}원`,
            "지출",
          ]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 13,
          }}
        />

        <Legend
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span style={{ fontSize: 12, color: "#374151" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;
