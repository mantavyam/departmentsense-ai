from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.ws_manager import manager

router = APIRouter(tags=["ws"])


@router.websocket("/ws/complaints/{reference_number}")
async def complaint_ws(ws: WebSocket, reference_number: str) -> None:
    """Live updates for a single complaint, keyed by reference number."""
    await manager.connect(reference_number, ws)
    try:
        while True:
            # Keep connection open; ignore incoming messages.
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(reference_number, ws)
