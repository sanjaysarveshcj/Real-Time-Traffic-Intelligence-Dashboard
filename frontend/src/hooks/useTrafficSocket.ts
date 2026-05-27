import { useEffect, useMemo, useRef } from "react";
import { useTrafficStore } from "../store/useTrafficStore";
import { TrafficPayload } from "../types";
import { throttle } from "../utils/throttle";

const DEFAULT_URL = "ws://localhost:8000/ws/stream";
const WS_URL = import.meta.env.VITE_WS_URL ?? DEFAULT_URL;

export const useTrafficSocket = () => {
  const setConnection = useTrafficStore((state) => state.setConnection);
  const updateFrame = useTrafficStore((state) => state.updateFrame);
  const ingestMetrics = useTrafficStore((state) => state.ingestMetrics);
  const addLocalEvent = useTrafficStore((state) => state.addLocalEvent);

  const throttledUpdateFrame = useMemo(
    () => throttle(updateFrame, 16),
    [updateFrame]
  );
  const throttledIngest = useMemo(
    () => throttle(ingestMetrics, 120),
    [ingestMetrics]
  );

  const retryRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let active = true;

    const connect = () => {
      if (!active) {
        return;
      }

      setConnection("connecting");
      const socket = new WebSocket(WS_URL);
      wsRef.current = socket;

      socket.onopen = () => {
        retryRef.current = 0;
        setConnection("connected");
        addLocalEvent("Connection established", "info");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as TrafficPayload;
          if (payload.frame) {
            throttledUpdateFrame(payload.frame);
          }
          throttledIngest(payload);
        } catch {
          // Ignore invalid payloads.
        }
      };

      socket.onclose = () => {
        setConnection("disconnected");
        addLocalEvent("Connection lost. Reconnecting...", "warning");
        if (active) {
          scheduleReconnect();
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    const scheduleReconnect = () => {
      const attempt = retryRef.current + 1;
      retryRef.current = attempt;
      const backoff = Math.min(10_000, 800 + attempt * 600);
      window.setTimeout(connect, backoff);
    };

    connect();

    return () => {
      active = false;
      wsRef.current?.close();
    };
  }, [setConnection, throttledUpdateFrame, throttledIngest, addLocalEvent]);
};
