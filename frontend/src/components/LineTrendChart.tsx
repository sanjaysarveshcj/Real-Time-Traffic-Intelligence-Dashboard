import { memo, useMemo } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTrafficStore } from "../store/useTrafficStore";

const LineTrendChart = () => {
  const series = useTrafficStore((state) => state.series);

  const data = useMemo(
    () =>
      series.map((point) => ({
        time: new Date(point.t).toLocaleTimeString("en-US", {
          minute: "2-digit",
          second: "2-digit",
        }),
        total: point.total,
      })),
    [series]
  );

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Live Trend
          </p>
          <p className="text-lg font-semibold text-white">Last 60 Seconds</p>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
            <XAxis dataKey="time" tick={{ fill: "#7b8a97", fontSize: 10 }} />
            <YAxis tick={{ fill: "#7b8a97", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 32, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#00e0ff"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(LineTrendChart);
