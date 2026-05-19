import { useMemo } from "react";
import { useTrafficStore } from "../store/useTrafficStore";
import { formatNumber } from "../utils/format";

const PeakTrafficGauge = () => {
  const totalVehicles = useTrafficStore((state) => state.totalVehicles);
  const peakDensity = useTrafficStore((state) => state.peakDensity);

  const ratio = useMemo(() => {
    if (!peakDensity) {
      return 0;
    }
    return Math.min(1, totalVehicles / peakDensity);
  }, [totalVehicles, peakDensity]);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Peak Density
        </p>
        <p className="text-lg font-semibold text-white">Congestion Gauge</p>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Current</span>
        <span className="text-white">{formatNumber(totalVehicles)}</span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 shadow-glow"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>0</span>
        <span>Peak {formatNumber(peakDensity)}</span>
      </div>
    </div>
  );
};

export default PeakTrafficGauge;
