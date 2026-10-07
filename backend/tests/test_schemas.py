import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.schemas import OrderCreate, PriorityIn


class TestDeadlineTimezone(unittest.TestCase):
    """Срок с поясом (toISOString → «Z») приводится к локальному времени сервера без пояса."""

    def test_utc_deadline_becomes_local_naive(self):
        utc = datetime.now(timezone.utc) + timedelta(hours=2)
        o = OrderCreate(description="Течь масла", equipment_id=1,
                        deadline=utc.isoformat().replace("+00:00", "Z"))
        self.assertIsNone(o.deadline.tzinfo)
        self.assertEqual(o.deadline, utc.astimezone().replace(tzinfo=None))
        # тот же момент времени: ≈ +2 ч от локального «сейчас», а не сдвиг на величину пояса
        self.assertAlmostEqual((o.deadline - datetime.now()).total_seconds(), 7200, delta=60)

    def test_naive_deadline_unchanged(self):
        local = datetime(2026, 10, 16, 14, 30)
        self.assertEqual(PriorityIn(priority="high", deadline=local).deadline, local)

    def test_other_offset(self):
        moscow = datetime(2026, 10, 16, 12, 0, tzinfo=timezone(timedelta(hours=3)))
        p = PriorityIn(priority="high", deadline=moscow.isoformat())
        self.assertEqual(p.deadline, moscow.astimezone().replace(tzinfo=None))


if __name__ == "__main__":
    unittest.main()
