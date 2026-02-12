from fastapi import WebSocket
import asyncio
from collections import defaultdict

# Active WebSocket connections per job_id
_connections: dict[int, list[WebSocket]] = defaultdict(list)


async def register(job_id: int, ws: WebSocket):
    await ws.accept()
    _connections[job_id].append(ws)


async def unregister(job_id: int, ws: WebSocket):
    _connections[job_id].remove(ws)
    if not _connections[job_id]:
        del _connections[job_id]


async def broadcast(job_id: int, data: dict):
    dead = []
    for ws in _connections.get(job_id, []):
        try:
            await ws.send_json(data)
        except Exception:
            dead.append(ws)
    for ws in dead:
        try:
            _connections[job_id].remove(ws)
        except ValueError:
            pass


def broadcast_sync(job_id: int, data: dict):
    """Call broadcast from sync code by scheduling on the event loop."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.run_coroutine_threadsafe(broadcast(job_id, data), loop)
    except RuntimeError:
        pass
