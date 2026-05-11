"""In-memory WebSocket connection manager keyed by complaint reference number."""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, key: str, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[key].add(ws)

    def disconnect(self, key: str, ws: WebSocket) -> None:
        self._connections[key].discard(ws)
        if not self._connections[key]:
            self._connections.pop(key, None)

    async def broadcast(self, key: str, message: dict[str, Any]) -> None:
        dead: list[WebSocket] = []
        for ws in self._connections.get(key, set()):
            try:
                await ws.send_json(message)
            except Exception:  # noqa: BLE001
                dead.append(ws)
        for ws in dead:
            self.disconnect(key, ws)


manager = ConnectionManager()
