@echo off
chcp 65001 > nul
title НарядAI — АО «Костанайские Минералы»
color 0B

echo ======================================================================
echo    «НарядAI» — Интеллектуальная система контроля нарядов
echo              АО «Костанайские Минералы» (Windows 11)
echo ======================================================================
echo.

:: 1. Проверка Python
python --version >nul 2>&1
if errorlevel 1 (
    py -3 --version >nul 2>&1
    if errorlevel 1 (
        color 0C
        echo [ОШИБКА] Python не обнаружен в системе!
        echo Пожалуйста, установите Python 3.11 или 3.12 с официального сайта:
        echo https://www.python.org/downloads/
        echo ВНИМАНИЕ: При установке обязательно включите галочку:
        echo    [v] Add Python to PATH (Добавить Python в переменные среды)
        echo.
        pause
        exit /b 1
    ) else (
        set PY_CMD=py -3
    )
) else (
    set PY_CMD=python
)

:: 2. Создание виртуального окружения (если ещё не создано)
if not exist "backend\.venv\Scripts\python.exe" (
    echo [1/4] Создание виртуального окружения Python...
    %PY_CMD% -m venv backend\.venv
    echo [1/4] Установка зависимостей бэкенда (FastAPI, SQLAlchemy, uvicorn)...
    call backend\.venv\Scripts\python.exe -m pip install --upgrade pip
    call backend\.venv\Scripts\pip install -r backend\requirements.txt
) else (
    echo [1/4] Виртуальное окружение Python готово.
)

:: 3. Проверка базы данных и генерация 3-месячной истории
if not exist "backend\naryad.db" (
    echo [2/4] Генерация демонстрационной БД (92 дня, 600+ нарядов, аномалии)...
    cd backend
    call .venv\Scripts\python.exe -m seed.generate --days 92 --seed 42
    cd ..
) else (
    echo [2/4] База данных нарядов обнаружена (backend\naryad.db).
)

:: 4. Проверка собранного веб-интерфейса
if not exist "frontend\dist\index.html" (
    echo [3/4] Сборка интерфейса React + Tailwind...
    where npm >nul 2>&1
    if errorlevel 1 (
        echo [ПРЕДУПРЕЖДЕНИЕ] Node.js / npm не найден.
        echo Если сборка отсутствует, установите Node.js LTS с https://nodejs.org/
    ) else (
        cd frontend
        call npm install
        call npm run build
        cd ..
    )
) else (
    echo [3/4] Веб-интерфейс (PWA) собран и готов к раздаче.
)

echo.
echo ======================================================================
echo  🚀 Сервер «НарядAI» успешно запускается!
echo.
echo  👉 Веб-панель и мобильный PWA: http://localhost:8000
echo  👉 Документация API (Swagger):  http://localhost:8000/docs
echo.
echo  Учётные записи для демо (ПИН у всех: 1234):
echo    • Мастер смены:    master1   (Исмаилов М.К.)
echo    • Слесарь:         ahmetov   (Ахметов Е.С. — свободен)
echo    • Слесарь:         serikov   (Сериков Д.К. — повторные дефекты)
echo    • Главный механик: boss      (Сагинтаев Б.А.)
echo ======================================================================
echo.

:: Адрес и QR-код для телефона (тот же Wi-Fi)
set PYTHONIOENCODING=utf-8
cd backend
call .venv\Scripts\python.exe -m app.netinfo --port 8000
cd ..

:: Брандмауэр Windows: правило для порта 8000 (сработает при запуске от имени администратора)
netsh advfirewall firewall show rule name="NaryadAI 8000" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="NaryadAI 8000" dir=in action=allow protocol=TCP localport=8000 >nul 2>&1
    if errorlevel 1 (
        echo [!] Если телефон не открывает страницу: разрешите доступ к Python во всплывающем окне
        echo     брандмауэра или запустите этот файл от имени администратора.
    ) else (
        echo [OK] Добавлено правило брандмауэра для порта 8000.
    )
)
echo.

:: Автоматическое открытие браузера
start http://localhost:8000

:: Запуск веб-сервера
cd backend
:: Адрес, на котором слушает сервер.
:: 0.0.0.0 - доступен всем устройствам в вашей сети (нужно для телефона).
:: 127.0.0.1 - только этот компьютер, телефон подключиться не сможет.
:: Для показа в общей сети (хакатон, Wi-Fi) закомментируйте строку set "HOST=0.0.0.0"
:: и раскомментируйте строку set "HOST=127.0.0.1" ниже.
set "HOST=0.0.0.0"
:: set "HOST=127.0.0.1"

call .venv\Scripts\uvicorn.exe app.main:app --host %HOST% --port 8000
cd ..
pause
