#!/usr/bin/env python3
"""
Автоматический генератор приложений на базе кодовой базы «НарядAI» и Google AI Studio (Gemini API).

Использование:
  export GEMINI_API_KEY="AIzaSy..."
  python scripts/generate_app_with_gemini.py --target telegram
  python scripts/generate_app_with_gemini.py --target flutter
  python scripts/generate_app_with_gemini.py --target kotlin
  python scripts/generate_app_with_gemini.py --target 1c
"""
import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTEXT_FILE = PROJECT_ROOT / "export" / "naryad_ai_full_context.md"
PROMPTS_DIR = PROJECT_ROOT / "export" / "prompts"

SYSTEM_INSTRUCTION = (
    "Ты — ведущий промышленный архитектор ПО и Senior разработчик. "
    "Перед тобой полный контекст кодовой базы системы «НарядAI» для АО «Костанайские Минералы». "
    "Твоя задача — сгенерировать готовый к запуску, чистый, модульный код приложения под выбранную целевую платформу, "
    "строго соблюдая бизнес-правила (10 статусов нарядов, офлайн-режим, фотофиксация до/после, валидация ТМЦ, "
    "роли мастера и слесаря). Форматируй файлы так, чтобы перед каждым кодовым блоком стояла строка: "
    "# FILE: <путь/к/файлу>"
)

TARGET_SPECS = {
    "telegram": {
        "title": "Telegram-бот для слесарей и мастеров (Python / aiogram 3)",
        "prompt_file": PROMPTS_DIR / "01_telegram_bot.md",
        "default_dir": PROJECT_ROOT / "generated" / "telegram_bot",
    },
    "flutter": {
        "title": "Мобильное приложение на Flutter (Dart / Drift SQLite offline-first)",
        "prompt_file": PROMPTS_DIR / "02_flutter_mobile_app.md",
        "default_dir": PROJECT_ROOT / "generated" / "flutter_app",
    },
    "kotlin": {
        "title": "Нативное Android-приложение (Kotlin / Jetpack Compose / Room)",
        "prompt_file": PROMPTS_DIR / "03_kotlin_jetpack_compose.md",
        "default_dir": PROJECT_ROOT / "generated" / "android_kotlin",
    },
    "1c": {
        "title": "Модуль интеграции с 1С:ТОИР и SAP PM (FastAPI Service)",
        "prompt_file": PROMPTS_DIR / "04_erp_integration_1c.md",
        "default_dir": PROJECT_ROOT / "generated" / "erp_1c",
    },
}


def ensure_context_exists():
    if not CONTEXT_FILE.exists():
        print("⚡ Файл контекста не найден. Запуск экспорта кодовой базы...")
        from export_for_ai_studio import main as export_main
        export_main()
    return CONTEXT_FILE.read_text(encoding="utf-8", errors="replace")


def call_gemini_api(api_key: str, model: str, user_prompt: str, context_text: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    payload = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"--- КОНТЕКСТ ПРОЕКТА «НАРЯДAI» ---\n\n{context_text}\n\n--- ЗАДАЧА ---\n\n{user_prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 8192
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    print(f"📡 Отправка запроса в Google AI Studio ({model})... Это займёт 10-30 секунд.")
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError(f"Ответ от Gemini не содержит кандидатов: {data}")
            parts = candidates[0].get("content", {}).get("parts", [])
            return "".join(p.get("text", "") for p in parts)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise RuntimeError(f"Ошибка Gemini API ({e.code}): {error_body}") from e


def extract_and_save_files(text: str, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    # Сохраняем полный сырой ответ от нейросети
    raw_file = output_dir / "AI_RESPONSE.md"
    raw_file.write_text(text, encoding="utf-8")
    print(f"📝 Полный ответ сохранён в: {raw_file}")

    # Ищем маркеры файлов: # FILE: path/to/file или // FILE: ...
    file_pattern = re.compile(r'(?:#|//|<!--)\s*FILE:\s*([^\n\r]+?)(?:\s*-->)?\s*[\r\n]+```(?:\w+)?\s*[\r\n]+(.*?)```', re.DOTALL)
    matches = file_pattern.findall(text)

    saved_count = 0
    for file_path_str, code_content in matches:
        clean_path = file_path_str.strip().strip("`").strip()
        target_path = output_dir / clean_path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_text(code_content.strip() + "\n", encoding="utf-8")
        print(f"   ✓ Создан файл: {clean_path}")
        saved_count += 1

    if saved_count == 0:
        print("💡 Совет: файлы не были разделены автоматически по маркерам # FILE:, но полный код сохранён в AI_RESPONSE.md.")
    else:
        print(f"🎉 Успешно создано {saved_count} файлов в {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="Генератор приложений «НарядAI» через Google AI Studio")
    parser.add_argument("--target", choices=list(TARGET_SPECS.keys()), default="telegram",
                        help="Целевое приложение для генерации (telegram, flutter, kotlin, 1c)")
    parser.add_argument("--api-key", default=os.getenv("GEMINI_API_KEY"),
                        help="API-ключ Google AI Studio (или переменная GEMINI_API_KEY)")
    parser.add_argument("--model", default="gemini-2.0-flash",
                        choices=["gemini-2.0-flash", "gemini-1.5-pro", "gemini-2.0-pro-exp"],
                        help="Модель Gemini в Google AI Studio")
    parser.add_argument("--output-dir", default=None,
                        help="Каталог для сохранения сгенерированного кода")

    args = parser.parse_args()

    spec = TARGET_SPECS[args.target]
    output_dir = Path(args.output_dir) if args.output_dir else spec["default_dir"]

    print("======================================================================")
    print("   Генератор приложений «НарядAI» через Google AI Studio (Gemini)")
    print("======================================================================")
    print(f"🎯 Цель генерации:   {spec['title']}")
    print(f"🤖 Модель:           {args.model}")
    print(f"📁 Папка назначения: {output_dir}")
    print("----------------------------------------------------------------------")

    if not args.api_key:
        print("\n🔑 [ВНИМАНИЕ] Не указан API-ключ Google AI Studio (GEMINI_API_KEY)!")
        print("Как получить бесплатный ключ за 1 минуту:")
        print("1. Перейдите по ссылке: https://aistudio.google.com/app/apikey")
        print("2. Нажмите 'Create API key' и скопируйте ключ (начинается на AIzaSy...)")
        print("3. Запустите генератор с ключом:")
        print(f"   export GEMINI_API_KEY=\"ваш_ключ\"")
        print(f"   python scripts/generate_app_with_gemini.py --target {args.target}")
        print("\nИЛИ откройте готовый файл с промптом для вставки в веб-интерфейс:")
        print(f"📄 {spec['prompt_file']}\n")
        sys.exit(1)

    context_text = ensure_context_exists()

    prompt_file = spec["prompt_file"]
    if prompt_file.exists():
        user_prompt = prompt_file.read_text(encoding="utf-8")
    else:
        user_prompt = f"Напиши готовое production-приложение для {spec['title']} на основе проекта «НарядAI»."

    try:
        response_text = call_gemini_api(args.api_key, args.model, user_prompt, context_text)
        extract_and_save_files(response_text, output_dir)
    except Exception as exc:
        print(f"❌ Ошибка генерации: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
