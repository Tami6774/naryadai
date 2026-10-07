import os
import subprocess
import sys
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))


def _import_config(env_overrides: dict) -> subprocess.CompletedProcess:
    """Импорт app.config в отдельном процессе: модуль читает окружение один раз при импорте."""
    env = {k: v for k, v in os.environ.items() if k not in ("DEMO_MODE", "JWT_SECRET")}
    env.update(env_overrides)
    return subprocess.run(
        [sys.executable, "-c", "import app.config as c; print(c.DEMO_MODE)"],
        cwd=BACKEND_DIR, env=env, capture_output=True, text=True, timeout=60,
    )


class TestDemoModeConfig(unittest.TestCase):
    def test_demo_mode_default_on(self):
        r = _import_config({})
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(r.stdout.strip(), "True")

    def test_production_refuses_default_jwt_secret(self):
        """Вне демо-режима сервер не стартует с секретом JWT из исходного кода."""
        r = _import_config({"DEMO_MODE": "false"})
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("JWT_SECRET", r.stderr)

    def test_production_with_own_secret(self):
        r = _import_config({"DEMO_MODE": "false", "JWT_SECRET": "a-real-secret-from-the-environment"})
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(r.stdout.strip(), "False")

    def test_health_reports_demo_mode(self):
        from app.config import DEMO_MODE
        from app.main import health
        self.assertEqual(health()["demo_mode"], DEMO_MODE)


if __name__ == "__main__":
    unittest.main()
