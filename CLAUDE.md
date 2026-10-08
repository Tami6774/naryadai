# CLAUDE.md — «НарядAI» (АО «Костанайские Минералы»)

## Overview
Интеллектуальная система выдачи, исполнения и контроля ремонтно-технических нарядов предприятия АО «Костанайские Минералы» (Qostanai Industry Hackathon 2026).
- Web-панель мастера смены и руководителя.
- Мобильный PWA / Android APK интерфейс исполнителя (крупные кнопки, оффлайн-адаптация под рабочие перчатки).
- AI-контролер: отслеживание дедлайнов, верификация закрытия (фото до/после, нормы ТМЦ), расчет рейтинга рабочих и аналитика поломок/аномалий.

## Tech Stack
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy, SQLite/PostgreSQL, Pydantic v2, Uvicorn.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Capacitor (Android APK build).
- **Orchestration:** Docker Compose, bash scripts (`run.sh`).

## Key Commands
- Start whole project: `./run.sh` (Runs FastAPI at :8000 and Frontend)
- Start on Windows 11: `run_windows.bat` (wrapper over `run_windows.ps1`; sets up venv, DB, UI build, starts the server)
- Backend tests: `pytest backend/tests -v`
- Frontend dev: `cd frontend && npm run dev`
- Frontend build: `cd frontend && npm run build`
- API Docs: `http://localhost:8000/docs`

## Structure
- `backend/app/api/`: REST API роутеры (наряды, сотрудники, ТМЦ, аналитика).
- `backend/app/models/`: SQLAlchemy модели базы данных.
- `backend/app/services/`: Бизнес-логика и алгоритмы AI-контролера.
- `frontend/src/`: Компоненты UI (роли: Мастер, Исполнитель, Аналитик).

## Development Rules
- Do not read or commit `naryad.db` or `media/` binary files directly.
- Ensure API backward compatibility for the mobile PWA client.
- Maintain glove-friendly accessibility styling (min 48px touch targets) on mobile views.
