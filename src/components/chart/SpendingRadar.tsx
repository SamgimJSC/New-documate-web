import React, { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { formatKRW } from "../../utils/formatCurrency";

interface SpendingRadarProps {
  data: { category: string; score: number; amount: number }[];
}

interface AngleTickProps {
  x?: number;
  y?: number;
  textAnchor?: "start" | "middle" | "end" | "inherit";
  payload?: { value: string };
}

interface Hovered {
  category: string;
  amount: number;
  x: number;
  y: number;
}

const SpendingRadar: React.FC<SpendingRadarProps> = ({ data }) => {
  const [hovered, setHovered] = useState<Hovered | null>(null);

  const AngleTick: React.FC<AngleTickProps> = ({ x, y, textAnchor, payload }) => {
    const category = payload?.value ?? "";
    const item = data.find((d) => d.category === category);

    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fontSize={12}
        fill="#6b7280"
        style={{ cursor: item ? "pointer" : undefined }}
        onMouseEnter={() =>
          item && setHovered({ category, amount: item.amount, x: x ?? 0, y: y ?? 0 })
        }
        onMouseLeave={() => setHovered(null)}
      >
        {category}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="category" tick={<AngleTick />} />
        <Radar
          dataKey="score"
          stroke="#5b9d99"
          fill="#5b9d99"
          fillOpacity={0.35}
        />

        {hovered && (
          <g transform={`translate(${hovered.x}, ${hovered.y - 32})`} style={{ pointerEvents: "none" }}>
            <rect
              x={-58}
              y={-30}
              width={116}
              height={40}
              rx={9}
              fill="#fff"
              stroke="#e5e7eb"
            />
            <text x={0} y={-14} textAnchor="middle" fontSize={11} fill="#6b7280">
              {hovered.category}
            </text>
            <text x={0} y={2} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">
              지출액 {formatKRW(hovered.amount)}
            </text>
          </g>
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SpendingRadar;
