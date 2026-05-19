import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/stream")
async def stream_socket(websocket: WebSocket) -> None:
  await manager.connect(websocket)
  try:
    while True:
      await websocket.receive_text()
  except WebSocketDisconnect:
    manager.disconnect(websocket)


@router.websocket("/ws/ingest")
async def ingest_socket(websocket: WebSocket) -> None:
  await websocket.accept()
  try:
    while True:
      message = await websocket.receive_text()
      try:
        json.loads(message)
      except json.JSONDecodeError:
        continue
      await manager.broadcast(message)
  except WebSocketDisconnect:
    pass
