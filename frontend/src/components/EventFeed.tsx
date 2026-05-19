import { useEffect, useRef } from "react";
import { useTrafficStore } from "../store/useTrafficStore";
import clsx from "clsx";

const EventFeed = () => {
  const events = useTrafficStore((state) => state.events);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [events.length]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
            Event Feed
          </p>
          <p className="text-lg font-semibold text-white">Live Alerts</p>
        </div>
      </div>
      <div
        ref={containerRef}
        className="scrollbar max-h-60 space-y-3 overflow-y-auto pr-2"
      >
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">Waiting for events...</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-3"
            >
              <div>
                <p className="text-sm text-slate-200">{event.message}</p>
                <p className="text-xs text-slate-500 tabular-nums">
                  {new Date(event.ts).toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={clsx(
                  "rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em]",
                  event.severity === "critical" &&
                    "bg-rose-500/20 text-rose-200",
                  event.severity === "warning" &&
                    "bg-amber-500/20 text-amber-200",
                  event.severity === "info" && "bg-cyan-500/20 text-cyan-200"
                )}
              >
                {event.severity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventFeed;
