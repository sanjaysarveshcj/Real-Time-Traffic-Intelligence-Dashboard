type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
};

const MetricCard = ({ label, value, hint }: MetricCardProps) => (
  <div className="glass rounded-2xl p-5">
    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-3xl font-semibold text-white tabular-nums">
      {value}
    </p>
    {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
  </div>
);

export default MetricCard;
