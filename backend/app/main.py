"""Точка входа FastAPI: «НарядAI — Наряд выдан, ИИ на контроле»."""
import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from .auth import decode_token
from .config import BASE_DIR, CORS_ORIGINS, DEMO_MODE, MEDIA_DIR
from .db import Base, engine
from .netinfo import phone_urls, qr_svg
from .realtime import manager
from .routers import core, orders
from .services import events  # noqa: F401 — регистрирует обработчики after_commit
from .services.deadlines import deadline_loop

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    try:
        from sqlalchemy import func, select
        from .db import SessionLocal
        from .models import Employee
        with SessionLocal() as db:
            if db.scalar(select(func.count(Employee.id))) == 0:
                logging.getLogger("uvicorn").info("База данных пуста. Запуск генерации демонстрационных данных (92 дня)...")
                # seed — пакет рядом с app/ (корень backend/ или /app в Docker), импорт абсолютный
                from seed.generate import generate
                generate(days=92, seed=42)
    except Exception:
        logging.getLogger("uvicorn").exception("Авто-посев данных пропущен")

    task = asyncio.create_task(deadline_loop())
    yield
    task.cancel()


app = FastAPI(title="НарядAI", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.include_router(core.router)
app.include_router(orders.router)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")


@app.get("/api/health")
def health():
    # demo_mode — клиент скрывает быстрый вход и подсказку ПИН, когда режим выключен
    return {"status": "ok", "online": len(manager.online_user_ids), "demo_mode": DEMO_MODE}


@app.get("/api/connect-info")
def connect_info(request: Request):
    """Адреса сервера в локальной сети: экран входа показывает их и QR-код для телефона."""
    port = request.url.port or (443 if request.url.scheme == "https" else 80)
    return {"urls": phone_urls(port, request.url.scheme)}


@app.get("/api/connect-qr.svg", include_in_schema=False)
def connect_qr(url: str):
    if not url.startswith(("http://", "https://")) or len(url) > 300:
        raise HTTPException(400, "Некорректный адрес")
    return Response(qr_svg(url), media_type="image/svg+xml",
                    headers={"Cache-Control": "public, max-age=86400"})


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket, token: str):
    user_id = decode_token(token)
    if not user_id:
        await ws.close(code=4401)
        return
    await manager.connect(user_id, ws)
    try:
        while True:
            msg = await ws.receive_text()  # ping от клиента держит соединение
            if msg == "ping":
                await ws.send_text('{"type":"pong"}')
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(user_id, ws)


# Собранный фронтенд (frontend/dist) раздаётся тем же сервером — один адрес для PWA
FRONT_DIST = Path(BASE_DIR).parent / "frontend" / "dist"
if FRONT_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONT_DIST / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str):
        file = FRONT_DIST / path
        if path and file.is_file():
            return FileResponse(file)
        return FileResponse(FRONT_DIST / "index.html")
