import { useEffect, useState } from "react";
import StatusPill from "./StatusPill";
import { useTrafficStore } from "../store/useTrafficStore";
import { formatClock } from "../utils/time";
import { formatNumber } from "../utils/format";

const connectionVariant = {
  connected: "success",
  connecting: "warning",
  disconnected: "danger",
} as const;

const TopBar = () => {
  const connection = useTrafficStore((state) => state.connection);
  const fps = useTrafficStore((state) => state.fps);
  const totalVehicles = useTrafficStore((state) => state.totalVehicles);

  const [clock, setClock] = useState(formatClock());

  useEffect(() => {
    const interval = window.setInterval(() => setClock(formatClock()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-cyan-200/80">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />
          Traffic Command
        </div>
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          Real-Time Traffic Intelligence
        </h1>
        <p className="text-sm text-slate-400">
          Edge stream analytics - Sector A12 - Live telemetry
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
        <StatusPill label="GPU" value="T4" variant="info" />
        <StatusPill label="Clock" value={clock} variant="info" />
        <StatusPill
          label="FPS"
          value={fps ? `${fps.toFixed(1)}` : "--"}
          variant="info"
        />
        <StatusPill
          label="Detections"
          value={formatNumber(totalVehicles)}
          variant="info"
        />
        <StatusPill
          label="Link"
          value={connection}
          variant={connectionVariant[connection]}
        />
      </div>
    </div>
  );
};

export default TopBar;
