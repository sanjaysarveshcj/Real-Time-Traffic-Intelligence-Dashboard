import { create } from "zustand";
import { SeriesPoint, TrafficCounts, TrafficEvent, TrafficPayload } from "../types";
import { toTimestamp } from "../utils/time";

const MAX_EVENTS = 200;
const SERIES_WINDOW_MS = 60_000;

const emptyCounts: TrafficCounts = {
  car: 0,
  truck: 0,
  bus: 0,
  motorcycle: 0,
  bicycle: 0,
  person: 0,
};

const normalizeCounts = (counts?: Partial<TrafficCounts>): TrafficCounts => ({
  car: counts?.car ?? 0,
  truck: counts?.truck ?? 0,
  bus: counts?.bus ?? 0,
  motorcycle: counts?.motorcycle ?? 0,
  bicycle: counts?.bicycle ?? 0,
  person: counts?.person ?? 0,
});

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const clampSeries = (series: SeriesPoint[], now: number) =>
  series.filter((point) => now - point.t <= SERIES_WINDOW_MS);

type ConnectionState = "connected" | "connecting" | "disconnected";

type TrafficState = {
  connection: ConnectionState;
  frame: string | null;
  fps: number;
  counts: TrafficCounts;
  totalVehicles: number;
  peakDensity: number;
  series: SeriesPoint[];
  events: TrafficEvent[];
  lastUpdated: number;
  soundEnabled: boolean;
  setConnection: (status: ConnectionState) => void;
  updateFrame: (frame: string) => void;
  ingestMetrics: (payload: TrafficPayload) => void;
  addLocalEvent: (message: string, severity?: TrafficEvent["severity"]) => void;
  setSoundEnabled: (enabled: boolean) => void;
  clearEvents: () => void;
};

export const useTrafficStore = create<TrafficState>((set) => ({
  connection: "disconnected",
  frame: null,
  fps: 0,
  counts: emptyCounts,
  totalVehicles: 0,
  peakDensity: 0,
  series: [],
  events: [],
  lastUpdated: 0,
  soundEnabled: true,
  setConnection: (status) => set({ connection: status }),
  updateFrame: (frame) => set({ frame }),
  ingestMetrics: (payload) =>
    set((state) => {
      const now = toTimestamp(payload.timestamp);
      const counts = normalizeCounts(payload.counts);
      const totalVehicles =
        payload.totalVehicles ??
        Object.values(counts).reduce((sum, value) => sum + value, 0);
      const peakDensity = Math.max(
        state.peakDensity,
        payload.peakDensity ?? totalVehicles
      );
      const fps = payload.fps ?? state.fps;

      const nextSeries = clampSeries(
        [...state.series, { t: now, total: totalVehicles }],
        now
      );

      const incomingEvents =
        payload.events?.map((event) => ({
          id: createId(),
          message: event.message,
          severity: event.severity ?? "info",
          ts: event.ts ?? new Date(now).toISOString(),
        })) ?? [];

      const events = [...state.events, ...incomingEvents].slice(-MAX_EVENTS);

      return {
        counts,
        totalVehicles,
        peakDensity,
        fps,
        series: nextSeries,
        events,
        lastUpdated: now,
      };
    }),
  addLocalEvent: (message, severity = "info") =>
    set((state) => ({
      events: [
        ...state.events,
        {
          id: createId(),
          message,
          severity,
          ts: new Date().toISOString(),
        },
      ].slice(-MAX_EVENTS),
    })),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  clearEvents: () => set({ events: [] }),
}));
