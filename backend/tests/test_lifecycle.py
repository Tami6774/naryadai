import sys
import unittest
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.auth import hash_pin
from app.db import Base, SessionLocal, engine
from app.models import (
    Brigade,
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialNorm,
    Priority,
    Role,
    Section,
    Status,
    Verdict,
    WorkOrder,
    WorkType,
)
from app.schemas import ClosingForm, MaterialItem, OrderCreate
from app.services import orders as svc
from app.services.deadlines import check_deadlines


import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import app.db

TEST_DB_PATH = "test_lifecycle.db"
_orig_engine = app.db.engine
_orig_session_local = app.db.SessionLocal


class TestOrderLifecycle(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_engine = create_engine(
            f"sqlite:///{TEST_DB_PATH}", connect_args={"check_same_thread": False}
        )
        cls.TestSession = sessionmaker(autocommit=False, autoflush=False, bind=cls.test_engine)
        app.db.engine = cls.test_engine
        app.db.SessionLocal = cls.TestSession
        Base.metadata.drop_all(cls.test_engine)
        Base.metadata.create_all(cls.test_engine)
        db = cls.TestSession()

        sec = Section(name="Участок дробления")
        db.add(sec)
        db.flush()

        eq = Equipment(name="Дробилка КМД-1750", inv_no="ДР-001", section_id=sec.id, type="дробилка")
        db.add(eq)

        br = Brigade(name="Бригада №1")
        db.add(br)
        db.flush()

        pin = hash_pin("1234")
        master = Employee(full_name="Исмаилов М.К.", specialty="Мастер", role=Role.master,
                          login="master1", pin_hash=pin)
        worker1 = Employee(full_name="Ахметов Е.С.", specialty="Слесарь", grade=5,
                           brigade_id=br.id, role=Role.worker, login="ahmetov", pin_hash=pin)
        worker2 = Employee(full_name="Сериков Д.К.", specialty="Слесарь", grade=4,
                           brigade_id=br.id, role=Role.worker, login="serikov", pin_hash=pin)
        db.add_all([master, worker1, worker2])

        fc = FaultCode(code="М-02", category="М", name="Разрушение подшипника", norm_hours=3.0)
        mat = Material(name="Подшипник 22220", unit="шт")
        db.add_all([fc, mat])
        db.flush()

        db.add(MaterialNorm(fault_code_id=fc.id, material_id=mat.id, typical_qty=1.0))
        db.commit()
        db.close()

    @classmethod
    def tearDownClass(cls):
        cls.test_engine.dispose()
        app.db.engine = _orig_engine
        app.db.SessionLocal = _orig_session_local
        if os.path.exists(TEST_DB_PATH):
            try:
                os.remove(TEST_DB_PATH)
            except OSError:
                pass

    def setUp(self):
        self.db = app.db.SessionLocal()
        self.master = self.db.query(Employee).filter_by(login="master1").one()
        self.worker1 = self.db.query(Employee).filter_by(login="ahmetov").one()
        self.worker2 = self.db.query(Employee).filter_by(login="serikov").one()
        self.equipment = self.db.query(Equipment).first()
        self.fault = self.db.query(FaultCode).filter_by(code="М-02").one()
        self.mat = self.db.query(Material).first()

    def tearDown(self):
        self.db.close()

    def test_full_lifecycle(self):
        # 1. Мастер выдаёт наряд
        order_in = OrderCreate(
            work_type=WorkType.unplanned,
            description="Повышенный нагрев и вибрация подшипника",
            equipment_id=self.equipment.id,
            assignee_id=self.worker1.id,
            priority=Priority.emergency,
            deadline=datetime.now() + timedelta(hours=2),
        )
        o = svc.create_order(self.db, self.master, order_in)
        self.assertEqual(o.status, Status.issued)
        self.assertEqual(o.number, 1)

        # 2. Исполнитель принимает наряд
        svc.apply_action(self.db, o, self.worker1, "accept")
        self.assertEqual(o.status, Status.accepted)
        self.assertIsNotNone(o.accepted_at)

        # 3. Исполнитель начинает работу
        svc.apply_action(self.db, o, self.worker1, "start")
        self.assertEqual(o.status, Status.in_progress)
        self.assertIsNotNone(o.started_at)

        # 4. Исполнитель приостанавливает наряд
        svc.apply_action(self.db, o, self.worker1, "pause", reason="Ждёт запчасти со склада")
        self.assertEqual(o.status, Status.paused)

        # 5. Исполнитель возобновляет работу
        svc.apply_action(self.db, o, self.worker1, "resume")
        self.assertEqual(o.status, Status.in_progress)

        # 6. Попытка закрыть внеплановый наряд без фото и с завышением материалов (демо-шаг 7)
        bad_closing = ClosingForm(
            work_done="Сделано",
            fault_code_id=self.fault.id,
            materials=[MaterialItem(material_id=self.mat.id, qty=4.0)],  # норма 1 шт -> завышение в 4 раза!
            comment="Быстрый ремонт",
        )
        svc.apply_action(self.db, o, self.worker1, "complete", closing=bad_closing)
        # ИИ должен автоматически вернуть на доработку из-за отсутствия фото «после» и завышения
        self.assertEqual(o.status, Status.rework)
        self.assertIsNotNone(o.assessment)
        self.assertEqual(o.assessment.verdict, Verdict.needs_rework)
        self.assertLess(o.assessment.score, 60)

        # 7. Исполнитель исправляет замечания: добавляет фото «после» и нормальный расход (демо-шаг 5)
        # Симулируем добавление фото «после»
        from app.models import Photo, PhotoKind
        self.db.add(Photo(order_id=o.id, kind=PhotoKind.after, file_path="orders/1/test_after.jpg",
                          author_id=self.worker1.id, phash="0123456789abcdef"))
        self.db.commit()

        # Повторный старт и закрытие
        svc.apply_action(self.db, o, self.worker1, "start")
        good_closing = ClosingForm(
            work_done="Заменён подшипник 22220, выполнена смазка узла Литол-24, проверен нагрев",
            fault_code_id=self.fault.id,
            materials=[MaterialItem(material_id=self.mat.id, qty=1.0)],
            comment="Узел в норме, посторонних шумов нет",
        )
        svc.apply_action(self.db, o, self.worker1, "complete", closing=good_closing)
        # Теперь наряд проходит проверку ИИ
        self.assertEqual(o.status, Status.ai_review)
        self.assertIn(o.assessment.verdict, (Verdict.accepted, Verdict.accepted_with_remarks))
        self.assertGreaterEqual(o.assessment.score, 80)

        # 8. Мастер принимает работу и закрывает наряд
        svc.apply_action(self.db, o, self.master, "approve")
        self.assertEqual(o.status, Status.closed)
        self.assertIsNotNone(o.closed_at)

    def test_queue_and_auto_promote(self):
        # Проверяем, что когда у рабочего наряд в работе, следующий ставится в очередь,
        # а после закрытия первого — автоматически переходит в "accepted"
        o1 = svc.create_order(self.db, self.master, OrderCreate(
            work_type=WorkType.planned, description="ТО 1", equipment_id=self.equipment.id,
            assignee_id=self.worker2.id, priority=Priority.normal, deadline=datetime.now() + timedelta(hours=4)
        ))
        o2 = svc.create_order(self.db, self.master, OrderCreate(
            work_type=WorkType.planned, description="ТО 2 в очереди", equipment_id=self.equipment.id,
            assignee_id=self.worker2.id, priority=Priority.normal, deadline=datetime.now() + timedelta(hours=6)
        ))

        svc.apply_action(self.db, o1, self.worker2, "accept")
        svc.apply_action(self.db, o1, self.worker2, "start")
        svc.apply_action(self.db, o2, self.worker2, "queue")
        self.assertEqual(o2.status, Status.queued)

        # Закрываем первый наряд
        closing = ClosingForm(work_done="Плановый осмотр выполнен", fault_code_id=self.fault.id, materials=[])
        svc.apply_action(self.db, o1, self.worker2, "complete", closing=closing)

        # o2 должен автоматически промоутиться из queued в accepted
        self.db.refresh(o2)
        self.assertEqual(o2.status, Status.accepted)


if __name__ == "__main__":
    unittest.main()
