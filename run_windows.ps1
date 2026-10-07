# PowerShell скрипт запуска «НарядAI» для Windows 11
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   «НарядAI» — Интеллектуальная система контроля нарядов" -ForegroundColor Yellow
Write-Host "             АО «Костанайские Минералы» (PowerShell Windows 11)" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Проверка Python
$pyCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pyCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pyCmd = "py -3"
} else {
    Write-Host "[ОШИБКА] Python не обнаружен в системе!" -ForegroundColor Red
    Write-Host "Установите Python 3.11 или 3.12 с официального сайта: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "Обязательно отметьте галочку: 'Add Python to PATH'." -ForegroundColor Yellow
    Exit 1
}

# 2. Создание окружения
$venvPath = Join-Path $PSScriptRoot "backend\.venv"
$venvPy = Join-Path $venvPath "Scripts\python.exe"

if (-not (Test-Path $venvPy)) {
    Write-Host "[1/4] Создание виртуального окружения Python..." -ForegroundColor Green
    & $pyCmd -m venv $venvPath
    Write-Host "[1/4] Установка зависимостей бэкенда..." -ForegroundColor Green
    & $venvPy -m pip install --upgrade pip
    & (Join-Path $venvPath "Scripts\pip.exe") install -r (Join-Path $PSScriptRoot "backend\requirements.txt")
} else {
    Write-Host "[1/4] Окружение Python готово." -ForegroundColor Gray
}

# 3. База данных
$dbPath = Join-Path $PSScriptRoot "backend\naryad.db"
if (-not (Test-Path $dbPath)) {
    Write-Host "[2/4] Генерация демонстрационной БД (92 дня, 600+ нарядов)..." -ForegroundColor Green
    Push-Location (Join-Path $PSScriptRoot "backend")
    & $venvPy -m seed.generate --days 92 --seed 42
    Pop-Location
} else {
    Write-Host "[2/4] База данных нарядов обнаружена ($dbPath)." -ForegroundColor Gray
}

# 4. Фронтенд
$distPath = Join-Path $PSScriptRoot "frontend\dist\index.html"
if (-not (Test-Path $distPath)) {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "[3/4] Сборка интерфейса React + Tailwind..." -ForegroundColor Green
        Push-Location (Join-Path $PSScriptRoot "frontend")
        & npm install
        & npm run build
        Pop-Location
    } else {
        Write-Host "[ПРЕДУПРЕЖДЕНИЕ] Node.js/npm не найден для сборки фронтенда." -ForegroundColor Yellow
    }
} else {
    Write-Host "[3/4] Веб-интерфейс готов к раздаче." -ForegroundColor Gray
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host " 🚀 Сервер «НарядAI» запущен!" -ForegroundColor Green
Write-Host " 👉 Веб-интерфейс: http://localhost:8000" -ForegroundColor White
Write-Host " 👉 Swagger API:   http://localhost:8000/docs" -ForegroundColor White
Write-Host " Демо-аккаунты (ПИН: 1234): master1, ahmetov, serikov, boss" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""

# Адрес и QR-код для телефона (тот же Wi-Fi)
$env:PYTHONIOENCODING = "utf-8"
Push-Location (Join-Path $PSScriptRoot "backend")
& $venvPy -m app.netinfo --port 8000
Pop-Location

# Брандмауэр Windows: разрешаем входящие на порт 8000, чтобы открылось с телефона
$ruleName = "NaryadAI 8000"
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
    if ($isAdmin) {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Any | Out-Null
        Write-Host "🔓 Добавлено правило брандмауэра для порта 8000." -ForegroundColor Green
    } else {
        Write-Host "🔒 Если телефон не открывает страницу — разрешите доступ к Python во всплывающем окне брандмауэра" -ForegroundColor Yellow
        Write-Host "   или выполните в PowerShell от имени администратора:" -ForegroundColor Yellow
        Write-Host "   New-NetFirewallRule -DisplayName '$ruleName' -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow" -ForegroundColor White
    }
}
Write-Host ""

Start-Process "http://localhost:8000"

Push-Location (Join-Path $PSScriptRoot "backend")
& (Join-Path $venvPath "Scripts\uvicorn.exe") app.main:app --host 0.0.0.0 --port 8000
Pop-Location
