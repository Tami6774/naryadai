"""Функции кейса через HTTP API на свежей демо-базе (3 месяца истории):
наряд на бригаду (5.1), история оборудования (5.5), отчёты за период с фильтрами и простои (7),
прогноз отказов (6.5).

Приложение читает DATABASE_URL при импорте, поэтому сценарий выполняется в отдельном процессе.
"""
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent

SCENARIO = textwrap.dedent('''
    from datetime import datetime, timedelta
    from fastapi.testclient import TestClient
    from app.main import app

    def auth(c, login):
        r = c.post("/api/auth/login", json={"login": login, "pin": "1234"})
        assert r.status_code == 200, r.text
        return {"Authorization": "Bearer " + r.json()["token"]}

    with TestClient(app) as c:
        boss, master, worker = auth(c, "boss"), auth(c, "master1"), auth(c, "ahmetov")
        d = c.get("/api/dictionaries", headers=master).json()
        k3 = next(e for e in d["equipment"] if e["name"] == "Конвейер К-3")
        brigade = d["brigades"][0]

        # 5.1 — наряд на бригаду: ИИ назначает свободного члена этой бригады
        o = c.post("/api/orders", headers=master, json={
            "description": "Течь масла из-под уплотнения", "equipment_id": k3["id"],
            "brigade_id": brigade["id"], "priority": "high"}).json()
        assert o["brigade"]["id"] == brigade["id"], o
        workers = {w["id"]: w for w in c.get("/api/workers", headers=master).json()}
        assert workers[o["assignee"]["id"]]["brigade"]["id"] == brigade["id"]
        assert any(e["action"] == "brigade_assign" for e in o["events"])
        assert c.post("/api/orders", headers=master, json={
            "description": "тест", "equipment_id": k3["id"], "brigade_id": 999}).status_code == 400

        # 5.5 — история оборудования: заложенная закономерность К-3 (подшипник М-02)
        h = c.get(f"/api/equipment/{k3['id']}/history", headers=boss).json()
        assert h["summary"]["unplanned"] >= 30, h["summary"]
        assert h["by_fault"][0]["code"] == "М-02", h["by_fault"][:3]
        assert h["summary"]["mtbf_days"] and h["summary"]["mtbf_days"] < 5
        assert c.get("/api/equipment/99999/history", headers=boss).status_code == 404
        assert c.get(f"/api/equipment/{k3['id']}/history", headers=worker).status_code == 403

        # 7 — отчёт по простоям
        dt = c.get("/api/reports/downtime?days=90", headers=boss).json()
        assert dt["totals"]["unplanned_hours"] > dt["totals"]["planned_hours"] > 0
        assert 0 < dt["totals"]["unplanned_share"] <= 100
        assert dt["by_fault"][0]["code"] == "М-02", dt["by_fault"][:3]
        assert all(i["total_hours"] >= i["unplanned_hours"] for i in dt["items"])

        # 7 — отчёт за период с фильтрами: участок/бригада сужают выборку
        start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%S")
        full = c.get(f"/api/reports/shift?start={start}", headers=boss).json()
        sec = c.get(f"/api/reports/shift?start={start}&section_id={k3['section_id']}", headers=boss).json()
        brig = c.get(f"/api/reports/shift?start={start}&brigade_id={brigade['id']}", headers=boss).json()
        assert full["issued"] > sec["issued"] > 0 and full["issued"] > brig["issued"] > 0, (full["issued"], sec["issued"], brig["issued"])
        # время с поясом (как шлёт браузер) приводится к локальному
        aware = c.get(f"/api/reports/shift?start={start}%2B00:00", headers=boss)
        assert aware.status_code == 200
        xl = c.get(f"/api/reports/shift/export/excel?start={start}&section_id={k3['section_id']}", headers=boss)
        assert xl.status_code == 200 and xl.content[:2] == b"PK"

        # 6.5 — прогноз отказов: К-3 (в 3 раза чаще остальных) в зоне высокого риска
        f = c.get("/api/analytics/forecast", headers=boss).json()
        k3f = next(x for x in f if x["equipment_id"] == k3["id"])
        assert k3f["level"] == "high" and k3f["probability_7d"] >= 80 and k3f["fleet_ratio"] >= 2, k3f
        assert all(0 <= x["probability_7d"] <= 100 for x in f)
        an = c.get("/api/analytics/anomalies", headers=boss).json()
        assert "forecast" in an and any(i["type"] == "failure_forecast" for i in an["insights"])
    print("SCENARIO OK")
''')


class TestCaseFeatures(unittest.TestCase):
    def test_features_over_http(self):
        with tempfile.TemporaryDirectory() as tmp:
            env = {**os.environ, "DATABASE_URL": f"sqlite:///{tmp}/features.db", "MEDIA_DIR": f"{tmp}/media",
                   "AI_LLM_ENABLED": "false"}
            r = subprocess.run([sys.executable, "-c", SCENARIO], cwd=BACKEND_DIR, env=env,
                               capture_output=True, text=True, timeout=240)
        self.assertEqual(r.returncode, 0, r.stderr[-3000:])
        self.assertIn("SCENARIO OK", r.stdout)


if __name__ == "__main__":
    unittest.main()
