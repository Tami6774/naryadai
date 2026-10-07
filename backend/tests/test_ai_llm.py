"""ИИ-проверка с языковой/мультимодальной моделью: разбор ответа, отказоустойчивость, слияние с правилами.

Сеть не используется: клиент Anthropic и вызовы модели подменяются.
"""
import os
import sys
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import anthropic
import httpx2
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db import Base
from app.models import (Employee, Equipment, FaultCode, Photo, Priority, Role, Section, Status,
                        Verdict, WorkOrder, WorkType)
from app.services import ai_llm, ai_review


def _response(text=None, stop_reason="end_turn"):
    content = [SimpleNamespace(type="text", text=text)] if text is not None else []
    return SimpleNamespace(stop_reason=stop_reason, content=content,
                           stop_details=SimpleNamespace(category="cyber") if stop_reason == "refusal" else None)


class TestCallJson(unittest.TestCase):
    """_call_json: валидный JSON → dict; любые сбои → None (переход на правила)."""

    def _call_with(self, effect):
        client = mock.Mock()
        if isinstance(effect, Exception):
            client.beta.messages.create.side_effect = effect
        else:
            client.beta.messages.create.return_value = effect
        with mock.patch.object(ai_llm, "_client", return_value=client):
            return ai_llm._call_json("sys", [{"type": "text", "text": "x"}], {"type": "object"}), client

    def test_valid_json(self):
        result, client = self._call_with(_response('{"relevant": true}'))
        self.assertEqual(result, {"relevant": True})
        kwargs = client.beta.messages.create.call_args.kwargs
        self.assertEqual(kwargs["model"], ai_llm.MODEL)
        self.assertEqual(kwargs["fallbacks"], "default")
        self.assertIn("server-side-fallback-2026-07-01", kwargs["betas"])
        self.assertEqual(kwargs["output_config"]["format"]["type"], "json_schema")

    def test_refusal_falls_back(self):
        self.assertIsNone(self._call_with(_response(stop_reason="refusal"))[0])

    def test_truncated_falls_back(self):
        self.assertIsNone(self._call_with(_response('{"rel', stop_reason="max_tokens"))[0])

    def test_bad_json_falls_back(self):
        self.assertIsNone(self._call_with(_response("не JSON"))[0])

    def test_timeout_falls_back(self):
        err = anthropic.APITimeoutError(request=httpx2.Request("POST", "https://api.anthropic.com"))
        self.assertIsNone(self._call_with(err)[0])

    def test_connection_error_falls_back(self):
        err = anthropic.APIConnectionError(request=httpx2.Request("POST", "https://api.anthropic.com"))
        self.assertIsNone(self._call_with(err)[0])


class TestEnabled(unittest.TestCase):
    def test_off_without_key(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            self.assertFalse(ai_llm.enabled())

    def test_on_with_key(self):
        with mock.patch.dict(os.environ, {"ANTHROPIC_API_KEY": "sk-test"}, clear=True):
            self.assertTrue(ai_llm.enabled())

    def test_explicit_off_wins(self):
        with mock.patch.dict(os.environ, {"ANTHROPIC_API_KEY": "sk-test", "AI_LLM_ENABLED": "false"}, clear=True):
            self.assertFalse(ai_llm.enabled())


class TestReviewWithLlm(unittest.TestCase):
    """review_order: вердикты модели встраиваются в проверки, правила о подлоге фото главнее."""

    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite://")
        Base.metadata.create_all(cls.engine)
        cls.Session = sessionmaker(bind=cls.engine, expire_on_commit=False)

    @classmethod
    def tearDownClass(cls):
        cls.engine.dispose()

    def setUp(self):
        self.db = self.Session()
        sec = Section(name=f"Участок {id(self)}")
        self.db.add(sec)
        self.db.flush()
        eq = Equipment(name="Насос ГрАТ-1400", inv_no=f"НС-{id(self)}", section_id=sec.id, type="насос")
        master = Employee(full_name="Мастер Тест", specialty="Мастер", role=Role.master,
                          login=f"m{id(self)}", pin_hash="x")
        fc = FaultCode(code=f"Г-{id(self) % 1000}", category="Г", name="Течь масла", norm_hours=2.0)
        self.db.add_all([eq, master, fc])
        self.db.flush()
        now = datetime.now()
        self.order = WorkOrder(
            number=id(self) % 100000, work_type=WorkType.unplanned, description="Течь масла из-под уплотнения",
            section_id=sec.id, equipment_id=eq.id, master_id=master.id, priority=Priority.normal,
            deadline=now + timedelta(hours=2), status=Status.ai_review, fault_code_id=fc.id,
            work_done="Заменены манжеты уплотнения вала, долито масло, течь устранена",
            created_at=now - timedelta(hours=2), started_at=now - timedelta(hours=1, minutes=40), done_at=now,
        )
        self.db.add(self.order)
        self.db.flush()
        self.db.add_all([
            Photo(order_id=self.order.id, kind="before", file_path="before.jpg", phash="0f0f0f0f0f0f0f0f"),
            Photo(order_id=self.order.id, kind="after", file_path="after.jpg", phash="f0f0f0f0f0f0f0f0"),
        ])
        self.db.flush()
        self.db.refresh(self.order)

    def tearDown(self):
        self.db.rollback()
        self.db.close()

    def _review(self, relevance, photos):
        with mock.patch.object(ai_llm, "enabled", return_value=True), \
             mock.patch.object(ai_llm, "check_relevance", return_value=relevance), \
             mock.patch.object(ai_llm, "compare_photos", return_value=photos):
            return ai_review.review_order(self.db, self.order)

    def test_llm_accepts(self):
        a = self._review(
            {"relevant": True, "confidence": 0.9, "explanation": "Замена манжет устраняет течь.", "missing": []},
            {"same_equipment": True, "problem_fixed": "yes", "quality_issues": [], "score": 5,
             "confidence": 0.9, "explanation": "Течь устранена, узел чистый."},
        )
        self.assertEqual(a.photo_score, 5)
        self.assertFalse(a.needs_master_check)
        self.assertTrue(a.details["engine"].startswith("rules-v1+"))
        messages = " ".join(c["message"] for c in a.details["checks"])
        self.assertIn("Замена манжет устраняет течь", messages)
        self.assertIn("Течь устранена", messages)

    def test_llm_rejects_work_and_photo(self):
        a = self._review(
            {"relevant": False, "confidence": 0.9, "explanation": "Покраска не устраняет течь.",
             "missing": ["замена уплотнения"]},
            {"same_equipment": True, "problem_fixed": "no", "quality_issues": ["не установлен кожух"],
             "score": 2, "confidence": 0.85, "explanation": "Видны следы масла."},
        )
        self.assertEqual(a.photo_score, 2)
        self.assertNotEqual(a.verdict, Verdict.accepted)
        messages = " ".join(c["message"] for c in a.details["checks"])
        self.assertIn("замена уплотнения", messages)
        self.assertIn("не установлен кожух", messages)
        self.assertLess(a.score, 80)

    def test_low_confidence_needs_master(self):
        a = self._review(
            None,
            {"same_equipment": True, "problem_fixed": "unclear", "quality_issues": [], "score": 3,
             "confidence": 0.3, "explanation": "Плохое освещение."},
        )
        self.assertTrue(a.needs_master_check)

    def test_rules_duplicate_photo_beats_llm(self):
        # фото «после» повторяет снимок другого наряда — подлог по правилам, оценка модели не поднимает балл
        other = WorkOrder(number=self.order.number + 1, work_type=WorkType.unplanned, description="x",
                          section_id=self.order.section_id, equipment_id=self.order.equipment_id,
                          master_id=self.order.master_id, priority=Priority.normal,
                          deadline=datetime.now(), status=Status.closed)
        self.db.add(other)
        self.db.flush()
        self.db.add(Photo(order_id=other.id, kind="after", file_path="old.jpg", phash="f0f0f0f0f0f0f0f0"))
        self.db.flush()
        a = self._review(None, {"same_equipment": True, "problem_fixed": "yes", "quality_issues": [],
                                "score": 5, "confidence": 0.95, "explanation": "Всё хорошо."})
        self.assertEqual(a.photo_score, 1)
        self.assertEqual(a.verdict, Verdict.needs_rework)

    def test_llm_unavailable_uses_rules(self):
        a = self._review(None, None)
        self.assertEqual(a.details["engine"], "rules-v1")
        self.assertNotIn("llm", a.details)


if __name__ == "__main__":
    unittest.main()
