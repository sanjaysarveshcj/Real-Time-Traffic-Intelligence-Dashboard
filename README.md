# Real-Time Traffic Intelligence Dashboard

A production-ready, real-time traffic analytics dashboard that streams YOLOv8 detections and annotated frames from Google Colab to a fast local UI.

## Highlights

- YOLOv8n inference on Colab T4 GPU
- Low-latency WebSocket streaming
- Real-time charts, event feed, and live video feed
- Smooth UI with Tailwind + Recharts + Framer Motion
- Cloudflare Pages ready frontend

## Architecture

Colab (YOLOv8) -> WebSocket ingest -> FastAPI broadcast -> React dashboard

### Message Schema

Each WebSocket message is JSON and includes:

```
{
   "timestamp": "2026-05-19T12:34:56.123Z",
   "counts": {
      "car": 12,
      "truck": 2,
      "bus": 1,
      "motorcycle": 3,
      "bicycle": 1,
      "person": 4
   },
   "totalVehicles": 23,
   "peakDensity": 34,
   "fps": 22.5,
   "events": [{ "message": "Truck detected", "severity": "info", "ts": "..." }],
   "frame": "<base64 jpeg>"
}
```

## Project Structure

```
traffic-dashboard/
├── frontend/
├── backend/
├── colab/
├── README.md
├── docker-compose.yml
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- Google Colab account with GPU (T4 recommended)

## Local Setup

### 1) Backend

```
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

Backend health check: http://localhost:8000/health

Enable demo mode without Colab:

```
set ENABLE_DEMO=true
python -m app.main
```

### 2) Frontend

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Colab Execution Guide

1. Open the notebook at [colab/traffic_colab.ipynb](colab/traffic_colab.ipynb) in Google Colab.
2. Set the runtime to GPU.
3. Update `WS_INGEST_URL` to your backend tunnel URL (ngrok or Cloudflare tunnel).
4. Run all cells to start streaming.

## Ngrok Setup

Install ngrok and run:

```
ngrok http 8000
```

Copy the forwarded URL and set:

```
WS_INGEST_URL = "wss://<your-ngrok-subdomain>.ngrok-free.app/ws/ingest"
```

## Cloudflare Pages Deployment (Frontend)

1. Push the repo to GitHub.
2. In Cloudflare Pages, create a new project from your repo.
3. Set build settings:
   - Build command: `npm run build`
   - Build output: `frontend/dist`
   - Root directory: `frontend`
4. Add environment variable:
   - `VITE_WS_URL=wss://<your-public-backend>/ws/stream`

## Environment Variables

Backend (.env):

```
ENABLE_DEMO=false
DEMO_FPS=12
```

Frontend (.env):

```
VITE_WS_URL=ws://localhost:8000/ws/stream
```

## Local Run Commands (Quick Start)

```
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

```
cd frontend
npm install
npm run dev
```

Then start the Colab notebook streaming to your ingest endpoint.

## Docker (Backend Only)

```
docker compose up --build
```

## Optional: Cloudflare Tunnel (Backend)

```
cloudflared tunnel --url http://localhost:8000
```

Use the generated `https://` address for `WS_INGEST_URL` and `VITE_WS_URL`.

## Screenshots

Add screenshots here after running the app.

- Main command center view
- Live stream with overlays
- Analytics panel

## Troubleshooting

- If you see no video, confirm Colab is streaming and the WebSocket URL is correct.
- If charts lag, reduce the stream FPS in Colab.
- If connection drops, check ngrok or tunnel stability.
- If Colab shows SSL errors, verify you used `wss://` URLs for HTTPS tunnels.
- If the UI feels slow, drop Colab FPS by increasing the sleep interval.

## Demo Recording Tips

- Start backend, then frontend, then Colab streaming.
- Use a 1080p screen capture to show the entire dashboard.
- Keep a stable stream FPS around 20-25 for smooth UI.
