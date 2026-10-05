"""Push-уведомления на телефон.

Каналы (включаются переменными окружения):
* TELEGRAM_BOT_TOKEN — Telegram-бот (страховка / простой вариант);
* FCM — подключается на следующем этапе вместе с APK (Capacitor).
Если каналы не настроены — уведомление доходит только через WebSocket (in-app + Notification API).
"""
import logging
import os

import httpx

log = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")


def _send_telegram(chat_id: str, message: dict) -> None:
    prefix = "🚨 " if message.get("urgent") else "🔔 "
    text = f"{prefix}<b>{message['title']}</b>\n{message['text']}"
    httpx.post(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
        json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
        timeout=5,
    )


def _send_fcm(token: str, message: dict) -> None:
    # TODO(этап 2): FCM HTTP v1 через сервисный аккаунт Firebase.
    log.debug("FCM пока не настроен, token=%s…", token[:10])


def send_many(items: list[tuple[str | None, str | None, dict]]) -> None:
    for push_token, chat_id, message in items:
        try:
            if push_token:
                _send_fcm(push_token, message)
            if chat_id and TELEGRAM_BOT_TOKEN:
                _send_telegram(chat_id, message)
        except Exception as exc:  # push не должен ронять систему
            log.warning("Ошибка отправки push: %s", exc)
