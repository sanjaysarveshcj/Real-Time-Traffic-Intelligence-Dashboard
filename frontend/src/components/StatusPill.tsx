import clsx from "clsx";

const variantStyles = {
  info: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30",
  success: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  warning: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  danger: "bg-rose-500/15 text-rose-200 border-rose-400/30",
};

type StatusPillProps = {
  label: string;
  value: string;
  variant?: keyof typeof variantStyles;
};

const StatusPill = ({ label, value, variant = "info" }: StatusPillProps) => (
  <div
    className={clsx(
      "flex min-w-[112px] items-center justify-between gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
      "backdrop-blur-sm",
      variantStyles[variant]
    )}
  >
    <span className="text-[10px] text-slate-300">{label}</span>
    <span className="font-semibold text-white tabular-nums">{value}</span>
  </div>
);

export default StatusPill;
