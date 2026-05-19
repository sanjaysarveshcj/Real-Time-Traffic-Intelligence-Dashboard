import { useTrafficStore } from "../store/useTrafficStore";
import { formatNumber } from "../utils/format";

type ControlPanelProps = {
  onCapture: () => void;
  onExport: () => void;
};

const ControlPanel = ({ onCapture, onExport }: ControlPanelProps) => {
  const soundEnabled = useTrafficStore((state) => state.soundEnabled);
  const setSoundEnabled = useTrafficStore((state) => state.setSoundEnabled);
  const totalVehicles = useTrafficStore((state) => state.totalVehicles);

  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
        Control Deck
      </p>
      <p className="mt-1 text-lg font-semibold text-white">Session Tools</p>

      <div className="mt-4 grid gap-3">
        <button
          onClick={onCapture}
          className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-500/25"
        >
          Capture Snapshot
        </button>
        <button
          onClick={onExport}
          className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/25"
        >
          Export Session JSON
        </button>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/20"
        >
          Sound Alerts: {soundEnabled ? "On" : "Off"}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-white/5 bg-black/35 px-3 py-2 text-xs text-slate-300">
        Current flow: <span className="text-white tabular-nums">{formatNumber(totalVehicles)}</span>
      </div>
    </div>
  );
};

export default ControlPanel;
