import os
import sys
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app.db
from app.auth import hash_pin
from app.db import Base
from app.models import AIAssessment, Brigade, Employee, Equipment, FaultCode, Material, MaterialNorm, Role, Section, Verdict, WorkOrder, WorkType, Priority, Status
from app.services.ai_nlp import evaluate_work_relevance, suggest_fault_code
from app.services.export import export_materials_excel, export_rating_excel, export_shift_report_excel, generate_order_print_html, get_materials_report

TEST_DB_PATH = "test_export_nlp.db"


class TestExportsAndNLP(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_engine = create_engine(f"sqlite:///{TEST_DB_PATH}", connect_args={"check_same_thread": False})
        cls.TestSession = sessionmaker(autocommit=False, autoflush=False, bind=cls.test_engine)
        cls._orig_engine = app.db.engine
        cls._orig_session = app.db.SessionLocal
        app.db.engine = cls.test_engine
        app.db.SessionLocal = cls.TestSession

        Base.metadata.drop_all(cls.test_engine)
        Base.metadata.create_all(cls.test_engine)

        with cls.TestSession() as db:
            sec = Section(name="Обогатительная фабрика")
            db.add(sec)
            db.flush()

            eq = Equipment(name="Насос ГрАТ-1400 №1", inv_no="НС-001", section_id=sec.id, type="насос")
            br = Brigade(name="Бригада №1")
            db.add_all([eq, br])
            db.flush()

            pin = hash_pin("1234")
            master = Employee(full_name="Исмаилов Марат", specialty="Мастер", role=Role.master, login="master1", pin_hash=pin)
            worker = Employee(full_name="Ахметов Ерлан", specialty="Слесарь", grade=5, brigade_id=br.id, role=Role.worker, login="ahmetov", pin_hash=pin)
            db.add_all([master, worker])

            fc1 = FaultCode(code="Г-01", category="Г", name="Течь масла / гидрожидкости", norm_hours=2.0)
            fc2 = FaultCode(code="М-02", category="М", name="Разрушение подшипника", norm_hours=3.0)
            mat1 = Material(name="Манжета армированная", unit="шт")
            mat2 = Material(name="Масло индустриальное И-40", unit="л")
            db.add_all([fc1, fc2, mat1, mat2])
            db.flush()

            db.add_all([
                MaterialNorm(fault_code_id=fc1.id, material_id=mat1.id, typical_qty=2.0),
                MaterialNorm(fault_code_id=fc1.id, material_id=mat2.id, typical_qty=10.0),
            ])

            now = datetime.now()
            order = WorkOrder(
                number=101,
                work_type=WorkType.unplanned,
                description="Течь масла на насосе из-под уплотнения вала",
                section_id=sec.id,
                equipment_id=eq.id,
                master_id=master.id,
                assignee_id=worker.id,
                priority=Priority.emergency,
                deadline=now + timedelta(hours=2),
                status=Status.closed,
                created_at=now - timedelta(hours=3),
                started_at=now - timedelta(hours=2),
                done_at=now - timedelta(hours=1),
                closed_at=now,
                fault_code_id=fc1.id,
                work_done="Заменены изношенные манжеты, долито масло",
            )
            db.add(order)
            db.commit()

    @classmethod
    def tearDownClass(cls):
        cls.test_engine.dispose()
        app.db.engine = cls._orig_engine
        app.db.SessionLocal = cls._orig_session
        if os.path.exists(TEST_DB_PATH):
            try:
                os.remove(TEST_DB_PATH)
            except OSError:
                pass

    def test_suggest_fault_code(self):
        with self.TestSession() as db:
            sug1 = suggest_fault_code(db, "Обнаружена течь масла на насосе")
            self.assertIsNotNone(sug1)
            self.assertEqual(sug1["code"], "Г-01")
            self.assertEqual(sug1["norm_hours"], 2.0)

            sug2 = suggest_fault_code(db, "Сильный перегрев и вибрация подшипникового узла")
            self.assertIsNotNone(sug2)
            self.assertEqual(sug2["code"], "М-02")
            self.assertEqual(sug2["norm_hours"], 3.0)

    def test_evaluate_work_relevance(self):
        ok, msg, pen = evaluate_work_relevance(
            "Течь масла из-под сальника",
            "Заменена уплотнительная манжета, долито гидравлическое масло",
            "Течь масла / гидрожидкости"
        )
        self.assertTrue(ok)
        self.assertEqual(pen, 0)

        # Несоответствие
        ok2, msg2, pen2 = evaluate_work_relevance(
            "Порыв конвейерной ленты",
            "Покрашена дверь операторской",
            "Порыв конвейерной ленты"
        )
        self.assertFalse(ok2)
        self.assertGreater(pen2, 0)

    def test_excel_exports(self):
        with self.TestSession() as db:
            now = datetime.now()
            start = now - timedelta(days=1)
            end = now + timedelta(days=1)

            # 1. Shift report
            bio_shift = export_shift_report_excel(db, start, end)
            self.assertGreater(bio_shift.getbuffer().nbytes, 4000)

            # 2. Rating report
            bio_rating = export_rating_excel(db, start, end)
            self.assertGreater(bio_rating.getbuffer().nbytes, 4000)

            # 3. Materials report
            bio_mat = export_materials_excel(db, start, end)
            self.assertGreater(bio_mat.getbuffer().nbytes, 4000)

            # 4. Materials JSON report
            mat_data = get_materials_report(db, start, end)
            self.assertIn("items", mat_data)

    def test_print_order_html(self):
        with self.TestSession() as db:
            order = db.query(WorkOrder).first()
            html = generate_order_print_html(order)
            self.assertIn("КОСТАНАЙСКИЕ МИНЕРАЛЫ", html)
            self.assertIn("НАРЯД-ЗАДАНИЕ № 101", html)
            self.assertIn("Насос ГрАТ-1400 №1", html)

    def test_print_order_html_with_ai_assessment(self):
        with self.TestSession() as db:
            order = db.query(WorkOrder).first()
            # Добавляем AI Assessment
            ai = AIAssessment(
                order_id=order.id,
                verdict=Verdict.accepted,
                score=95,
                explanation="Работы выполнены в полном соответствии",
                details={"relevance_ok": True, "penalties": []},
            )
            db.add(ai)
            db.commit()

            html = generate_order_print_html(order)
            self.assertIn("ИИ-ЗАКЛЮЧЕНИЕ ЦИФРОВОГО КОНТРОЛЁРА", html)
            self.assertIn("Принято без замечаний", html)
            self.assertIn("95/100", html)

    def test_print_order_html_null_relations(self):
        """Проверка, что печатная форма устойчива к отсутствию оборудования, участка, мастера и дедлайна."""
        dummy = WorkOrder(
            number=8888,
            work_type=WorkType.unplanned,
            description="Проверка защитного кожуха",
            section_id=1,
            equipment_id=1,
            master_id=1,
            priority=Priority.normal,
            deadline=None,
            created_at=None,
            events=[],
            materials=[],
        )
        dummy.equipment = None
        dummy.section = None
        dummy.master = None
        dummy.assignee = None
        dummy.fault_code = None

        html = generate_order_print_html(dummy)
        self.assertIn("НАРЯД-ЗАДАНИЕ № 8888", html)
        self.assertIn("Не указано", html)
        self.assertIn("Не назначен", html)

    def test_suggest_assignees_invalid_equipment(self):
        """Проверка устойчивости suggest_assignees при несуществующем ID оборудования."""
        from app.services.workers import suggest_assignees
        with self.TestSession() as db:
            candidates = suggest_assignees(db, equipment_id=999999, description="Ремонт электрооборудования")
            self.assertIsInstance(candidates, list)
            # Должен вернуть кандидатов по специальности 'Электрик' без 500 ошибки
            if candidates:
                self.assertIn("match_score", candidates[0])

    def test_assistant_ask_intents(self):
        """Проверка работы автономного ИИ-ассистента мастера смены."""
        from app.services.assistant import ask_assistant
        with self.TestSession() as db:
            # 1. Свободные люди
            res1 = ask_assistant(db, "Кто сейчас свободен из электриков?")
            self.assertEqual(res1["intent"], "free_workers")
            self.assertIn("answer", res1)

            # 2. Просрочки
            res2 = ask_assistant(db, "Что просрочено на смене?")
            self.assertEqual(res2["intent"], "overdue_orders")

            # 3. Сводка смены
            res3 = ask_assistant(db, "Сводка смены")
            self.assertEqual(res3["intent"], "general_shift_summary")

    def test_equipment_out_qr(self):
        """Проверка, что сериализатор equipment_out включает qr_code."""
        from app.serializers import equipment_out
        with self.TestSession() as db:
            eq = db.query(Equipment).first()
            eq.qr_code = "NARYAD:НС-001"
            db.commit()

            out = equipment_out(eq)
            self.assertEqual(out["qr_code"], "NARYAD:НС-001")
            self.assertEqual(out["inv_no"], "НС-001")

    def test_assistant_edge_cases(self):
        """Проверка ИИ-ассистента на пустые запросы, неизвестные интенты и спецсимволы."""
        from app.services.assistant import ask_assistant
        with self.TestSession() as db:
            # Пустая строка
            res_empty = ask_assistant(db, "")
            self.assertIn("answer", res_empty)

            # Неизвестный текст
            res_unknown = ask_assistant(db, "qwerty 123456 !!! ???")
            self.assertIn("answer", res_unknown)

            # Топ проблемного оборудования
            res_top = ask_assistant(db, "Покажи топ проблемного оборудования")
            self.assertIn("answer", res_top)


if __name__ == "__main__":
    unittest.main()
