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
  식비: "#5B9D99",
  카페: "#C49A6C",
  쇼핑: "#8E7DBE",
  교통: "#6F8FB8",
  생활: "#7FA58D",
  의료: "#C97F7F",
  기타: "#7B8798",
};

export const getCategoryColor = (categoryName: string) => {
  return CATEGORY_COLOR_MAP[categoryName] || CATEGORY_COLOR_MAP.기타;
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
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            boxShadow: "0 8px 20px rgba(34, 48, 70, 0.08)",
            color: "#223046",
            fontSize: 13,
          }}
        />

        <Legend
          iconType="circle"
          iconSize={9}
          formatter={(value) => (
            <span style={{ fontSize: 12, color: "#3D4B63" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;
