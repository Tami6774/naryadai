"""Подсказка шифра по описанию на казахском и двуязычные тексты ИИ-модуля."""
import sys
import unittest
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import Base
from app.i18n import set_lang
from app.models import FaultCode
from app.services.ai_nlp import CODE_MAP, evaluate_work_relevance, suggest_fault_code


class KazakhNlpTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        engine = create_engine("sqlite://")
        Base.metadata.create_all(engine)
        cls.Session = sessionmaker(bind=engine)
        with cls.Session() as db:
            for code, name, norm, _ in CODE_MAP:
                db.add(FaultCode(code=code, category=code[0], name=name, norm_hours=norm))
            db.commit()

    def tearDown(self):
        set_lang("ru")

    def code_for(self, text):
        set_lang("kz")
        with self.Session() as db:
            sug = suggest_fault_code(db, text)
        return sug

    def test_oil_leak(self):
        sug = self.code_for("Сорғыдағы тығыздағыштан май ағып жатыр")
        self.assertEqual(sug["code"], "Г-01")
        self.assertEqual(sug["name"], "Май / гидрсұйықтықтың ағуы")

    def test_bearing(self):
        self.assertEqual(self.code_for("Мойынтірек торабы қатты қызып, шулап тұр")["code"], "М-02")

    def test_belt(self):
        self.assertEqual(self.code_for("Конвейер таспасы үзілді")["code"], "М-04")

    def test_motor(self):
        self.assertEqual(self.code_for("Қозғалтқыштан ұшқын шығып жатыр")["code"], "Э-01")

    def test_crack(self):
        self.assertEqual(self.code_for("Рамада жарықшақ пайда болды, дәнекерлеу керек")["code"], "М-07")

    def test_russian_unchanged(self):
        set_lang("ru")
        with self.Session() as db:
            sug = suggest_fault_code(db, "Обнаружена течь масла на насосе")
        self.assertEqual(sug["code"], "Г-01")
        self.assertEqual(sug["name"], "Течь масла / гидрожидкости")

    def test_work_relevance_kz(self):
        set_lang("kz")
        ok, text, _ = evaluate_work_relevance("май ағып жатыр", "Тығыздағыш сақиналар ауыстырылды, май құйылды")
        self.assertTrue(ok)
        self.assertIn("сәйкес", text)


if __name__ == "__main__":
    unittest.main()
