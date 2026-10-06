#!/usr/bin/env python3
"""
Скрипт экспорта кодовой базы «НарядAI» для Google AI Studio (Gemini 1.5 Pro / 2.0 Flash).

Собирает чистый, структурированный контекст проекта без бинарников, .git, .venv и node_modules.
Размер результирующего контекста: ~35 000 - 45 000 токенов (всего ~3-4% от контекстного окна Gemini в 1M-2M токенов).
"""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "export"
OUTPUT_FILE = OUTPUT_DIR / "naryad_ai_full_context.md"

# Включаемые расширения файлов
INCLUDE_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".json", ".sql", ".md", ".txt",
    ".bat", ".sh", ".ps1", ".yml", ".yaml", ".xml", ".css", ".html"
}

# Игнорируемые каталоги и файлы
IGNORE_DIRS = {
    ".git", ".venv", "venv", "node_modules", "__pycache__", "dist",
    "build", ".gradle", "assets", "media", ".idea", ".vscode",
    ".system_generated", "coverage"
}

IGNORE_FILES = {
    "package-lock.json", "naryad.db", "naryad-ai.apk", "app-debug.apk",
    "yarn.lock", "pnpm-lock.yaml"
}

# Приоритетный порядок файлов для начала контекста
CORE_FILES = [
    "case_requirements.txt",
    "README.md",
    "backend/app/models.py",
    "backend/app/schemas.py",
    "backend/app/main.py",
    "backend/app/routers/orders.py",
    "backend/app/routers/core.py",
    "backend/app/services/orders.py",
    "backend/app/services/analytics.py",
    "backend/app/services/deadlines.py",
    "backend/app/services/ai_review.py",
    "backend/app/services/reports.py",
    "backend/app/services/nlp.py",
    "frontend/src/App.tsx",
    "frontend/src/api.ts",
    "frontend/src/pages/MasterView.tsx",
    "frontend/src/pages/WorkerView.tsx",
    "frontend/src/pages/ChiefView.tsx",
    "frontend/src/pages/LoginPage.tsx",
    "frontend/src/utils/offlineQueue.ts",
    "frontend/src/utils/i18n.ts",
]


def should_include_file(path: Path) -> bool:
    if path.name in IGNORE_FILES:
        return False
    if any(part in IGNORE_DIRS for part in path.parts):
        return False
    if path.suffix.lower() not in INCLUDE_EXTENSIONS:
        return False
    # Игнорировать слишком большие сгенерированные файлы (> 500 KB)
    if path.stat().st_size > 500_000:
        return False
    return True


def collect_project_files():
    all_files = []
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Модифицируем dirs in-place для пропуска игнорируемых папок
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            p = Path(root) / f
            if should_include_file(p):
                rel_path = p.relative_to(PROJECT_ROOT).as_posix()
                all_files.append((rel_path, p))
    return all_files


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    all_files = collect_project_files()

    # Сортировка: сначала ключевые файлы, затем остальные по алфавиту
    def sort_key(item):
        rel_path = item[0]
        if rel_path in CORE_FILES:
            return (0, CORE_FILES.index(rel_path))
        return (1, rel_path)

    all_files.sort(key=sort_key)

    total_chars = 0
    total_files = len(all_files)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write("# Полный контекст кодовой базы проекта «НарядAI»\n\n")
        out.write("> **Проект:** «НарядAI» (АО «Костанайские Минералы», Qostanai Industry Hackathon 2026)\n")
        out.write("> **Стек:** FastAPI, SQLAlchemy, SQLite/PostgreSQL, React 18, TypeScript, Tailwind CSS, Capacitor Android\n")
        out.write("> **Назначение файла:** Экспорт полного контекста кодовой базы для загрузки в **Google AI Studio** (Gemini 1.5 Pro / 2.0 Flash / Pro).\n\n")

        out.write("## 🗂 Структура включенных файлов проекта\n\n")
        for rel_path, _ in all_files:
            out.write(f"- `{rel_path}`\n")
        out.write("\n---\n\n")

        for rel_path, abs_path in all_files:
            try:
                content = abs_path.read_text(encoding="utf-8", errors="replace")
                total_chars += len(content)
                ext = abs_path.suffix.lstrip(".")
                lang_map = {
                    "py": "python",
                    "ts": "typescript",
                    "tsx": "tsx",
                    "js": "javascript",
                    "json": "json",
                    "css": "css",
                    "html": "html",
                    "sh": "bash",
                    "bat": "bat",
                    "ps1": "powershell",
                    "yml": "yaml",
                    "yaml": "yaml",
                    "xml": "xml",
                    "md": "markdown",
                    "txt": "text",
                }
                code_lang = lang_map.get(ext, "")

                out.write(f"### Файл: `{rel_path}`\n\n")
                out.write(f"```{code_lang}\n")
                out.write(content)
                if not content.endswith("\n"):
                    out.write("\n")
                out.write("```\n\n---\n\n")
            except Exception as e:
                print(f"Ошибка чтения {rel_path}: {e}", file=sys.stderr)

    approx_tokens = total_chars // 4
    print(f"✅ Экспорт успешно завершён!")
    print(f"📁 Файл: {OUTPUT_FILE}")
    print(f"📊 Статистика:")
    print(f"   • Файлов объединено: {total_files}")
    print(f"   • Общий объём текста: {total_chars:,} символов ({total_chars / 1024 / 1024:.2f} МБ)")
    print(f"   • Примерно токенов: ~{approx_tokens:,} токенов")
    print(f"   • Доля в окне Gemini 1.5 Pro / 2.0 (1M токенов): ~{(approx_tokens / 1_000_000) * 100:.1f}%")


if __name__ == "__main__":
    main()
