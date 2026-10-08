import re
import unittest

from app.i18n import set_lang
from app.services import analytics


class AnalyticsI18nTest(unittest.TestCase):
    def tearDown(self):
        set_lang("ru")

    def test_kz_has_kazakh_letters_ru_unchanged(self):
        from app.i18n import T
        set_lang("kz")
        self.assertTrue(re.search("[әңқөұүһі]", analytics.T("Обслуживание по графику ППР.", "ЖЕЖ кестесі бойынша қызмет көрсету.")))
        set_lang("ru")
        self.assertEqual(T("а", "ә"), "а")


if __name__ == "__main__":
    unittest.main()
