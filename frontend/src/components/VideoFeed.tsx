import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTrafficStore } from "../store/useTrafficStore";
import { formatNumber } from "../utils/format";

type VideoFeedProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

const base64ToBlob = (base64: string, mimeType: string) => {
  const binary = window.atob(base64);
  const length = binary.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
};

const VideoFeed = ({ canvasRef }: VideoFeedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fps = useTrafficStore((state) => state.fps);
  const counts = useTrafficStore((state) => state.counts);
  const totalVehicles = useTrafficStore((state) => state.totalVehicles);
  const [hasFrame, setHasFrame] = useState(false);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, ratio: 0 });
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const pendingBitmapRef = useRef<ImageBitmap | null>(null);
  const drawPendingRef = useRef(false);
  const latestFrameRef = useRef<string | null>(null);
  const decodingRef = useRef(false);
  const activeRef = useRef(true);
  const hasFrameRef = useRef(false);

  const scheduleDraw = useCallback(() => {
    if (drawPendingRef.current) {
      return;
    }
    drawPendingRef.current = true;
    rafRef.current = window.requestAnimationFrame(() => {
      drawPendingRef.current = false;
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      const bitmap = pendingBitmapRef.current;
      if (!ctx || !canvas || !bitmap) {
        return;
      }
      const ratio = sizeRef.current.ratio || window.devicePixelRatio || 1;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.drawImage(bitmap, 0, 0, canvas.width / ratio, canvas.height / ratio);
    });
  }, [canvasRef]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return;
    }

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const lastSize = sizeRef.current;

      if (
        width === lastSize.width &&
        height === lastSize.height &&
        ratio === lastSize.ratio
      ) {
        return;
      }

      sizeRef.current = { width, height, ratio };
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      return;
    }
    ctxRef.current = ctx;
    return () => {
      ctxRef.current = null;
    };
  }, [canvasRef]);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      latestFrameRef.current = null;
      hasFrameRef.current = false;
    };
  }, []);

  const requestDecode = useCallback(() => {
    if (decodingRef.current) {
      return;
    }

    const decodeLatest = async () => {
      decodingRef.current = true;
      while (activeRef.current && latestFrameRef.current) {
        const nextFrame = latestFrameRef.current;
        latestFrameRef.current = null;
        try {
          const bitmap = await createImageBitmap(
            base64ToBlob(nextFrame, "image/jpeg")
          );
          if (!activeRef.current) {
            bitmap.close();
            break;
          }
          const previous = pendingBitmapRef.current;
          pendingBitmapRef.current = bitmap;
          if (previous) {
            previous.close();
          }
          scheduleDraw();
        } catch {
          // Ignore decode failures.
        }
      }
      decodingRef.current = false;
    };

    void decodeLatest();
  }, [scheduleDraw]);

  useEffect(() => {
    let lastFrame: string | null = null;

    const unsubscribe = useTrafficStore.subscribe((state) => {
      const nextFrame = state.frame;
      if (nextFrame === lastFrame) {
        return;
      }
      lastFrame = nextFrame;

      if (nextFrame) {
        latestFrameRef.current = nextFrame;
        if (!hasFrameRef.current) {
          hasFrameRef.current = true;
          setHasFrame(true);
        }
        requestDecode();
        return;
      }

      if (hasFrameRef.current) {
        hasFrameRef.current = false;
        setHasFrame(false);
      }
    });

    return () => unsubscribe();
  }, [requestDecode]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (pendingBitmapRef.current) {
        pendingBitmapRef.current.close();
        pendingBitmapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-3xl glass glass-media grid-overlay"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {!hasFrame ? (
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
