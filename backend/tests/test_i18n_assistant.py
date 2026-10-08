"""Ассистент и серверные подписи на казахском: разбор казахских запросов и ответ на языке запроса."""
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent

SCENARIO = textwrap.dedent('''
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as c:
        tok = c.post("/api/auth/login", json={"login": "master1", "pin": "1234"}).json()["token"]
        ru = {"Authorization": "Bearer " + tok}
        kz = {**ru, "X-Lang": "kz"}

        def ask(headers, q):
            r = c.post("/api/assistant/ask", headers=headers, json={"query": q})
            assert r.status_code == 200, r.text
            return r.json()

        intents = {
            "Электриктерден қазір кім бос?": "free_workers",
            "Слесарьлерден қазір кім бос?": "free_workers",
            "Ауысымда не мерзімінен өтті?": "overdue_orders",
            "Ауысым қорытындысы": "general_shift_summary",
            "Мәселелі жабдықтың топ-тізімі": "equipment_anomalies",
            "Ұсақтау бөлімшесі бойынша есеп жаса": "section_summary",
        }
        for q, intent in intents.items():
            got = ask(kz, q)
            assert got["intent"] == intent, (q, got["intent"])

        # ответ на казахском; русский не меняется
        a = ask(kz, "Ауысым қорытындысы")["answer"]
        assert "Ағымдағы ауысым қорытындысы" in a and "Сводка" not in a, a
        assert "Сводка текущей смены" in ask(ru, "Сводка по смене")["answer"]
        assert ask(kz, "Ауысым қорытындысы")["suggestions"][0] == "Электриктерден қазір кім бос?"

        # ошибка входа и подписи статусов
        r = c.post("/api/auth/login", headers={"X-Lang": "kz"}, json={"login": "x", "pin": "0000"})
        assert r.json()["detail"] == "Логин немесе ПИН-код қате", r.text
        labels = {w["live"]["label"] for w in c.get("/api/workers", headers=kz).json()}
        assert not any("Свободен" in l or "Выполняет" in l for l in labels), labels
    print("OK")
''')


class AssistantKazakhTest(unittest.TestCase):
    def test_kazakh_prompts_and_answers(self):
        with tempfile.TemporaryDirectory() as tmp:
            env = {**os.environ, "DATABASE_URL": f"sqlite:///{tmp}/i18n.db", "MEDIA_DIR": f"{tmp}/media",
                   "DEMO_MODE": "true"}
            r = subprocess.run([sys.executable, "-c", SCENARIO], cwd=BACKEND_DIR, env=env,
                               capture_output=True, text=True, timeout=240)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
