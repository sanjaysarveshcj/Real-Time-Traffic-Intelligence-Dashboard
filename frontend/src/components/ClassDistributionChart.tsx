import { memo, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTrafficStore } from "../store/useTrafficStore";

const COLORS = [
  "#00e0ff",
  "#7cff6b",
  "#ffb347",
  "#ff5f6d",
  "#7b8a97",
  "#8b5cf6",
];

const ClassDistributionChart = () => {
  const counts = useTrafficStore((state) => state.counts);

  const data = useMemo(
    () =>
      Object.entries(counts).map(([name, value]) => ({
        name,
        value,
      })),
    [counts]
  );

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Class Distribution
        </p>
        <p className="text-lg font-semibold text-white">Live Mix</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 32, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(ClassDistributionChart);
