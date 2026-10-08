"""Язык серверных текстов ИИ-проверки и уведомлений: русский по умолчанию, казахский по запросу."""
import re
import unittest

from app import i18n
from app.serializers import priority_text, status_text
from app.models import Status
from app.services import ai_review

KZ_LETTERS = re.compile(r"[әіңғүұқөһӘІҢҒҮҰҚӨҺ]")


class LanguageTexts(unittest.TestCase):
    def tearDown(self):
        i18n.set_lang("ru")

    def test_default_is_russian(self):
        i18n.set_lang(None)
        self.assertEqual(i18n.T("Свободен", "Бос"), "Свободен")
        self.assertEqual(status_text(Status.closed), "Закрыт")
        self.assertEqual(ai_review._fmt_minutes(125), "2 ч 5 мин")

    def test_kazakh_texts(self):
        i18n.set_lang("kz")
        self.assertEqual(i18n.T("Свободен", "Бос"), "Бос")
        self.assertEqual(status_text(Status.closed), "Жабылды")
        self.assertEqual(priority_text("emergency"), "Апаттық")
        out = ai_review._fmt_minutes(125)
        self.assertIn("сағ", out)
        self.assertTrue(KZ_LETTERS.search(ai_review.T("Наряд требует доработки.", "Наряд қайта қарауды қажет етеді.")))


if __name__ == "__main__":
    unittest.main()
