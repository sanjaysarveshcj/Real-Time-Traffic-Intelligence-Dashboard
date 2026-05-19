import asyncio
import base64
import io
import json
import random
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageDraw
import uvicorn

from .core.config import settings
from .ws.routes import router as ws_router, manager

app = FastAPI(title="Traffic Intelligence Backend")
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(ws_router)


@app.get("/health")
async def health_check() -> dict:
  return {"status": "ok", "time": datetime.utcnow().isoformat()}


async def _generate_demo_frame(counts: dict, total: int, fps: float) -> str:
  image = Image.new("RGB", (960, 540), color=(12, 18, 26))
  draw = ImageDraw.Draw(image)
  text = f"DEMO STREAM\nTotal: {total}\nFPS: {fps:.1f}"
  draw.text((30, 30), text, fill=(0, 224, 255))
  y = 140
  for label, value in counts.items():
    draw.text((30, y), f"{label}: {value}", fill=(200, 200, 200))
    y += 26

  buffer = io.BytesIO()
  image.save(buffer, format="JPEG", quality=80)
  return base64.b64encode(buffer.getvalue()).decode("utf-8")


async def demo_stream() -> None:
  peak = 0
  interval = 1 / max(settings.demo_fps, 1)
  while True:
    counts = {
      "car": random.randint(6, 22),
      "truck": random.randint(0, 4),
      "bus": random.randint(0, 2),
      "motorcycle": random.randint(0, 5),
      "bicycle": random.randint(0, 5),
      "person": random.randint(0, 8),
    }
    total = sum(counts.values())
    peak = max(peak, total)
    fps = random.uniform(18.0, 26.0)
    frame = await _generate_demo_frame(counts, total, fps)

    events = []
    if total > peak * 0.85:
      events.append({"message": "Traffic spike detected", "severity": "critical"})
    elif total > 20:
      events.append({"message": "Heavy traffic flow", "severity": "warning"})

    payload = {
      "timestamp": datetime.utcnow().isoformat(),
      "counts": counts,
      "totalVehicles": total,
      "peakDensity": peak,
      "fps": fps,
      "events": events,
      "frame": frame,
    }
    await manager.broadcast(json.dumps(payload))
    await asyncio.sleep(interval)


@app.on_event("startup")
async def startup_event() -> None:
  if settings.enable_demo:
    asyncio.create_task(demo_stream())


if __name__ == "__main__":
  uvicorn.run(
    "app.main:app",
    host=settings.host,
    port=settings.port,
    reload=False,
  )
