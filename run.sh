#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "=== Запуск системы «НарядAI» (АО «Костанайские Минералы») ==="

# 1. Проверяем наличие виртуального окружения
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo "Создание виртуального окружения Python..."
    python3 -m venv "$BACKEND_DIR/.venv"
    "$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

# 2. Если база данных не сгенерирована — генерируем 500+ нарядов
if [ ! -f "$BACKEND_DIR/naryad.db" ]; then
    echo "Генерация 3-месячной истории нарядов (600+ записей с заложенными закономерностями)..."
    cd "$BACKEND_DIR"
    "$BACKEND_DIR/.venv/bin/python" -m seed.generate --days 92 --seed 42
fi

# 3. Если сборка фронтенда отсутствует — собираем
if [ ! -d "$FRONTEND_DIR/dist" ]; then
    echo "Сборка PWA фронтенда..."
    cd "$FRONTEND_DIR"
    npm install
    npm run build
fi

echo ""
echo "------------------------------------------------------------------"
echo "🚀 «НарядAI» запущен и готов к работе!"
echo "👉 Веб-панель и мобильный PWA: http://localhost:8000"
echo "👉 Документация API (Swagger): http://localhost:8000/docs"
echo ""
echo "Учётные записи для демо (ПИН у всех: 1234):"
echo "  • Мастер смены: master1 (Исмаилов М.К.)"
echo "  • Слесарь: ahmetov (Ахметов Е.С. - свободен)"
echo "  • Слесарь: serikov (Сериков Д.К. - в работе)"
echo "  • Главный механик: boss (Сагинтаев Б.А.)"
echo "------------------------------------------------------------------"
echo ""

cd "$BACKEND_DIR"
exec "$BACKEND_DIR/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000
