export type TrafficCounts = {
  car: number;
  truck: number;
  bus: number;
  motorcycle: number;
  bicycle: number;
  person: number;
};

export type TrafficEvent = {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
  ts: string;
};

export type TrafficPayload = {
  timestamp: string;
  counts?: Partial<TrafficCounts>;
  totalVehicles?: number;
  peakDensity?: number;
  fps?: number;
  events?: Array<{
    message: string;
    severity?: "info" | "warning" | "critical";
    ts?: string;
  }>;
  frame?: string;
};

export type SeriesPoint = {
  t: number;
  total: number;
};
