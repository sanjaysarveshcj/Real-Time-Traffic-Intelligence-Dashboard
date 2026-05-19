import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import TopBar from "./components/TopBar";
import VideoFeed from "./components/VideoFeed";
import LineTrendChart from "./components/LineTrendChart";
import ClassDistributionChart from "./components/ClassDistributionChart";
import PeakTrafficGauge from "./components/PeakTrafficGauge";
import EventFeed from "./components/EventFeed";
import ControlPanel from "./components/ControlPanel";
import MetricCard from "./components/MetricCard";
import { useTrafficSocket } from "./hooks/useTrafficSocket";
import { useTrafficStore } from "./store/useTrafficStore";
import { formatNumber } from "./utils/format";
import { playBeep } from "./utils/sound";

const App = () => {
  useTrafficSocket();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalVehicles = useTrafficStore((state) => state.totalVehicles);
  const peakDensity = useTrafficStore((state) => state.peakDensity);
  const counts = useTrafficStore((state) => state.counts);
  const soundEnabled = useTrafficStore((state) => state.soundEnabled);
  const addLocalEvent = useTrafficStore((state) => state.addLocalEvent);

  const lastAlertRef = useRef(0);

  useEffect(() => {
    if (!peakDensity) {
      return;
    }
    const ratio = totalVehicles / peakDensity;
    if (ratio < 0.85) {
      return;
    }
    const now = Date.now();
    if (now - lastAlertRef.current < 10_000) {
      return;
    }
    lastAlertRef.current = now;
    addLocalEvent("Traffic spike detected", "critical");
    if (soundEnabled) {
      playBeep();
    }
  }, [totalVehicles, peakDensity, soundEnabled, addLocalEvent]);

  const captureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const link = document.createElement("a");
    link.download = `traffic_snapshot_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportSession = () => {
    const state = useTrafficStore.getState();
    const payload = {
      capturedAt: new Date().toISOString(),
      counts: state.counts,
      totalVehicles: state.totalVehicles,
      peakDensity: state.peakDensity,
      series: state.series,
      events: state.events,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.download = `traffic_session_${Date.now()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const totals = useMemo(
    () =>
      Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts]
  );

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-7xl flex-col gap-8"
      >
        <div className="glass rounded-3xl px-6 py-5">
          <TopBar />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2.3fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="min-h-[420px]"
          >
            <VideoFeed canvasRef={canvasRef} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Total Flow"
                value={formatNumber(totalVehicles)}
                hint="Vehicles in frame"
              />
              <MetricCard
                label="Peak Density"
                value={formatNumber(peakDensity)}
                hint="Session max"
              />
              <MetricCard
                label="Active Objects"
                value={formatNumber(totals)}
                hint="Current classes"
              />
              <MetricCard
                label="Pedestrians"
                value={formatNumber(counts.person)}
                hint="People detected"
              />
            </div>
            <PeakTrafficGauge />
            <ControlPanel onCapture={captureSnapshot} onExport={exportSession} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
          <LineTrendChart />
          <ClassDistributionChart />
        </div>

        <EventFeed />
      </motion.div>
    </div>
  );
};

export default App;
