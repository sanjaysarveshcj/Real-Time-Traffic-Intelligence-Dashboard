from __future__ import annotations

import asyncio
from typing import Set
from fastapi import WebSocket


class ConnectionManager:
  def __init__(self) -> None:
    self.clients: Set[WebSocket] = set()
    self.latest_payload: str | None = None

  async def connect(self, websocket: WebSocket) -> None:
    await websocket.accept()
    self.clients.add(websocket)
    if self.latest_payload:
      await websocket.send_text(self.latest_payload)

  def disconnect(self, websocket: WebSocket) -> None:
    if websocket in self.clients:
      self.clients.remove(websocket)

  async def broadcast(self, message: str) -> None:
    self.latest_payload = message
    if not self.clients:
      return
    results = await asyncio.gather(
      *[client.send_text(message) for client in list(self.clients)],
      return_exceptions=True,
    )
    for client, result in zip(list(self.clients), results):
      if isinstance(result, Exception):
        self.disconnect(client)
