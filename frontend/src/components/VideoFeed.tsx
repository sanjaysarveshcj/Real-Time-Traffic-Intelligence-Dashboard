import { useEffect, useLayoutEffect, useRef } from "react";
import { useTrafficStore } from "../store/useTrafficStore";
import { formatNumber } from "../utils/format";

type VideoFeedProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

const VideoFeed = ({ canvasRef }: VideoFeedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useTrafficStore((state) => state.frame);
  const fps = useTrafficStore((state) => state.fps);
  const counts = useTrafficStore((state) => state.counts);
  const totalVehicles = useTrafficStore((state) => state.totalVehicles);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lastDrawnRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return;
    }

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasRef]);

  useEffect(() => {
    if (!frame) {
      return;
    }
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = `data:image/jpeg;base64,${frame}`;
  }, [frame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const draw = () => {
      const img = imageRef.current;
      if (img && img !== lastDrawnRef.current) {
        const ratio = window.devicePixelRatio || 1;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio);
        lastDrawnRef.current = img;
      }
      rafRef.current = window.requestAnimationFrame(draw);
    };

    rafRef.current = window.requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [canvasRef]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-3xl glass glass-media grid-overlay"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {!frame ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
          Waiting for live stream...
        </div>
      ) : null}

      <div className="absolute left-5 top-5 flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-200 backdrop-blur">
        <div className="flex items-center justify-between gap-6">
          <span>FPS</span>
          <span className="font-semibold text-cyan-200 tabular-nums">
            {fps ? fps.toFixed(1) : "--"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span>Total</span>
          <span className="font-semibold text-white tabular-nums">
            {formatNumber(totalVehicles)}
          </span>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-200 backdrop-blur">
        <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-cyan-200">
          Live Counts
        </p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(counts).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="capitalize text-slate-300">{label}</span>
              <span className="font-semibold text-white tabular-nums">
                {formatNumber(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
