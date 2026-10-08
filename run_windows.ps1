<#
.SYNOPSIS
    Запуск «НарядAI» (АО «Костанайские Минералы») на Windows 11.

.DESCRIPTION
    Обычно запускается двойным кликом по run_windows.bat. Скрипт сам:
      1. находит Python 3.11+ (или предлагает поставить через winget), создаёт backend\.venv
         и ставит зависимости;
      2. генерирует демо-базу backend\naryad.db (92 дня, 600+ нарядов);
      3. собирает веб-интерфейс frontend\dist (нужен Node.js 18+, тоже можно поставить через winget);
      4. запускает сервер и открывает браузер.
    Повторные запуски пропускают уже выполненные шаги.

.PARAMETER Port
    Порт сервера. По умолчанию 8000.

.PARAMETER LocalOnly
    Слушать только 127.0.0.1. С телефона по Wi-Fi подключиться не получится.

.PARAMETER NoBrowser
    Не открывать браузер автоматически.
#>
[CmdletBinding()]
param(
    [int]$Port = 8000,
    [switch]$LocalOnly,
    [switch]$NoBrowser
)

# Кириллица в консоли и Unicode в выводе Python (QR-код, эмодзи в сообщениях)
try {
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [Console]::OutputEncoding = $utf8
    $OutputEncoding = $utf8
} catch { }
$env:PYTHONIOENCODING = 'utf-8'
$env:PYTHONUTF8 = '1'
$ProgressPreference = 'SilentlyContinue'

$Root      = $PSScriptRoot
$Backend   = Join-Path $Root 'backend'
$Frontend  = Join-Path $Root 'frontend'
$Venv      = Join-Path $Backend '.venv'
$VenvPy    = Join-Path $Venv 'Scripts\python.exe'
$DepsMark  = Join-Path $Venv '.deps-installed'
$ReqFile   = Join-Path $Backend 'requirements.txt'
$DbFile    = Join-Path $Backend 'naryad.db'
$DistIndex = Join-Path $Frontend 'dist\index.html'
$Url       = "http://localhost:$Port"

function Write-Step([int]$N, [string]$Text) { Write-Host "[$N/4] $Text" -ForegroundColor Green }
function Write-Note([string]$Text) { Write-Host "      $Text" -ForegroundColor DarkGray }
function Write-Warn([string]$Text) { Write-Host "[!] $Text" -ForegroundColor Yellow }
function Stop-WithError([string]$Text) {
    Write-Host ""
    Write-Host "[ОШИБКА] $Text" -ForegroundColor Red
    exit 1
}

function Update-SessionPath {
    # После установки через winget новые каталоги уже есть в реестре, но ещё не в PATH этого окна
    $fresh = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
    $known = $env:Path -split ';'
    foreach ($dir in ($fresh -split ';')) {
        $dir = [Environment]::ExpandEnvironmentVariables($dir)
        if ($dir -and ($known -notcontains $dir)) { $env:Path += ";$dir" }
    }
}

function Install-WithWinget([string]$Id, [string]$Title, [string]$Note) {
    # Ничего не возвращает: вызывающий код после установки сам заново ищет программу
    if (-not (Get-Command winget.exe -ErrorAction SilentlyContinue)) {
        Write-Warn "winget не найден — установите $Title вручную (см. WINDOWS_GUIDE.md)."
        return
    }
    Write-Host ""
    Write-Host "Нужен $Title. $Note" -ForegroundColor Cyan
    try { $answer = Read-Host 'Установить автоматически через winget? [Д/н]' } catch { return }
    if ($answer -match '^\s*(n|no|н|нет)\s*$') { return }
    & winget.exe install --exact --id $Id --accept-package-agreements --accept-source-agreements
    Update-SessionPath
}

function Get-PythonInfo([string]$Exe, [string[]]$ExeArgs = @()) {
    # Запускает интерпретатор и возвращает его путь и версию. $null — если это не рабочий Python
    # (например, пустая заглушка Microsoft Store в WindowsApps: она завершается с кодом 9009).
    try {
        $out = & $Exe @ExeArgs -c "import sys; print(sys.executable); print(sys.version_info[0]); print(sys.version_info[1])" 2>$null
    } catch { return $null }
    if ($LASTEXITCODE -ne 0) { return $null }
    $lines = @($out | Where-Object { $_ })
    if ($lines.Count -lt 3) { return $null }
    return [pscustomobject]@{ Path = [string]$lines[0]; Major = [int]$lines[1]; Minor = [int]$lines[2] }
}

function Find-Python {
    $candidates = New-Object System.Collections.ArrayList
    $launcher = Get-Command py.exe -ErrorAction SilentlyContinue
    if ($launcher) {
        foreach ($v in '-3.12', '-3.13', '-3.11', '-3') { [void]$candidates.Add(@($launcher.Source, $v)) }
    }
    $inPath = Get-Command python.exe -ErrorAction SilentlyContinue
    if ($inPath) { [void]$candidates.Add(@($inPath.Source)) }
    foreach ($dir in @("$env:LOCALAPPDATA\Programs\Python", $env:ProgramFiles, ${env:ProgramFiles(x86)})) {
        if ($dir -and (Test-Path $dir)) {
            Get-ChildItem -Path $dir -Directory -Filter 'Python3*' -ErrorAction SilentlyContinue |
                Sort-Object Name -Descending |
                ForEach-Object {
                    $exe = Join-Path $_.FullName 'python.exe'
                    if (Test-Path $exe) { [void]$candidates.Add(@($exe)) }
                }
        }
    }
    foreach ($c in $candidates) {
        $info = Get-PythonInfo -Exe $c[0] -ExeArgs @($c | Select-Object -Skip 1)
        if ($info -and $info.Major -eq 3 -and $info.Minor -ge 11) { return $info.Path }
    }
    return $null
}

function Find-Npm {
    # Путь к npm.cmd, если установлен Node.js 18+; иначе $null
    $dirs = @()
    $node = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($node) { $dirs += (Split-Path $node.Source) }
    $dirs += "$env:ProgramFiles\nodejs"
    $dirs += "$env:LOCALAPPDATA\Programs\nodejs"
    foreach ($dir in $dirs) {
        $nodeExe = Join-Path $dir 'node.exe'
        $npmCmd  = Join-Path $dir 'npm.cmd'
        if (-not ((Test-Path $nodeExe) -and (Test-Path $npmCmd))) { continue }
        $ver = & $nodeExe --version 2>$null
        if ($LASTEXITCODE -eq 0 -and "$ver" -match '^v(\d+)' -and [int]$Matches[1] -ge 18) {
            # npm и vite запускают node через PATH — каталог Node.js должен там быть
            if (($env:Path -split ';') -notcontains $dir) { $env:Path = "$dir;$env:Path" }
            return $npmCmd
        }
    }
    return $null
}

function Test-BackendImport {
    # $null — бэкенд импортируется; иначе текст ошибки.
    # Smart App Control (защита Windows 11) блокирует неподписанные скомпилированные модули (.pyd)
    # без репутации: сервер тогда падает с «DLL load failed» уже при запуске, а не при установке.
    $probe = @'
import sys, traceback
try:
    import app.main
except BaseException:
    traceback.print_exc(file=sys.stdout)
    sys.exit(3)
'@
    Push-Location $Backend
    try {
        $out = $probe | & $VenvPy -
        $code = $LASTEXITCODE
    } finally {
        Pop-Location
    }
    if ($code -eq 0) { return $null }
    $text = (($out | ForEach-Object { "$_" }) -join "`n").Trim()
    if (-not $text) { $text = "Python завершился с кодом $code без сообщения." }
    return $text
}

function Install-PureSqlAlchemy {
    # Официальная сборка SQLAlchemy на чистом Python (py3-none-any): в ней нет .pyd, блокировать нечего.
    # Версия берётся из уже установленного пакета, чтобы не разойтись с requirements.txt.
    $ver = "$(& $VenvPy -c "import importlib.metadata as m; print(m.version('sqlalchemy'))")".Trim()
    if ($LASTEXITCODE -ne 0 -or -not $ver) { return $false }
    $dir = Join-Path ([IO.Path]::GetTempPath()) 'naryad-pure-wheels'
    Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction SilentlyContinue
    & $VenvPy -m pip download "sqlalchemy==$ver" --no-deps --only-binary=:all: --platform any -d $dir --disable-pip-version-check | Out-Host
    if ($LASTEXITCODE -ne 0) { return $false }
    $wheel = Get-ChildItem -LiteralPath $dir -Filter 'sqlalchemy-*-py3-none-any.whl' -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $wheel) { return $false }
    & $VenvPy -m pip install --force-reinstall --no-deps --disable-pip-version-check $wheel.FullName | Out-Host
    $ok = ($LASTEXITCODE -eq 0)
    Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction SilentlyContinue
    return $ok
}

Write-Host '======================================================================' -ForegroundColor Cyan
Write-Host '   «НарядAI» — интеллектуальная система контроля нарядов' -ForegroundColor Yellow
Write-Host '   АО «Костанайские Минералы» · запуск на Windows 11' -ForegroundColor Yellow
Write-Host '======================================================================' -ForegroundColor Cyan
Write-Host ''

# ---------------------------------------------------------------- 1. Python и зависимости
$Py = Find-Python
if (-not $Py) {
    Write-Warn 'Python 3.11+ не найден (пустая заглушка из Microsoft Store не считается).'
    Install-WithWinget -Id 'Python.Python.3.12' -Title 'Python 3.12' `
        -Note 'Загрузка с python.org, около 25 МБ, права администратора не нужны.'
    $Py = Find-Python
}
if (-not $Py) {
    Stop-WithError ("Python 3.11+ не найден.`n" +
        "Установите Python 3.12 с https://www.python.org/downloads/ (отметьте «Add python.exe to PATH»)`n" +
        "или выполните в PowerShell:  winget install -e --id Python.Python.3.12`n" +
        "Затем запустите run_windows.bat снова.")
}

if ((Test-Path $VenvPy) -and -not (Get-PythonInfo -Exe $VenvPy)) {
    Write-Warn 'Окружение backend\.venv повреждено или создано на другом компьютере — создаю заново.'
    Remove-Item -LiteralPath $Venv -Recurse -Force
}
if (-not (Test-Path $VenvPy)) {
    Write-Step 1 "Создание виртуального окружения Python ($Py)..."
    & $Py -m venv $Venv
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $VenvPy)) {
        Stop-WithError 'Не удалось создать виртуальное окружение (python -m venv).'
    }
}

# Зависимости ставим, пока не отмечен успех для текущего requirements.txt — иначе оборванная
# первая установка оставила бы наполовину пустое окружение
$reqHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $ReqFile).Hash
$haveHash = ''
if (Test-Path $DepsMark) { $haveHash = (Get-Content -LiteralPath $DepsMark -Raw).Trim() }
if ($haveHash -ne $reqHash) {
    Write-Step 1 'Установка зависимостей бэкенда (первый запуск: 1-3 минуты)...'
    & $VenvPy -m pip install --disable-pip-version-check -r $ReqFile
    if ($LASTEXITCODE -ne 0) {
        Stop-WithError ("Не удалось установить зависимости из backend\requirements.txt (см. сообщения выше).`n" +
            "Проверьте интернет-соединение. Если pip сообщает о сборке пакета из исходников,`n" +
            "установите Python 3.12: winget install -e --id Python.Python.3.12")
    }

    $problem = Test-BackendImport
    if ($problem -and $problem -match 'site-packages[\\/]sqlalchemy') {
        Write-Warn 'Windows (Smart App Control) заблокировала скомпилированный модуль SQLAlchemy.'
        Write-Note 'Ставлю его официальную сборку на чистом Python — защиту Windows отключать не нужно.'
        if (Install-PureSqlAlchemy) { $problem = Test-BackendImport }
    }
    if ($problem) {
        Write-Host $problem -ForegroundColor DarkGray
        if ($problem -match 'DLL load failed') {
            Stop-WithError ("Windows (Smart App Control / политика управления приложениями) заблокировала файл из зависимостей Python.`n" +
                "Защиту системы этот скрипт не отключает. Варианты:`n" +
                "  - запустить проект в WSL2 или Docker (Варианты 3 и 4 в WINDOWS_GUIDE.md);`n" +
                "  - открыть уже запущенный сервер с другого компьютера по сети (Вариант 1);`n" +
                "  - отключить Smart App Control самостоятельно — это необратимо (вернуть можно только переустановкой Windows).")
        }
        Stop-WithError 'Бэкенд не удалось импортировать (см. сообщение выше).'
    }
    Set-Content -LiteralPath $DepsMark -Value $reqHash -Encoding Ascii
} else {
    Write-Step 1 'Окружение Python готово.'
}

# ---------------------------------------------------------------- 2. База данных
if ($env:DATABASE_URL) {
    Write-Step 2 'Задан DATABASE_URL — использую его; пустую базу сервер заполнит демо-данными сам.'
} elseif (Test-Path $DbFile) {
    Write-Step 2 'База данных найдена (backend\naryad.db).'
} else {
    Write-Step 2 'Генерация демонстрационной базы (92 дня, 600+ нарядов) — около минуты...'
    # Генерируем во временный файл и переименовываем по успеху: оборванный запуск не оставит битую базу
    $tmpDb = "$DbFile.tmp"
    Remove-Item -LiteralPath $tmpDb -Force -ErrorAction SilentlyContinue
    $env:DATABASE_URL = 'sqlite:///' + ($tmpDb -replace '\\', '/')
    Push-Location $Backend
    try {
        & $VenvPy -m seed.generate --days 92 --seed 42
        $seedExit = $LASTEXITCODE
    } finally {
        Pop-Location
        Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
    }
    if ($seedExit -ne 0 -or -not (Test-Path $tmpDb)) {
        Remove-Item -LiteralPath $tmpDb -Force -ErrorAction SilentlyContinue
        Stop-WithError 'Не удалось сгенерировать демонстрационную базу (см. сообщения выше).'
    }
    Move-Item -LiteralPath $tmpDb -Destination $DbFile
}

# ---------------------------------------------------------------- 3. Веб-интерфейс
if (Test-Path $DistIndex) {
    Write-Step 3 'Веб-интерфейс собран.'
} else {
    $Npm = Find-Npm
    if (-not $Npm) {
        Write-Warn 'Веб-интерфейс (frontend\dist) ещё не собран, а для сборки нужен Node.js 18+.'
        Install-WithWinget -Id 'OpenJS.NodeJS.LTS' -Title 'Node.js LTS' `
            -Note 'Загрузка с nodejs.org, около 30 МБ; Windows запросит подтверждение администратора (UAC).'
        $Npm = Find-Npm
    }
    if ($Npm) {
        Write-Step 3 'Сборка веб-интерфейса React + Tailwind (первый запуск: 1-3 минуты)...'
        Push-Location $Frontend
        try {
            $built = $false
            if (Test-Path 'package-lock.json') {
                & $Npm ci --no-audit --no-fund
                $built = ($LASTEXITCODE -eq 0)
            }
            if (-not $built) {
                & $Npm install --no-audit --no-fund
                $built = ($LASTEXITCODE -eq 0)
            }
            if ($built) {
                & $Npm run build
            }
        } finally {
            Pop-Location
        }
        if (-not (Test-Path $DistIndex)) {
            Write-Warn 'Сборка интерфейса не удалась (см. сообщения выше). Сервер запустится без веб-интерфейса.'
        }
    } else {
        Write-Warn 'Node.js не установлен — сервер запустится без веб-интерфейса, будет доступен только API.'
        Write-Note 'Установите Node.js LTS (https://nodejs.org) и запустите скрипт снова.'
    }
}

# ---------------------------------------------------------------- 4. Запуск сервера
$BindHost = '0.0.0.0'
if ($LocalOnly) { $BindHost = '127.0.0.1' }

try {
    $busy = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
} catch { $busy = @() }
if ($busy.Count -gt 0) {
    # Повторный запуск: если на порту уже отвечает «НарядAI», просто открываем его
    $ours = $false
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 3
        $ours = ($health.status -eq 'ok' -and $null -ne $health.demo_mode)
    } catch { }
    if ($ours) {
        Write-Host "«НарядAI» уже запущен: $Url" -ForegroundColor Green
        if (-not $NoBrowser) { Start-Process $Url }
        exit 0
    }
    Stop-WithError ("Порт $Port уже занят другой программой (процесс с PID $($busy[0].OwningProcess)).`n" +
        "Чтобы запустить «НарядAI» на другом порту:  .\run_windows.bat -Port 8001")
}

Write-Step 4 'Запуск сервера...'
Write-Host ''
Write-Host '======================================================================' -ForegroundColor Green
Write-Host " Веб-панель и мобильный PWA: $Url" -ForegroundColor White
Write-Host " Документация API (Swagger): $Url/docs" -ForegroundColor White
Write-Host ''
Write-Host ' Демо-аккаунты (ПИН у всех: 1234):' -ForegroundColor Cyan
Write-Host '   master1  — мастер смены (Исмаилов М.К.)'
Write-Host '   ahmetov  — слесарь, свободен (Ахметов Е.С.)'
Write-Host '   serikov  — слесарь, повторные дефекты (Сериков Д.К.)'
Write-Host '   boss     — главный механик (Сагинтаев Б.А.)'
Write-Host '======================================================================' -ForegroundColor Green
Write-Host ''

if (-not $LocalOnly) {
    # Адрес и QR-код для телефона (тот же Wi-Fi)
    Push-Location $Backend
    try { & $VenvPy -m app.netinfo --port $Port } finally { Pop-Location }

    # Брандмауэр: входящие подключения на порт сервера, иначе телефон не откроет страницу
    $ruleName = "NaryadAI $Port"
    try {
        if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
            $principal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
            if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
                New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -Profile Private | Out-Null
                Write-Host "Добавлено правило брандмауэра «$ruleName» (частные сети)." -ForegroundColor Green
            } else {
                Write-Note 'Если Windows спросит про брандмауэр для Python — отметьте «Частные сети» и нажмите «Разрешить доступ».'
                Write-Note 'Без этого с телефона страница не откроется (на самом ПК всё работает и так).'
            }
        }
    } catch { }
    Write-Host ''
}

if (-not $NoBrowser) {
    # Открываем браузер, когда сервер уже отвечает (первый запуск может занять несколько секунд)
    Start-Job -ScriptBlock {
        param($healthUrl, $openUrl)
        for ($i = 0; $i -lt 180; $i++) {
            try {
                Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2 | Out-Null
                Start-Process $openUrl
                return
            } catch { Start-Sleep -Seconds 1 }
        }
    } -ArgumentList "http://127.0.0.1:$Port/api/health", $Url | Out-Null
}

Write-Host 'Остановить сервер: Ctrl+C.' -ForegroundColor DarkGray
$serverExit = 0
Push-Location $Backend
try {
    & $VenvPy -m uvicorn app.main:app --host $BindHost --port $Port
    $serverExit = $LASTEXITCODE
} finally {
    Pop-Location
    Get-Job -ErrorAction SilentlyContinue | Remove-Job -Force -ErrorAction SilentlyContinue
}
Write-Host ''
Write-Host 'Сервер «НарядAI» остановлен.' -ForegroundColor Yellow
exit $serverExit
