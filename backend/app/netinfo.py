"""Адреса сервера в локальной сети — чтобы открыть систему с телефона (тот же Wi-Fi).

Используется API (/api/connect-info, QR на экране входа) и скриптами запуска:
    python -m app.netinfo --port 8000   → печатает адреса и QR-код в терминале.
"""
import argparse
import io
import ipaddress
import os
import socket

import qrcode
import qrcode.image.svg

# Явный адрес для телефонов (Docker, NAT, доменное имя): PUBLIC_BASE_URL=http://192.168.1.10:8000
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").strip().rstrip("/")


def _primary_ip() -> str | None:
    """IP интерфейса, через который идёт трафик наружу (UDP-connect не отправляет пакетов)."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))
            return s.getsockname()[0]
    except OSError:
        return None


def lan_ips() -> list[str]:
    """IPv4-адреса машины в локальных сетях, основной — первым."""
    candidates = [_primary_ip()]
    try:
        candidates += socket.gethostbyname_ex(socket.gethostname())[2]
    except OSError:
        pass
    result = []
    for ip in candidates:
        if not ip or ip in result:
            continue
        addr = ipaddress.ip_address(ip)
        if addr.is_loopback or addr.is_link_local or not addr.is_private:
            continue
        result.append(ip)
    return result


def phone_urls(port: int = 8000, scheme: str = "http") -> list[str]:
    if PUBLIC_BASE_URL:
        return [PUBLIC_BASE_URL]
    suffix = "" if (scheme, port) in (("http", 80), ("https", 443)) else f":{port}"
    return [f"{scheme}://{ip}{suffix}" for ip in lan_ips()]


def qr_svg(data: str) -> bytes:
    img = qrcode.make(data, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=2)
    buf = io.BytesIO()
    img.save(buf)
    return buf.getvalue()


def main() -> None:
    ap = argparse.ArgumentParser(description="Адреса «НарядAI» для телефона")
    ap.add_argument("--port", type=int, default=8000)
    args = ap.parse_args()
    urls = phone_urls(args.port)
    if not urls:
        print("⚠️  Компьютер не подключён к локальной сети — с телефона зайти не получится.")
        return
    print("📱 С телефона (тот же Wi-Fi) откройте:")
    for u in urls:
        print(f"     {u}")
    print("   или отсканируйте QR-код камерой телефона:")
    qr = qrcode.QRCode(border=1)
    qr.add_data(urls[0])
    qr.make(fit=True)
    try:
        qr.print_ascii(invert=True)
    except UnicodeEncodeError:  # консоль Windows без UTF-8 — QR есть на экране входа
        print("     (QR-код показан на странице входа в браузере ПК)")


if __name__ == "__main__":
    main()
