"""Реальное время: WebSocket-рассылка событий (требование ≤ 5 с)."""
import asyncio
import json
import logging
from collections import defaultdict

import anyio
from fastapi import WebSocket

log = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self._conns: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, user_id: int, ws: WebSocket) -> None:
        await ws.accept()
        self._conns[user_id].add(ws)

    def disconnect(self, user_id: int, ws: WebSocket) -> None:
        self._conns[user_id].discard(ws)

    async def _send(self, ws: WebSocket, data: str) -> bool:
        try:
            await ws.send_text(data)
            return True
        except Exception:
            return False

    async def send_to(self, user_id: int, message: dict) -> None:
        data = json.dumps(message, ensure_ascii=False, default=str)
        dead = [ws for ws in list(self._conns.get(user_id, ())) if not await self._send(ws, data)]
        for ws in dead:
            self.disconnect(user_id, ws)

    async def broadcast(self, message: dict) -> None:
        data = json.dumps(message, ensure_ascii=False, default=str)
        for user_id, sockets in list(self._conns.items()):
            for ws in list(sockets):
                if not await self._send(ws, data):
                    self.disconnect(user_id, ws)

    @property
    def online_user_ids(self) -> set[int]:
        return {uid for uid, s in self._conns.items() if s}


manager = ConnectionManager()


def emit(coro_fn, *args) -> None:
    """Вызов async-рассылки из синхронного кода (эндпоинты FastAPI в threadpool или фоновые задачи)."""
    try:
        anyio.from_thread.run(coro_fn, *args)
        return
    except Exception:
        pass
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(coro_fn(*args))
    except RuntimeError:
        log.debug("emit: нет event loop, событие пропущено")
