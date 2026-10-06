# Полный контекст кодовой базы проекта «НарядAI»

> **Проект:** «НарядAI» (АО «Костанайские Минералы», Qostanai Industry Hackathon 2026)
> **Стек:** FastAPI, SQLAlchemy, SQLite/PostgreSQL, React 18, TypeScript, Tailwind CSS, Capacitor Android
> **Назначение файла:** Экспорт полного контекста кодовой базы для загрузки в **Google AI Studio** (Gemini 1.5 Pro / 2.0 Flash / Pro).

## 🗂 Структура включенных файлов проекта

- `case_requirements.txt`
- `README.md`
- `backend/app/models.py`
- `backend/app/schemas.py`
- `backend/app/main.py`
- `backend/app/routers/orders.py`
- `backend/app/routers/core.py`
- `backend/app/services/orders.py`
- `backend/app/services/analytics.py`
- `backend/app/services/deadlines.py`
- `backend/app/services/ai_review.py`
- `backend/app/services/reports.py`
- `frontend/src/App.tsx`
- `frontend/src/api.ts`
- `frontend/src/pages/MasterView.tsx`
- `frontend/src/pages/WorkerView.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/utils/offlineQueue.ts`
- `frontend/src/utils/i18n.ts`
- `WINDOWS_GUIDE.md`
- `backend/app/__init__.py`
- `backend/app/auth.py`
- `backend/app/config.py`
- `backend/app/db.py`
- `backend/app/realtime.py`
- `backend/app/routers/__init__.py`
- `backend/app/serializers.py`
- `backend/app/services/__init__.py`
- `backend/app/services/ai_nlp.py`
- `backend/app/services/assistant.py`
- `backend/app/services/events.py`
- `backend/app/services/export.py`
- `backend/app/services/photos.py`
- `backend/app/services/push.py`
- `backend/app/services/workers.py`
- `backend/requirements.txt`
- `backend/seed/__init__.py`
- `backend/seed/generate.py`
- `backend/seed/reference.py`
- `backend/tests/test_exports_nlp.py`
- `backend/tests/test_lifecycle.py`
- `docker-compose.yml`
- `frontend/android/app/src/main/AndroidManifest.xml`
- `frontend/android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml`
- `frontend/android/app/src/main/res/drawable/ic_launcher_background.xml`
- `frontend/android/app/src/main/res/layout/activity_main.xml`
- `frontend/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `frontend/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`
- `frontend/android/app/src/main/res/values/ic_launcher_background.xml`
- `frontend/android/app/src/main/res/values/strings.xml`
- `frontend/android/app/src/main/res/values/styles.xml`
- `frontend/android/app/src/main/res/xml/config.xml`
- `frontend/android/app/src/main/res/xml/file_paths.xml`
- `frontend/android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml`
- `frontend/android/gradlew.bat`
- `frontend/capacitor.config.ts`
- `frontend/index.html`
- `frontend/package.json`
- `frontend/postcss.config.js`
- `frontend/src/components/CloseOrderModal.tsx`
- `frontend/src/components/MasterAssistantModal.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/NewOrderModal.tsx`
- `frontend/src/components/OrderDetailsModal.tsx`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/index.css`
- `frontend/src/main.tsx`
- `frontend/src/pages/ManagerDashboard.tsx`
- `frontend/src/types.ts`
- `frontend/src/utils/useVoice.ts`
- `frontend/tailwind.config.js`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `run.sh`
- `run_windows.bat`
- `run_windows.ps1`
- `scripts/export_for_ai_studio.py`

---

### Файл: `case_requirements.txt`

```text
Республиканский хакатон «Qostanai Industry Hackathon»

Организатор кейса: АО «Костанайские Минералы»

КЕЙС 1
«НарядAI»: интеллектуальная система выдачи и контроля нарядов»

Demo Day: 16 октября 2026 года
(город Костанай, проспект Абая, 28/1)

г. Костанай

1. Общие сведения
Команде нужно за время хакатона создать работающий прототип «НарядAI» — мобильно-веб
системы, в которой мастер смены выдаёт наряды с телефона, исполнители получают и закрывают
их на своих телефонах, а ИИ следит за сроками, проверяет качество выполнения и находит
проблемные участки и оборудование.
Параметр
Значение
Название кейса
«НарядAI» — интеллектуальная система
выдачи и контроля нарядов
Слоган
«Наряд выдан — ИИ на контроле»
Заказчик
АО «Костанайские минералы»
Мероприятие
QOSTANAI AI INDUSTRY HACKATHON
2026
Тип решения
Мобильное приложение / PWA для
сотрудников + веб-панель мастера + ИИмодуль
Результат
Рабочий прототип (MVP), презентация, живое
демо по сценарию из раздела 11

2. Проблема и цель
Сегодня наряды выдаются устно, по рации или на бумаге, поэтому мастер не видит в реальном
времени, кто свободен, что выполняется и что просрочено, а история поломок не анализируется.
Типичные проблемы:
• наряды теряются или выполняются не в том порядке, срочные работы ждут;
• мастер тратит время на поиск свободного исполнителя;
• нет подтверждения выполнения (фото, перечень работ, списанные материалы);
• простои оборудования и их причины не считаются;
• повторяющиеся поломки на одном участке не замечают, пока они не становятся аварией;
• нет объективной оценки работы исполнителей и бригад.
Цель: перевести весь цикл наряда в цифровой вид и поручить ИИ контроль сроков, проверку
качества и поиск закономерностей.
Ожидаемый эффект для предприятия: меньше простоев оборудования, быстрее реакция на
аварии, прозрачная загрузка персонала, объективный рейтинг исполнителей, данные для
планирования ремонтов.

3. Пользователи и роли
В системе четыре роли; для хакатона обязательны первые две.
Роль
Устройство
Мастер смены
Телефон + веб-панель

Исполнитель (слесарь,
электрик, сварщик и т.д.)

Телефон

Руководитель (начальник
участка / главный механик)

Веб-панель

Администратор

Веб-панель

Что делает
Создаёт и выдаёт наряды,
видит статусы людей и
нарядов, получает
уведомления и отчёты ИИ,
принимает выполненные
наряды
Получает наряды, меняет
статусы, прикладывает фото,
комментарии, шифры
неисправностей и материалы
Смотрит аналитику, рейтинги,
простои, аномалии за любой
период
Ведёт справочники: участки,
оборудование, сотрудники,
бригады, шифры
неисправностей, материалы

4. Жизненный цикл наряда
Наряд проходит путь от выдачи до закрытия, и каждый переход фиксируется со временем и
автором.

жизненный цикл наряда · 10 статусов
Закрывает наряд мастер после проверки ИИ; при вердикте «требует доработки» наряд
возвращается исполнителю в работу.

5. Функциональные требования
Ниже — что должен уметь каждый пользователь; пункты с пометкой (MVP) обязательны на
защите.

5.1. Создание и выдача наряда (мастер смены)
Карточка наряда содержит поля:
Поле
Как заполняется
Обязательно
Номер, дата и время выдачи
Автоматически
Да
Тип работ
Плановый / внеплановый
Да
(аварийный)
Описание проблемы и работ
Текст или голос (ИИ
Да
превращает голос в текст)
Участок
Выбор из справочника
Да
Оборудование
Выбор из справочника,
Да
отфильтрованного по участку
Исполнитель или бригада
Выбор из списка со статусом
Да
«свободен / занят»
Срок исполнения
Дата и время или норматив в
Да
часах
Приоритет
«Аварийный — срочно в
Да
работу», «Высокий»,
«Обычный — в порядке
очереди», «Плановый»
Фото неисправности
Камера телефона или галерея, Нет
до 5 фото
Комментарий
Свободный текст с
Нет
подробностями
Требования:
1. Мастер создаёт и выдаёт наряд с телефона за 1 минуту и не более чем за 6 нажатий (MVP).
2. При выборе исполнителя виден его текущий статус: свободен, выполняет наряд №…, в
очереди N нарядов, не на смене (MVP).
3. ИИ-подсказка: система предлагает наиболее подходящего исполнителя — свободного,
нужной специальности, с лучшим рейтингом по этому типу оборудования (желательно).
4. ИИ-подсказка: по описанию проблемы система предлагает шифр неисправности и
норматив времени (бонус).

5. Мастер может переназначить, отменить или изменить приоритет наряда; всё фиксируется в
истории.

5.2. Панель мастера: статусы в реальном времени
1. Список исполнителей смены с цветовым статусом: зелёный — свободен, жёлтый — в
работе, синий — есть очередь, серый — не на смене (MVP).
2. Доска нарядов по статусам (канбан): выданные, принятые, в работе, в очереди,
выполненные, просроченные (MVP).
3. Фильтры по участку, оборудованию, исполнителю, приоритету.
4. Счётчики смены: выдано, выполнено, просрочено, оборудование в простое.

5.3. Мобильное приложение исполнителя
1. Push-уведомление о новом наряде со звуком; аварийные наряды выделены красным и
требуют ответа (MVP).
2. Кнопки действий по наряду (MVP):
o «Принять в работу»;
o «Поставить в очередь» — наряд встаёт за текущими;
o «Отклонить» — обязательно с причиной (нет материалов, нет допуска, занят
аварийным и т.д.);
o «Начать исполнение» — фиксируется время начала;
o «Приостановить» — с причиной (ждёт запчасти, ждёт остановки оборудования);
o «Исполнено» — открывает форму закрытия.
3. Форма закрытия наряда (MVP):
o выполненные работы (текст или голос);
o шифр неисправности из справочника;
o списанные материалы и запчасти с количеством из справочника;
o фото «после» — обязательно для внеплановых работ;
o комментарий.
4. Исполнитель видит свою очередь нарядов, их сроки и свою оценку по каждому закрытому
наряду.
5. Работа при плохой связи: действия сохраняются на телефоне и отправляются при
появлении сети (желательно).

5.4. Справочники
Участки; оборудование с привязкой к участку; сотрудники со специальностью, разрядом и
бригадой; шифры неисправностей (например, М — механические, Э — электрические, Г —
гидравлика, П — пневматика, С — смазка); материалы и запчасти с единицами измерения;
нормативы времени на типовые работы. Для хакатона справочники заполняются тестовыми
данными (раздел 8).

5.5. История и журнал
Каждое действие по наряду записывается: кто, что, когда. По оборудованию доступна полная
история нарядов, ремонтов и простоев.

6. ИИ-модули
ИИ в системе работает как «цифровой контролёр смены»: шесть модулей следят за сроками,
проверяют выполнение, сравнивают фото, пишут отчёты, ищут аномалии и считают рейтинг.

6.1. ИИ-контроль сроков (MVP)
1. Система постоянно отслеживает срок каждого наряда.
2. За 30 минут до срока (порог настраивается) — напоминание исполнителю.
3. При просрочке — сообщение исполнителю и мастеру, выдавшему наряд: номер,
оборудование, участок, исполнитель, статус, на сколько просрочен, последний
комментарий.
4. Если наряд не принят за 10 минут (аварийный — за 3 минуты) — эскалация мастеру с
предложением другого свободного исполнителя.
5. Повторные напоминания через заданный интервал; при длительной просрочке —
уведомление руководителю (желательно).
Пример сообщения: «Наряд №147 просрочен на 45 мин. Дробилка КМД-1750, участок дробления.
Исполнитель: Ахметов Е. Статус: в работе с 09:20. Последний комментарий: “ждём подшипник со
склада”».

6.2. ИИ-проверка выполнения (MVP)
После нажатия «Исполнено» ИИ проверяет наряд и выносит вердикт: принято, принято с
замечаниями или требует доработки.
Что проверяется
Как
Полнота закрытия
Заполнены ли работы, шифр, материалы, фото
«после»
Соответствие работ проблеме
Языковая модель сравнивает описание
проблемы и описание выполненных работ
Логичность материалов
Соответствуют ли списанные материалы типу
работ и шифру; нет ли завышения против
обычного расхода
Время
Фактическое время против норматива и срока
Качество по фото
Модуль 6.3

6.3. ИИ-анализ фото «до» и «после» (MVP — базово, полное — желательно)
1. Проверка, что фото есть, сделано в момент закрытия наряда и не повторяет старое фото (по
метаданным и сравнению изображений).
2. Если было фото неисправности при выдаче — мультимодальная модель сравнивает «до» и
«после»: устранена ли видимая проблема (течь, обрыв, разрушение, загрязнение), то ли это
оборудование.
3. Оценка видимого качества: аккуратность, наличие мусора, незакреплённые элементы,
отсутствие защитных кожухов.
4. Результат — оценка от 1 до 5 и короткое пояснение. При низкой уверенности ИИ помечает
«нужна проверка мастером», а не выносит вердикт сам.

6.4. Отчёт по каждому наряду (MVP)
•
•

Исполнителю: оценка (1–5 или 0–100 баллов), что сделано хорошо, что улучшить, время
выполнения против норматива.
Мастеру: вся информация по наряду, хронология статусов, работы, материалы, фото
до/после, вердикт ИИ и его пояснение, простой оборудования по наряду. Мастер может
согласиться с оценкой ИИ или изменить её — финальное решение за человеком.

6.5. ИИ-аналитика истории и поиск аномалий (желательно, сильный плюс)
ИИ анализирует историю плановых и внеплановых нарядов и находит:
• оборудование и участки с частыми поломками и большим простоем («топ проблемных»);
• повторяющиеся неисправности одного шифра на одном оборудовании — признак, что
ремонт не устраняет причину;
• поломки, возникающие вскоре после планового ремонта, — сигнал о качестве ППР;
• связь поломок со сменой, временем суток, исполнителем, бригадой;
• аномальный расход материалов;
• рост числа внеплановых нарядов по оборудованию — прогноз вероятного отказа (бонус).
Мастер получает выводы по запросу («покажи проблемы участка дробления за месяц») и в
еженедельной сводке. Каждый вывод сформулирован простым языком и содержит рекомендацию,
например: «Конвейер К-3: 7 внеплановых остановок за 30 дней, 5 из них — шифр М-02
(подшипник). Рекомендуем проверить соосность привода и включить в план ППР».

6.6. Рейтинг и оценка качества (MVP — рейтинг исполнителей)
Рейтинг исполнителей и бригад считается за смену и любой период по формуле, понятной
сотрудникам:
• средняя оценка ИИ/мастера за качество;
• доля нарядов, выполненных в срок;
• доля нарядов, вернувшихся на доработку или с повторной поломкой в течение 7 дней;
• количество и сложность закрытых нарядов;
• отказы от нарядов без уважительной причины.
Команда сама предлагает веса и обосновывает их на защите. ИИ поясняет каждому исполнителю,
из чего сложился его рейтинг.

6.7. ИИ-ассистент мастера (бонус)
Чат или голосовой помощник: «Кто сейчас свободен из электриков?», «Что просрочено на
смене?», «Сформируй отчёт за неделю по участку обогащения».

7. Отчёты и аналитика
Все отчёты строятся за смену, сутки, неделю, месяц или произвольный период, с фильтром по
участку, оборудованию, исполнителю, бригаде, и выгружаются в PDF или Excel.
Отчёт
Что показывает
Приоритет
По наряду
Полная карточка, хронология, MVP
работы, материалы, фото,
оценка ИИ
За смену
Выдано / выполнено /
MVP
просрочено / отклонено,
загрузка людей, простои,
итоговая сводка ИИ текстом
Рейтинг исполнителей и
Таблица и график с баллами и MVP
бригад
их составляющими
Списанные материалы
Количество по материалам,
Желательно
участкам, оборудованию,
исполнителям; отклонения от
нормы
Простои оборудования
Время простоя по каждой
Желательно
единице, причины по шифрам,
доля плановых и внеплановых
Аномалии и зависимости
Топ проблемного
Желательно
оборудования и участков,
повторные отказы, выводы и
рекомендации ИИ
Дашборд руководителя (желательно): ключевые показатели на одном экране — наряды в работе,
просрочки, среднее время реакции и выполнения, простой оборудования, топ-5 проблемного
оборудования, лучшие исполнители.

8. Данные
Система строится вокруг восьми сущностей; для демонстрации аналитики команда генерирует
историю минимум за 3 месяца.
Сущность
Основные поля
Участок
id, название (дробление, обогащение,
ремонтно-механический цех и т.д.)
Оборудование
id, название, инвентарный номер, участок, тип,
критичность
Сотрудник
id, ФИО, специальность, разряд, бригада, роль,
смена, текущий статус
Наряд
id, номер, тип, описание, участок,
оборудование, исполнитель, мастер,
приоритет, срок, статус, времена всех
переходов
Событие наряда
id наряда, кто, действие, время, комментарий,
причина
Фото
id наряда, тип «до / после», файл, время
съёмки, автор
Списание материала
id наряда, материал, количество, единица
Оценка ИИ
id наряда, вердикт, балл, пояснение, оценка
мастера (если изменена)
Справочники: шифры неисправностей, материалы, нормативы времени.
Тестовый набор (минимум): 4 участка, 25 единиц оборудования, 2 мастера, 15 исполнителей в 3
бригадах, 20 шифров неисправностей, 40 позиций материалов, 500+ нарядов за 3 месяца. В
историю нужно специально заложить 3–4 закономерности (например, один конвейер ломается в 3
раза чаще остальных, один исполнитель часто получает повторные отказы), чтобы на защите
показать, что ИИ их находит.
Если заказчик предоставит обезличенные реальные данные — используются они.

9. Технические требования
Стек команда выбирает сама; ниже — требования к результату и рекомендуемые варианты.
Обязательные требования:
1. Работает на телефоне (Android обязательно, iOS желательно): нативное приложение, Flutter
/ React Native или PWA.
2. Push-уведомления на телефон (Firebase Cloud Messaging, Telegram-бот или аналог).
3. Обновление статусов в реальном времени — не дольше 5 секунд (WebSocket или аналог).
4. Интерфейс на русском языке, казахский — плюс; крупные кнопки, удобные в рабочих
перчатках.
5. Вход по логину / ПИН-коду; каждая роль видит только свои функции.
6. Хранение фото со сжатием; загрузка фото не дольше 10 секунд при мобильной сети.
7. Исходный код в репозитории с инструкцией запуска.
Рекомендуемый стек:
Слой
Варианты
Мобильный клиент
Flutter, React Native, PWA
Веб-панель
React, Vue
Сервер
Python (FastAPI, Django), Node.js
База данных
PostgreSQL
ИИ — тексты, отчёты, ассистент
LLM через API (например, Claude) или
локальная открытая модель
ИИ — фото
Мультимодальная LLM, сравнение
изображений (OpenCV, SSIM, эмбеддинги)
ИИ — аномалии
Статистика и ML: pandas, scikit-learn (Isolation
Forest, кластеризация), правила
Безопасность и надёжность: персональные данные сотрудников не передаются во внешние
сервисы без обезличивания; решения ИИ — рекомендация, финальное слово за мастером;
архитектура позволяет в будущем интеграцию с 1С / ERP / системой ТОиР предприятия.

10. Объём работ на хакатоне
Команда, сделавшая весь блок «Обязательно», выполнила кейс; «Желательно» и «Бонус» дают
дополнительные баллы.
Уровень
Что входит
Обязательно (MVP)
Выдача наряда мастером с телефона со всеми
полями и фото; статусы исполнителей в
реальном времени; приложение исполнителя
со всеми кнопками статусов, фото,
комментариями, шифрами и материалами;
push-уведомления; ИИ-контроль просрочек с
сообщениями исполнителю и мастеру; ИИпроверка закрытого наряда и отчёт с оценкой
исполнителю и мастеру; отчёт за смену;
рейтинг исполнителей
Желательно
Сравнение фото «до/после» мультимодальной
моделью; отчёты по материалам и простоям;
поиск аномалий и зависимостей с текстовыми
выводами; ИИ-подбор исполнителя; дашборд
руководителя; работа без сети; выгрузка в PDF
/ Excel
Бонус
Голосовой ввод наряда и закрытия; ИИассистент мастера в чате; прогноз отказов
оборудования; QR-код на оборудовании для
быстрого выбора; казахский язык интерфейса

11. Демо-сценарий защиты
На защите команда показывает вживую на двух-трёх телефонах (мастер и исполнители) один
сквозной сценарий, около 7 минут:
1. Мастер видит панель смены: кто свободен, кто занят, какие наряды в работе.

2. Мастер фотографирует течь масла на насосе, создаёт аварийный наряд и выдаёт
свободному слесарю (ИИ подсказал кандидата).
3. На телефон исполнителя приходит push; он нажимает «Принять» → «Начать исполнение»;
статус у мастера меняется сразу.
4. Второй наряд с коротким сроком исполнитель ставит в очередь — срок истекает, ИИ
отправляет сообщение о просрочке исполнителю и мастеру.
5. Исполнитель закрывает первый наряд: работы, шифр, материалы, фото «после».
6. ИИ проверяет наряд, сравнивает фото, выставляет оценку — исполнитель получает свой
отчёт, мастер — полный.
7. Третий наряд закрывается без фото и с лишними материалами — ИИ ставит «требует
доработки» и объясняет почему.
8. Отчёт за смену и рейтинг исполнителей.
9. Аналитика на истории за 3 месяца: ИИ показывает заложенные закономерности и даёт
рекомендации.

12. Критерии оценки и состав сдачи
Решения оцениваются по 100-балльной шкале; больше всего весят работоспособность и качество
ИИ.
Критерий
Баллы
Работоспособность MVP: весь цикл наряда
25
работает на телефонах вживую
Качество ИИ: контроль сроков, проверка
25
выполнения, анализ фото, точность выводов
Аналитика: отчёты, рейтинг, найденные
15
аномалии и рекомендации
Удобство для мастера и рабочего: скорость,
15
простота, крупные элементы
Применимость на предприятии: безопасность
10
данных, масштабируемость, интеграция
Презентация и демо
10
Команда сдаёт:
• ☐ ссылку на репозиторий с кодом и инструкцией запуска;
• ☐ установочный файл приложения (APK) или ссылку на PWA;
• ☐ ссылку на веб-панель и тестовые учётные записи (мастер, исполнитель, руководитель);
• ☐ тестовый набор данных;
• ☐ презентацию до 10 слайдов: проблема, решение, архитектура, ИИ-модули, эффект для
предприятия, план внедрения;
• ☐ видеозапись демо до 3 минут (на случай проблем со связью на защите).


```

---

### Файл: `README.md`

```markdown
# «НарядAI»: Интеллектуальная система выдачи и контроля нарядов

> **Организатор кейса:** АО «Костанайские Минералы»  
> **Мероприятие:** Республиканский хакатон «Qostanai Industry Hackathon 2026»  
> **Слоган:** *«Наряд выдан — ИИ на контроле»*

---

## 📌 О проекте

«НарядAI» переводит весь цикл выдачи, исполнения и контроля ремонтно-технических нарядов предприятия в цифровой вид:
- **Мастер смены** выдаёт наряд со смартфона за ≤ 1 минуту и ≤ 6 нажатий с ИИ-подсказкой исполнителя.
- **Исполнители (слесари, электрики, сварщики)** получают push-уведомления со звуком, управляют статусами кнопками, адаптированными под рабочие перчатки, прикладывают фото и списывают материалы.
- **ИИ-контролёр:**
  1. Постоянно отслеживает дедлайны (напоминание за 30 мин, эскалация не принятых нарядов за 3/10 мин, уведомления о просрочке обоим).
  2. Проверяет качество закрытия наряда (соответствие работ, фото «до/после», сравнение списанных ТМЦ с нормами расхода).
  3. Формирует понятный объективный рейтинг рабочих по 5 взвешенным факторам.
  4. Анализирует историю за 3 месяца и выявляет «узкие места» и аномалии (Конвейер К-3, поломки после ППР, ночные смены).

---

## 🚀 Быстрый запуск

### Вариант 1: Запуск одной командой
```bash
./run.sh
```
После запуска откройте в браузере: **[http://localhost:8000](http://localhost:8000)** (веб-панель + мобильный PWA).  
Документация API (Swagger): **[http://localhost:8000/docs](http://localhost:8000/docs)**.

### Вариант 2: Запуск в Docker Compose
```bash
docker compose up --build
```

### Вариант 3: Режим разработки (Hot Reload)
```bash
# Терминал 1 (Бэкенд):
cd backend
.venv/bin/uvicorn app.main:app --reload --port 8000

# Терминал 2 (Фронтенд):
cd frontend
npm run dev
# Открыть http://localhost:3000
```

---

## 📱 Мобильный доступ и приложение для Android (APK)

- **Прямой доступ с телефона (браузер / PWA):**
  Откройте в мобильном браузере: **`http://192.168.3.190:8000`** (при подключении к Wi-Fi сети).  
  Интерфейс адаптирован под сенсорный ввод в перчатках (кнопки ≥ 48px).
- **Готовый APK для установки:**
  - Файл на сервере: `http://192.168.3.190:8000/media/naryad-ai.apk`
  - Локальный путь: `/home/tamirlan/Проекты/naryad-ai/naryad-ai.apk` (4.0 МБ)
  - Ссылка на скачивание доступна прямо на странице входа в систему.

---

## 👥 Демо-учётные записи (ПИН у всех: `1234`)

| Роль | Логин | ФИО | Описание в демо |
|---|---|---|---|
| **Мастер смены** | `master1` | Исмаилов Марат Кайратович | Создаёт наряды, видит доску смены, подтверждает закрытие |
| **Исполнитель** | `ahmetov` | Ахметов Ерлан Серикович | Слесарь 5 разряда, **свободен** (ИИ рекомендует его) |
| **Исполнитель** | `serikov` | Сериков Данияр Канатович | Слесарь 4 разряда, наряд в работе (высокий процент повторов) |
| **Исполнитель** | `kovalev` | Ковалёв Игорь Петрович | Слесарь 4 разряда (систематический перерасход материалов) |
| **Главный механик** | `boss` | Сагинтаев Болат Амангельдиевич | Дашборд руководителя, аналитика аномалий за 3 месяца |

*В интерфейсе в правом верхнем углу доступна кнопка быстрого переключения демо-ролей в 1 клик.*

---

## 🎯 Сквозной сценарий защиты (7 минут, 9 шагов)

1. **Панель смены:** Мастер открывает панель смены — видит свободного слесаря Ахметова (🟢) и занятого Серикова (🟡).
2. **Выдача аварийного наряда:** Мастер фотографирует течь масла на насосе ГрАТ-1400 №1, создаёт аварийный наряд в 4 тапа. ИИ сразу предлагает Ахметова с обоснованием («свободен, слесарь, рейтинг 92»).
3. **Реакция исполнителя в реальном времени:** В окне/телефоне Ахметова раздаётся звуковой сигнал. Ахметов жмёт «Принять» → «Начать исполнение». У мастера статус меняется мгновенно (≤ 1 сек через WebSocket).
4. **Очередь и контроль сроков:** Выдаётся наряд с коротким дедлайном. Исполнитель ставит его в очередь. При наступлении срока ИИ отправляет уведомление о просрочке обоим.
5. **Закрытие первого наряда:** Ахметов завершает ремонт, указывает шифр `Г-01`, списывает 2 манжеты и 10 л масла, прикладывает фото «после» и жмёт «Отправить на проверку ИИ».
6. **Оценка ИИ:** ИИ сравнивает фото до/после, проверяет расход по технологической карте и ставит **92/100 (Принято)**. Мастер видит отчёт и подтверждает закрытие.
7. **Проверка нарушений ИИ:** Закрывается наряд без фото и с завышением расхода масла в 4 раза → ИИ ставит вердикт **«Требует доработки»** с детальным штрафом и возвращает в работу.
8. **Отчёт за смену и рейтинг:** Демонстрация таблицы с прозрачным расчётом баллов рабочих и бригад.
9. **ИИ-Аналитика за 3 месяца:** Переход в раздел аномалий — ИИ показывает:
   - Конвейер К-3 (ломается в 3.2 раза чаще нормы, 70% отказов — подшипник М-02).
   - Дробилка КМД-1750 (поломки через 2–5 дней после ППР).
   - Повторные отказы Серикова и перерасход материалов Ковалёва.

---

## 🧪 Запуск автоматических тестов

```bash
cd backend
.venv/bin/python -m unittest discover -s tests -p "test_*.py"
```
Тестовый набор валидирует:
- Все 10 статусов жизненного цикла (`test_lifecycle.py`);
- Очередь нарядов и переходы исполнителей;
- Срабатывание штрафов ИИ при незаполненных фото и завышенных материалах;
- Экспорт сменного рапорта, рейтинга рабочих и отчёта по ТМЦ в формат Excel (`test_exports_nlp.py`);
- Формирование официальной печатной формы наряда с ИИ-заключением;
- Автономный ИИ NLP-модуль подсказки шифров дефектов и семантической валидации.

---

## 🌟 Дополнительные возможности и преимущества MVP

1. **Строго автономная архитектура (Zero-Cost / On-Premise):**
   - Никаких внешних платных LLM API (OpenAI/Anthropic). Вся логика базируется на онтологии горнорудного оборудования, правилах АО «Костанайские Минералы», морфологическом стемминге и статистических моделях.
2. **Экспорт в Excel и печать в PDF:**
   - Полная поддержка ГОСТ/официальных форм наряда-допуска АО «Костанайские Минералы» с QR-кодами и блоками подписей.
   - Скачивание детальных отчётов в `.xlsx` со стилизованными шапками и автоподбором ширины столбцов.
3. **Раздел 7 кейса — Контроль списания ТМЦ:**
   - Автоматическое выявление перерасходов материалов свыше 40% от технологических норм.
4. **Голосовой ввод (Web Speech API):**
   - Диктовка неисправности мастером и отчёта рабочим прямо в цеху без снятия перчаток.
5. **Двуязычный интерфейс (RU / KZ):**
   - Мгновенное переключение языка интерфейса (русский / казахский) в один клик.
6. **Офлайн-индикатор и звуковой тестер:**
   - Наглядная индикация статуса сетевого подключения и переключатель звуковых сигналов с кнопкой проверки.
```

---

### Файл: `backend/app/models.py`

```python
"""Модель данных «НарядAI» — 8 сущностей кейса (раздел 8) + справочники."""
from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def now() -> datetime:
    return datetime.now()


# ---------------------------------------------------------------- перечисления

class Role(str, enum.Enum):
    master = "master"      # мастер смены
    worker = "worker"      # исполнитель
    manager = "manager"    # руководитель
    admin = "admin"        # администратор


class WorkType(str, enum.Enum):
    planned = "planned"        # плановый
    unplanned = "unplanned"    # внеплановый (аварийный)


class Priority(str, enum.Enum):
    emergency = "emergency"    # Аварийный — срочно в работу
    high = "high"              # Высокий
    normal = "normal"          # Обычный — в порядке очереди
    planned = "planned"        # Плановый


PRIORITY_ORDER = {Priority.emergency: 0, Priority.high: 1, Priority.normal: 2, Priority.planned: 3}


class Status(str, enum.Enum):
    """10 статусов жизненного цикла наряда (раздел 4) + «отменён» мастером."""
    issued = "issued"            # Выдан
    queued = "queued"            # В очереди
    accepted = "accepted"        # Принят в работу
    rejected = "rejected"        # Отклонён
    in_progress = "in_progress"  # В работе
    paused = "paused"            # Приостановлен
    done = "done"                # Исполнено
    ai_review = "ai_review"      # Проверка ИИ
    rework = "rework"            # На доработке
    closed = "closed"            # Закрыт
    cancelled = "cancelled"      # Отменён мастером


ACTIVE_STATUSES = {
    Status.issued, Status.queued, Status.accepted, Status.in_progress,
    Status.paused, Status.rework,
}


class Verdict(str, enum.Enum):
    accepted = "accepted"                    # принято
    accepted_with_remarks = "accepted_with_remarks"  # принято с замечаниями
    needs_rework = "needs_rework"            # требует доработки


class PhotoKind(str, enum.Enum):
    before = "before"
    after = "after"


# ---------------------------------------------------------------- справочники

class Section(Base):
    __tablename__ = "sections"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)

    equipment: Mapped[list[Equipment]] = relationship(back_populates="section")


class Equipment(Base):
    __tablename__ = "equipment"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    inv_no: Mapped[str] = mapped_column(String(40), unique=True)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    type: Mapped[str] = mapped_column(String(60))           # конвейер, дробилка, насос…
    criticality: Mapped[int] = mapped_column(Integer, default=2)  # 1 — высокая, 3 — низкая
    qr_code: Mapped[str | None] = mapped_column(String(80), nullable=True)

    section: Mapped[Section] = relationship(back_populates="equipment")


class Brigade(Base):
    __tablename__ = "brigades"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)


class Employee(Base):
    __tablename__ = "employees"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160))
    specialty: Mapped[str] = mapped_column(String(60))      # слесарь, электрик, сварщик…
    grade: Mapped[int] = mapped_column(Integer, default=4)  # разряд
    brigade_id: Mapped[int | None] = mapped_column(ForeignKey("brigades.id"), nullable=True)
    role: Mapped[Role] = mapped_column(String(20))
    shift: Mapped[str] = mapped_column(String(10), default="day")  # day / night
    on_shift: Mapped[bool] = mapped_column(Boolean, default=True)
    login: Mapped[str] = mapped_column(String(40), unique=True)
    pin_hash: Mapped[str] = mapped_column(String(200))
    push_token: Mapped[str | None] = mapped_column(String(300), nullable=True)
    telegram_chat_id: Mapped[str | None] = mapped_column(String(40), nullable=True)

    brigade: Mapped[Brigade | None] = relationship()


class FaultCode(Base):
    """Шифры неисправностей: М — механ., Э — электр., Г — гидравл., П — пневм., С — смазка."""
    __tablename__ = "fault_codes"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(10), unique=True)   # «М-02»
    category: Mapped[str] = mapped_column(String(2))              # «М»
    name: Mapped[str] = mapped_column(String(160))
    norm_hours: Mapped[float] = mapped_column(Float, default=2.0)  # норматив времени


class Material(Base):
    __tablename__ = "materials"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    unit: Mapped[str] = mapped_column(String(20))   # шт, кг, л, м


class MaterialNorm(Base):
    """Обычный расход материала на один ремонт по шифру — для проверки «завышения»."""
    __tablename__ = "material_norms"
    __table_args__ = (UniqueConstraint("fault_code_id", "material_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    fault_code_id: Mapped[int] = mapped_column(ForeignKey("fault_codes.id"))
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"))
    typical_qty: Mapped[float] = mapped_column(Float)

    material: Mapped[Material] = relationship()


# ---------------------------------------------------------------- наряды

class WorkOrder(Base):
    __tablename__ = "work_orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    work_type: Mapped[WorkType] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    equipment_id: Mapped[int] = mapped_column(ForeignKey("equipment.id"), index=True)
    assignee_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), index=True, nullable=True)
    brigade_id: Mapped[int | None] = mapped_column(ForeignKey("brigades.id"), nullable=True)
    master_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))
    priority: Mapped[Priority] = mapped_column(String(20))
    deadline: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[Status] = mapped_column(String(20), index=True, default=Status.issued)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    # форма закрытия
    work_done: Mapped[str | None] = mapped_column(Text, nullable=True)
    fault_code_id: Mapped[int | None] = mapped_column(ForeignKey("fault_codes.id"), nullable=True)
    close_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    # времена переходов
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now, index=True)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    done_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    queued_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    paused_minutes: Mapped[float] = mapped_column(Float, default=0)   # накопленное время на паузе
    paused_since: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # служебные флаги контроля сроков (чтобы не спамить)
    reminded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    overdue_notified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    escalated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    manager_notified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    section: Mapped[Section] = relationship()
    equipment: Mapped[Equipment] = relationship()
    assignee: Mapped[Employee | None] = relationship(foreign_keys=[assignee_id])
    master: Mapped[Employee] = relationship(foreign_keys=[master_id])
    brigade: Mapped[Brigade | None] = relationship()
    fault_code: Mapped[FaultCode | None] = relationship()
    events: Mapped[list[WorkOrderEvent]] = relationship(
        back_populates="order", order_by="WorkOrderEvent.created_at", cascade="all, delete-orphan"
    )
    photos: Mapped[list[Photo]] = relationship(back_populates="order", cascade="all, delete-orphan")
    materials: Mapped[list[MaterialWriteOff]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    assessments: Mapped[list[AIAssessment]] = relationship(
        back_populates="order", order_by="AIAssessment.created_at", cascade="all, delete-orphan"
    )

    @property
    def assessment(self) -> AIAssessment | None:
        return self.assessments[-1] if self.assessments else None


class WorkOrderEvent(Base):
    """Журнал: кто, что, когда (раздел 5.5)."""
    __tablename__ = "work_order_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), index=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)  # None = ИИ/система
    action: Mapped[str] = mapped_column(String(40))
    from_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    to_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    order: Mapped[WorkOrder] = relationship(back_populates="events")
    actor: Mapped[Employee | None] = relationship()


class Photo(Base):
    __tablename__ = "photos"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), index=True)
    kind: Mapped[PhotoKind] = mapped_column(String(10))
    file_path: Mapped[str] = mapped_column(String(300))
    taken_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # из EXIF
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    author_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)
    phash: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)

    order: Mapped[WorkOrder] = relationship(back_populates="photos")


class MaterialWriteOff(Base):
    __tablename__ = "material_writeoffs"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), index=True)
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"))
    qty: Mapped[float] = mapped_column(Float)

    order: Mapped[WorkOrder] = relationship(back_populates="materials")
    material: Mapped[Material] = relationship()


class AIAssessment(Base):
    __tablename__ = "ai_assessments"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), index=True)
    verdict: Mapped[Verdict] = mapped_column(String(30))
    score: Mapped[int] = mapped_column(Integer)              # 0–100
    photo_score: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1–5
    explanation: Mapped[str] = mapped_column(Text)
    worker_report: Mapped[str | None] = mapped_column(Text, nullable=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)  # результаты отдельных проверок
    needs_master_check: Mapped[bool] = mapped_column(Boolean, default=False)
    master_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    master_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    order: Mapped[WorkOrder] = relationship(back_populates="assessments")

    @property
    def final_score(self) -> int:
        return self.master_score if self.master_score is not None else self.score


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey("work_orders.id"), nullable=True)
    kind: Mapped[str] = mapped_column(String(30))  # new_order, reminder, overdue, escalation, ai_result…
    title: Mapped[str] = mapped_column(String(200))
    text: Mapped[str] = mapped_column(Text)
    urgent: Mapped[bool] = mapped_column(Boolean, default=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now, index=True)
```

---

### Файл: `backend/app/schemas.py`

```python
"""Входные схемы API (pydantic)."""
from datetime import datetime

from pydantic import BaseModel, Field

from .models import Priority, WorkType


class LoginIn(BaseModel):
    login: str
    pin: str


class OrderCreate(BaseModel):
    work_type: WorkType = WorkType.unplanned
    description: str = Field(min_length=3)
    equipment_id: int
    assignee_id: int | None = None
    brigade_id: int | None = None
    priority: Priority = Priority.normal
    deadline: datetime | None = None
    norm_hours: float | None = Field(default=None, gt=0, description="Срок как норматив в часах")
    comment: str | None = None


class MaterialItem(BaseModel):
    material_id: int
    qty: float = Field(gt=0)


class ClosingForm(BaseModel):
    work_done: str = ""
    fault_code_id: int | None = None
    materials: list[MaterialItem] = []
    comment: str | None = None


class ActionIn(BaseModel):
    action: str
    reason: str | None = None
    comment: str | None = None
    closing: ClosingForm | None = None


class ReassignIn(BaseModel):
    assignee_id: int
    comment: str | None = None


class PriorityIn(BaseModel):
    priority: Priority
    deadline: datetime | None = None


class MasterScoreIn(BaseModel):
    score: int = Field(ge=0, le=100)
    comment: str | None = None


class SuggestIn(BaseModel):
    equipment_id: int
    description: str = ""


class OnShiftIn(BaseModel):
    on_shift: bool


class PushTokenIn(BaseModel):
    push_token: str | None = None
    telegram_chat_id: str | None = None


class SuggestFaultCodeIn(BaseModel):
    description: str


class AssistantIn(BaseModel):
    query: str

```

---

### Файл: `backend/app/main.py`

```python
"""Точка входа FastAPI: «НарядAI — Наряд выдан, ИИ на контроле»."""
import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .auth import decode_token
from .config import BASE_DIR, CORS_ORIGINS, MEDIA_DIR
from .db import Base, engine
from .realtime import manager
from .routers import core, orders
from .services import events  # noqa: F401 — регистрирует обработчики after_commit
from .services.deadlines import deadline_loop

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    try:
        from sqlalchemy import func, select
        from .db import SessionLocal
        from .models import Employee
        with SessionLocal() as db:
            if db.scalar(select(func.count(Employee.id))) == 0:
                logging.getLogger("uvicorn").info("База данных пуста. Запуск генерации демонстрационных данных (92 дня)...")
                from ..seed.generate import generate
                generate(days=92, seed=42)
    except Exception as exc:
        logging.getLogger("uvicorn").warning("Авто-посев данных пропущен: %s", exc)

    task = asyncio.create_task(deadline_loop())
    yield
    task.cancel()


app = FastAPI(title="НарядAI", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.include_router(core.router)
app.include_router(orders.router)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")


@app.get("/api/health")
def health():
    return {"status": "ok", "online": len(manager.online_user_ids)}


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket, token: str):
    user_id = decode_token(token)
    if not user_id:
        await ws.close(code=4401)
        return
    await manager.connect(user_id, ws)
    try:
        while True:
            msg = await ws.receive_text()  # ping от клиента держит соединение
            if msg == "ping":
                await ws.send_text('{"type":"pong"}')
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(user_id, ws)


# Собранный фронтенд (frontend/dist) раздаётся тем же сервером — один адрес для PWA
FRONT_DIST = Path(BASE_DIR).parent / "frontend" / "dist"
if FRONT_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONT_DIST / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str):
        file = FRONT_DIST / path
        if path and file.is_file():
            return FileResponse(file)
        return FileResponse(FRONT_DIST / "index.html")
```

---

### Файл: `backend/app/routers/orders.py`

```python
"""Наряды: создание, список, карточка, действия, фото."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from ..auth import _bearer, current_user, decode_token, require_roles
from ..config import MEDIA_DIR
from ..db import get_db
from ..models import (
    PRIORITY_ORDER,
    Employee,
    Photo,
    PhotoKind,
    Priority,
    Role,
    Status,
    WorkOrder,
)
from ..schemas import ActionIn, MasterScoreIn, OrderCreate, PriorityIn, ReassignIn, SuggestIn, SuggestFaultCodeIn
from ..serializers import order_brief, order_full, photo_out
from ..services import orders as svc
from ..services.ai_nlp import suggest_fault_code
from ..services.events import broadcast
from ..services.export import generate_order_print_html
from ..services.photos import save_photo
from ..services.workers import suggest_assignees

router = APIRouter(prefix="/api/orders", tags=["orders"])
master_only = require_roles(Role.master, Role.admin)

DEFAULT_HOURS = {Priority.emergency: 2, Priority.high: 4, Priority.normal: 8, Priority.planned: 24}
MAX_PHOTOS = 5


def _load(db: Session, order_id: int) -> WorkOrder:
    o = db.scalar(select(WorkOrder).where(WorkOrder.id == order_id).options(
        selectinload(WorkOrder.events), selectinload(WorkOrder.photos),
        selectinload(WorkOrder.materials), selectinload(WorkOrder.assessments)))
    if not o:
        raise HTTPException(404, "Наряд не найден")
    return o


def _check_access(o: WorkOrder, user: Employee) -> None:
    if user.role == Role.worker and o.assignee_id != user.id:
        raise HTTPException(403, "Это не ваш наряд")


@router.get("")
def list_orders(
    status: list[str] | None = Query(None),
    section_id: int | None = None,
    equipment_id: int | None = None,
    assignee_id: int | None = None,
    priority: str | None = None,
    scope: str = Query("active", description="active | today | all"),
    limit: int = 300,
    db: Session = Depends(get_db),
    user: Employee = Depends(current_user),
):
    q = select(WorkOrder).options(selectinload(WorkOrder.photos), selectinload(WorkOrder.assessments))
    if user.role == Role.worker:
        q = q.where(WorkOrder.assignee_id == user.id)
    if status:
        q = q.where(WorkOrder.status.in_(status))
    elif scope == "active":
        # активные + закрытые/выполненные за последние 24 ч (для доски)
        since = datetime.now() - timedelta(hours=24)
        q = q.where(or_(
            WorkOrder.status.in_([s.value for s in (Status.issued, Status.queued, Status.accepted,
                                                    Status.in_progress, Status.paused, Status.done,
                                                    Status.ai_review, Status.rework, Status.rejected)]),
            WorkOrder.done_at >= since, WorkOrder.closed_at >= since))
    elif scope == "today":
        q = q.where(WorkOrder.created_at >= datetime.now().replace(hour=0, minute=0, second=0))
    for col, val in ((WorkOrder.section_id, section_id), (WorkOrder.equipment_id, equipment_id),
                     (WorkOrder.assignee_id, assignee_id), (WorkOrder.priority, priority)):
        if val is not None:
            q = q.where(col == val)
    orders = db.scalars(q.order_by(WorkOrder.created_at.desc()).limit(limit)).all()
    orders.sort(key=lambda o: (PRIORITY_ORDER[Priority(o.priority)], o.deadline))
    return [order_brief(o) for o in orders]


@router.post("")
def create(data: OrderCreate, db: Session = Depends(get_db), user: Employee = Depends(master_only)):
    if not data.deadline:
        hours = data.norm_hours or DEFAULT_HOURS[data.priority]
        data.deadline = datetime.now() + timedelta(hours=hours)
    o = svc.create_order(db, user, data)
    db.commit()
    return order_full(_load(db, o.id))


@router.post("/suggest-assignee")
def suggest(data: SuggestIn, db: Session = Depends(get_db), user: Employee = Depends(master_only)):
    return suggest_assignees(db, data.equipment_id, data.description)


@router.post("/suggest-fault-code")
def suggest_code(data: SuggestFaultCodeIn, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    res = suggest_fault_code(db, data.description)
    return res or {}


@router.get("/meta/reasons")
def reasons(user: Employee = Depends(current_user)):
    return {"reject": svc.VALID_REJECT_REASONS, "pause": svc.PAUSE_REASONS}


@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    o = _load(db, order_id)
    _check_access(o, user)
    return order_full(o)


@router.get("/{order_id}/print")
def print_order(
    order_id: int,
    token: str | None = None,
    db: Session = Depends(get_db),
    creds = Depends(_bearer),
):
    from fastapi.responses import HTMLResponse
    user_id = None
    if creds and creds.credentials:
        user_id = decode_token(creds.credentials)
    if not user_id and token:
        user_id = decode_token(token)
    if not user_id:
        raise HTTPException(401, "Требуется авторизация")
    user = db.get(Employee, user_id)
    if not user:
        raise HTTPException(401, "Пользователь не найден")
    o = _load(db, order_id)
    _check_access(o, user)
    html = generate_order_print_html(o)
    return HTMLResponse(content=html)


@router.post("/{order_id}/action")
def action(order_id: int, data: ActionIn, db: Session = Depends(get_db),
           user: Employee = Depends(current_user)):
    o = _load(db, order_id)
    svc.apply_action(db, o, user, data.action, reason=data.reason, comment=data.comment,
                     closing=data.closing)
    db.commit()
    return order_full(_load(db, order_id))


@router.post("/{order_id}/reassign")
def reassign(order_id: int, data: ReassignIn, db: Session = Depends(get_db),
             user: Employee = Depends(master_only)):
    svc.reassign(db, _load(db, order_id), user, data.assignee_id, data.comment)
    db.commit()
    return order_full(_load(db, order_id))


@router.post("/{order_id}/priority")
def priority(order_id: int, data: PriorityIn, db: Session = Depends(get_db),
             user: Employee = Depends(master_only)):
    svc.change_priority(db, _load(db, order_id), user, data.priority, data.deadline)
    db.commit()
    return order_full(_load(db, order_id))


@router.post("/{order_id}/master-score")
def master_score(order_id: int, data: MasterScoreIn, db: Session = Depends(get_db),
                 user: Employee = Depends(master_only)):
    svc.set_master_score(db, _load(db, order_id), user, data.score, data.comment)
    db.commit()
    return order_full(_load(db, order_id))


MAX_PHOTO_BYTES = 10 * 1024 * 1024  # 10 МБ


@router.post("/{order_id}/photos")
async def upload_photo(
    order_id: int,
    kind: PhotoKind = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: Employee = Depends(current_user),
):
    o = _load(db, order_id)
    _check_access(o, user)
    if kind == PhotoKind.before and user.role == Role.worker:
        raise HTTPException(403, "Фото неисправности добавляет мастер")
    if sum(1 for p in o.photos if p.kind == kind) >= MAX_PHOTOS:
        raise HTTPException(400, f"Не более {MAX_PHOTOS} фото")
    
    # Потоковое чтение с защитой от переполнения памяти (OOM)
    data = bytearray()
    while chunk := await file.read(64 * 1024):
        data.extend(chunk)
        if len(data) > MAX_PHOTO_BYTES:
            raise HTTPException(413, "Размер фотографии не должен превышать 10 МБ")
    
    if len(data) == 0:
        raise HTTPException(400, "Файл изображения пуст")
        
    raw_bytes = bytes(data)
    # Проверка magic bytes (JPEG / PNG / WEBP)
    is_jpeg = raw_bytes.startswith(b"\xff\xd8\xff")
    is_png = raw_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    is_webp = raw_bytes.startswith(b"RIFF") and b"WEBP" in raw_bytes[:16]
    if not (is_jpeg or is_png or is_webp):
        raise HTTPException(400, "Допустимы только форматы JPEG, PNG, WEBP")
        
    try:
        rel_path, taken_at, phash = save_photo(raw_bytes, o.id)
    except Exception:
        raise HTTPException(400, "Не удалось обработать изображение")
    p = Photo(order_id=o.id, kind=kind, file_path=rel_path, taken_at=taken_at,
              author_id=user.id, phash=phash)
    db.add(p)
    db.flush()
    broadcast(db, {"type": "order_photo", "order_id": o.id})
    db.commit()
    return photo_out(p)


@router.delete("/{order_id}/photos/{photo_id}")
def delete_photo(order_id: int, photo_id: int, db: Session = Depends(get_db),
                 user: Employee = Depends(current_user)):
    p = db.get(Photo, photo_id)
    if not p or p.order_id != order_id:
        raise HTTPException(404, "Фото не найдено")
    if p.author_id != user.id and user.role not in (Role.master, Role.admin):
        raise HTTPException(403, "Можно удалить только своё фото")
    
    # Физическое удаление файла с диска для исключения накопления мусора
    if p.file_path:
        disk_file = MEDIA_DIR / p.file_path
        try:
            if disk_file.is_file():
                disk_file.unlink()
        except Exception:
            pass
            
    db.delete(p)
    db.commit()
    return {"ok": True}
```

---

### Файл: `backend/app/routers/core.py`

```python
"""Вход, профиль, справочники, сотрудники, уведомления, отчёты."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from ..auth import create_token, current_user, require_roles, verify_pin
from ..db import get_db
from ..models import (
    Brigade,
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialNorm,
    Notification,
    Role,
    Section,
)
from ..schemas import AssistantIn, LoginIn, OnShiftIn, PushTokenIn
from ..serializers import employee_out, equipment_out
from ..services import reports
from ..services.events import broadcast
from ..services.workers import workers_with_status

import time
from collections import defaultdict

router = APIRouter(prefix="/api", tags=["core"])
staff_view = require_roles(Role.master, Role.manager, Role.admin)

# In-memory защита от подбора ПИН-кода: не более 5 попыток за 60 секунд на один логин
_login_failures: dict[str, list[float]] = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_WINDOW_SEC = 60


# ---------------------------------------------------------------- auth

@router.post("/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    clean_login = data.login.strip().lower()
    now_ts = time.time()
    
    # Очищаем устаревшие попытки
    attempts = [t for t in _login_failures[clean_login] if now_ts - t < LOCKOUT_WINDOW_SEC]
    _login_failures[clean_login] = attempts
    
    if len(attempts) >= MAX_LOGIN_ATTEMPTS:
        wait_sec = int(LOCKOUT_WINDOW_SEC - (now_ts - attempts[0])) + 1
        raise HTTPException(
            429, 
            f"Слишком много неудачных попыток входа. Подождите {wait_sec} сек."
        )
    
    user = db.scalar(select(Employee).where(Employee.login == clean_login))
    if not user or not verify_pin(data.pin, user.pin_hash):
        _login_failures[clean_login].append(now_ts)
        raise HTTPException(401, "Неверный логин или ПИН-код")
        
    # Сброс счетчика при успешном входе
    _login_failures.pop(clean_login, None)
    return {"token": create_token(user), "user": employee_out(user)}


@router.get("/auth/me")
def me(user: Employee = Depends(current_user)):
    return employee_out(user)


@router.post("/auth/push-token")
def push_token(data: PushTokenIn, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    if data.push_token is not None:
        user.push_token = data.push_token
    if data.telegram_chat_id is not None:
        user.telegram_chat_id = data.telegram_chat_id
    db.add(user)
    db.commit()
    return {"ok": True}


@router.get("/auth/demo-users")
def demo_users(db: Session = Depends(get_db)):
    """Список тестовых учёток для экрана входа (только для демо)."""
    users = db.scalars(select(Employee).order_by(Employee.role, Employee.full_name)).all()
    return [{"login": u.login, "full_name": u.full_name, "role": u.role, "specialty": u.specialty}
            for u in users]


# ---------------------------------------------------------------- справочники

@router.get("/dictionaries")
def dictionaries(db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    eq = db.scalars(select(Equipment).options(selectinload(Equipment.section))
                    .order_by(Equipment.name)).all()
    return {
        "sections": [{"id": s.id, "name": s.name} for s in db.scalars(select(Section).order_by(Section.id))],
        "equipment": [equipment_out(e) for e in eq],
        "brigades": [{"id": b.id, "name": b.name} for b in db.scalars(select(Brigade).order_by(Brigade.id))],
        "fault_codes": [{"id": f.id, "code": f.code, "category": f.category, "name": f.name,
                         "norm_hours": f.norm_hours}
                        for f in db.scalars(select(FaultCode).order_by(FaultCode.code))],
        "materials": [{"id": m.id, "name": m.name, "unit": m.unit}
                      for m in db.scalars(select(Material).order_by(Material.name))],
        "material_norms": [{"fault_code_id": n.fault_code_id, "material_id": n.material_id,
                            "typical_qty": n.typical_qty} for n in db.scalars(select(MaterialNorm))],
    }


# ---------------------------------------------------------------- сотрудники

@router.get("/workers")
def workers(db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    return workers_with_status(db)


@router.post("/workers/me/on-shift")
def set_on_shift(data: OnShiftIn, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    user.on_shift = data.on_shift
    db.add(user)
    broadcast(db, {"type": "worker_updated", "worker_id": user.id})
    db.commit()
    return employee_out(user)


@router.post("/workers/{worker_id}/on-shift")
def set_worker_on_shift(worker_id: int, data: OnShiftIn, db: Session = Depends(get_db),
                        user: Employee = Depends(require_roles(Role.master, Role.admin))):
    w = db.get(Employee, worker_id)
    if not w:
        raise HTTPException(404, "Сотрудник не найден")
    w.on_shift = data.on_shift
    broadcast(db, {"type": "worker_updated", "worker_id": w.id})
    db.commit()
    return employee_out(w)


# ---------------------------------------------------------------- уведомления

@router.get("/notifications")
def notifications(limit: int = 50, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    rows = db.scalars(select(Notification).where(Notification.user_id == user.id)
                      .order_by(Notification.created_at.desc()).limit(limit)).all()
    return [{"id": n.id, "kind": n.kind, "title": n.title, "text": n.text, "order_id": n.order_id,
             "urgent": n.urgent, "read": n.read, "created_at": n.created_at} for n in rows]


@router.post("/notifications/read-all")
def read_all(db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    db.execute(update(Notification).where(Notification.user_id == user.id).values(read=True))
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- отчёты

def _period(start: datetime | None, end: datetime | None, days: int) -> tuple[datetime, datetime]:
    end = end or datetime.now()
    return start or end - timedelta(days=days), end


@router.get("/reports/shift")
def shift_report(start: datetime | None = None, end: datetime | None = None,
                 db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    if not start:
        start, end, _ = reports.current_shift()
    return reports.shift_report(db, start, end or datetime.now())


@router.get("/reports/rating")
def rating(start: datetime | None = None, end: datetime | None = None, days: int = 30,
           brigade_id: int | None = None, db: Session = Depends(get_db),
           user: Employee = Depends(current_user)):
    s, e = _period(start, end, days)
    rows = reports.compute_rating(db, s, e, brigade_id)
    if user.role == Role.worker:  # исполнитель видит место в рейтинге и свою расшифровку
        return [{k: r[k] for k in ("id", "short_name", "rating", "place", "specialty")}
                | ({"components": r["components"], "explanation": r["explanation"]}
                   if r["id"] == user.id else {}) for r in rows]
    return {"weights": reports.WEIGHTS, "weight_labels": reports.WEIGHT_LABELS, "rows": rows}


@router.get("/reports/brigades")
def brigades_rating(start: datetime | None = None, end: datetime | None = None, days: int = 30,
                    db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    s, e = _period(start, end, days)
    return reports.compute_brigade_rating(db, s, e)


@router.get("/reports/shift/export/excel")
def export_shift_excel(start: datetime | None = None, end: datetime | None = None,
                       db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    from fastapi.responses import Response
    from ..services import export as export_svc
    if not start:
        start, end, _ = reports.current_shift()
    end = end or datetime.now()
    bio = export_svc.export_shift_report_excel(db, start, end)
    filename = f"shift_report_{start.strftime('%Y%m%d_%H%M')}.xlsx"
    return Response(
        content=bio.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/reports/rating/export/excel")
def export_rating_excel(start: datetime | None = None, end: datetime | None = None, days: int = 30,
                        brigade_id: int | None = None, db: Session = Depends(get_db),
                        user: Employee = Depends(staff_view)):
    from fastapi.responses import Response
    from ..services import export as export_svc
    s, e = _period(start, end, days)
    bio = export_svc.export_rating_excel(db, s, e, brigade_id)
    filename = f"worker_rating_{s.strftime('%Y%m%d')}_{e.strftime('%Y%m%d')}.xlsx"
    return Response(
        content=bio.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/reports/materials")
def materials_report(start: datetime | None = None, end: datetime | None = None, days: int = 30,
                     db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    from ..services import export as export_svc
    s, e = _period(start, end, days)
    return export_svc.get_materials_report(db, s, e)


@router.get("/reports/materials/export/excel")
def export_materials_excel(start: datetime | None = None, end: datetime | None = None, days: int = 30,
                           db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    from fastapi.responses import Response
    from ..services import export as export_svc
    s, e = _period(start, end, days)
    bio = export_svc.export_materials_excel(db, s, e)
    filename = f"materials_report_{s.strftime('%Y%m%d')}_{e.strftime('%Y%m%d')}.xlsx"
    return Response(
        content=bio.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/dashboard/counters")
def counters(db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    start, end, shift = reports.current_shift()
    r = reports.shift_report(db, start, end)
    from ..models import Status, WorkOrder
    down = db.scalars(select(WorkOrder).where(
        WorkOrder.work_type == "unplanned",
        WorkOrder.status.in_([Status.issued, Status.queued, Status.accepted, Status.in_progress,
                              Status.paused, Status.rework, Status.rejected]))).all()
    return {"shift": shift, "issued": r["issued"], "done": r["done"], "overdue": r["overdue"],
            "equipment_down": len({o.equipment_id for o in down})}


@router.get("/analytics/anomalies")
def anomalies(days: int = 90, db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    from ..services.analytics import detect_anomalies
    return detect_anomalies(db, days)


@router.post("/assistant/ask")
def assistant_ask(data: AssistantIn, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    from ..services.assistant import ask_assistant
    return ask_assistant(db, data.query)
```

---

### Файл: `backend/app/services/orders.py`

```python
"""Жизненный цикл наряда: машина состояний на 10 статусов (раздел 4) и журнал действий."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models import (
    PRIORITY_ORDER,
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialWriteOff,
    Priority,
    Role,
    Status,
    Verdict,
    WorkOrder,
    WorkOrderEvent,
)
from ..serializers import PRIORITY_LABELS, STATUS_LABELS, order_brief, short_name
from . import ai_review
from .events import broadcast, notify

S = Status


@dataclass(frozen=True)
class Transition:
    sources: frozenset[Status]
    target: Status
    role: Role
    reason_required: bool = False


TRANSITIONS: dict[str, Transition] = {
    # исполнитель
    "accept": Transition(frozenset({S.issued, S.queued}), S.accepted, Role.worker),
    "queue": Transition(frozenset({S.issued}), S.queued, Role.worker),
    "reject": Transition(frozenset({S.issued, S.queued, S.accepted}), S.rejected, Role.worker, True),
    "start": Transition(frozenset({S.accepted, S.rework, S.queued}), S.in_progress, Role.worker),
    "pause": Transition(frozenset({S.in_progress}), S.paused, Role.worker, True),
    "resume": Transition(frozenset({S.paused}), S.in_progress, Role.worker),
    "complete": Transition(frozenset({S.in_progress}), S.done, Role.worker),
    # мастер
    "approve": Transition(frozenset({S.ai_review, S.done}), S.closed, Role.master),
    "return_rework": Transition(frozenset({S.ai_review, S.done}), S.rework, Role.master, True),
    "cancel": Transition(
        frozenset({S.issued, S.queued, S.accepted, S.rejected, S.in_progress, S.paused, S.rework}),
        S.cancelled, Role.master, True),
}

REASSIGNABLE = {S.issued, S.queued, S.accepted, S.rejected, S.paused, S.rework}

# Уважительные причины отклонения (для рейтинга: остальные — «без уважительной причины»)
VALID_REJECT_REASONS = ["Нет материалов", "Нет допуска", "Занят аварийным нарядом",
                        "Нет инструмента", "Не моя специальность"]
PAUSE_REASONS = ["Ждёт запчасти", "Ждёт остановки оборудования", "Ждёт допуска",
                 "Обед / перерыв", "Переключён на аварийный наряд"]


def log_event(db: Session, o: WorkOrder, actor: Employee | None, action: str,
              from_status: str | None = None, to_status: str | None = None,
              comment: str | None = None, reason: str | None = None) -> None:
    db.add(WorkOrderEvent(order_id=o.id, actor_id=actor.id if actor else None, action=action,
                          from_status=from_status, to_status=to_status,
                          comment=comment, reason=reason))


def next_number(db: Session) -> int:
    return (db.scalar(select(func.max(WorkOrder.number))) or 0) + 1


def _order_line(o: WorkOrder) -> str:
    return f"{o.equipment.name}, {o.section.name.lower()}"


def _emit_update(db: Session, o: WorkOrder) -> None:
    db.flush()
    db.refresh(o)
    broadcast(db, {"type": "order_updated", "order": order_brief(o)})


def create_order(db: Session, master: Employee, data) -> WorkOrder:
    equipment = db.get(Equipment, data.equipment_id)
    if not equipment:
        raise HTTPException(404, "Оборудование не найдено")
    assignee = db.get(Employee, data.assignee_id) if data.assignee_id else None
    if data.assignee_id and (not assignee or assignee.role != Role.worker):
        raise HTTPException(400, "Исполнитель не найден")

    o = None
    for attempt in range(5):
        sp = db.begin_nested()
        try:
            o = WorkOrder(
                number=next_number(db), work_type=data.work_type, description=data.description,
                section_id=equipment.section_id, equipment_id=equipment.id,
                assignee_id=assignee.id if assignee else None, brigade_id=data.brigade_id,
                master_id=master.id, priority=data.priority, deadline=data.deadline,
                comment=data.comment, status=S.issued,
            )
            db.add(o)
            db.flush()
            sp.commit()
            break
        except IntegrityError:
            sp.rollback()
            if attempt == 4:
                raise HTTPException(500, "Не удалось сформировать уникальный номер наряда. Повторите попытку.")

    log_event(db, o, master, "issued", None, S.issued, comment=data.comment)
    db.refresh(o)
    if assignee:
        urgent = o.priority == Priority.emergency
        notify(db, assignee, "new_order",
               f"{'АВАРИЙНЫЙ н' if urgent else 'Н'}аряд №{o.number}",
               f"{_order_line(o)}. {o.description}. Срок: {o.deadline:%H:%M %d.%m}",
               order_id=o.id, urgent=urgent)
    _emit_update(db, o)
    return o


def _promote_next_queued(db: Session, worker: Employee) -> None:
    """«В очереди → Принят (по очереди)»: после завершения берём следующий наряд из очереди."""
    queued = db.scalars(select(WorkOrder).where(
        WorkOrder.assignee_id == worker.id, WorkOrder.status == S.queued)).all()
    if not queued:
        return
    nxt = min(queued, key=lambda q: (PRIORITY_ORDER[Priority(q.priority)], q.deadline))
    nxt.status = S.accepted
    nxt.accepted_at = datetime.now()
    log_event(db, nxt, None, "auto_accept", S.queued, S.accepted, comment="Следующий в очереди")
    notify(db, worker, "next_in_queue", f"Следующий наряд №{nxt.number}",
           f"{_order_line(nxt)}. {nxt.description}", order_id=nxt.id)
    _emit_update(db, nxt)


def apply_action(db: Session, o: WorkOrder, actor: Employee, action: str,
                 reason: str | None = None, comment: str | None = None,
                 closing=None) -> WorkOrder:
    t = TRANSITIONS.get(action)
    if not t:
        raise HTTPException(400, f"Неизвестное действие: {action}")
    if actor.role != t.role and not (t.role == Role.master and actor.role == Role.admin):
        raise HTTPException(403, "Это действие недоступно для вашей роли")
    if actor.role == Role.worker and o.assignee_id != actor.id:
        raise HTTPException(403, "Это не ваш наряд")
    if o.status not in t.sources:
        raise HTTPException(409, f"Нельзя выполнить «{action}» из статуса «{STATUS_LABELS[Status(o.status)]}»")
    if t.reason_required and not reason:
        raise HTTPException(422, "Укажите причину")

    prev = o.status
    now = datetime.now()
    o.status = t.target

    if action == "accept":
        o.accepted_at = now
    elif action == "queue":
        o.queued_at = now
    elif action == "start":
        o.started_at = o.started_at or now
        o.accepted_at = o.accepted_at or now
    elif action == "pause":
        o.paused_since = now
    elif action == "resume":
        if o.paused_since:
            o.paused_minutes = (o.paused_minutes or 0) + (now - o.paused_since).total_seconds() / 60
        o.paused_since = None
    elif action == "complete":
        _apply_closing_form(db, o, closing)
        o.done_at = now
    elif action == "approve":
        o.closed_at = now

    log_event(db, o, actor, action, prev, o.status, comment=comment, reason=reason)

    # уведомления мастеру о действиях исполнителя
    who = short_name(actor.full_name)
    if action == "reject":
        notify(db, o.master, "rejected", f"Наряд №{o.number} отклонён",
               f"{who}: «{reason}». {_order_line(o)}. Переназначьте исполнителя.",
               order_id=o.id, urgent=o.priority == Priority.emergency)
    elif action == "pause":
        notify(db, o.master, "paused", f"Наряд №{o.number} приостановлен",
               f"{who}: «{reason}». {_order_line(o)}", order_id=o.id)
    elif action == "return_rework":
        notify(db, o.assignee, "rework", f"Наряд №{o.number} возвращён на доработку",
               f"Мастер: «{reason}»", order_id=o.id, urgent=True)
    elif action == "approve" and o.assignee:
        a = o.assessment
        notify(db, o.assignee, "closed", f"Наряд №{o.number} закрыт",
               f"Итоговая оценка: {a.final_score}/100" if a else "Наряд закрыт мастером",
               order_id=o.id)

    _emit_update(db, o)

    if action == "complete":
        _run_ai_review(db, o, actor)
    elif action == "cancel" and o.assignee:
        _promote_next_queued(db, o.assignee)
    return o


def _apply_closing_form(db: Session, o: WorkOrder, closing) -> None:
    if closing is None:
        raise HTTPException(422, "Заполните форму закрытия")
    if closing.fault_code_id is not None:
        fc = db.get(FaultCode, closing.fault_code_id)
        if not fc:
            raise HTTPException(400, "Указанный шифр неисправности не найден в справочнике")
    o.work_done = closing.work_done
    o.fault_code_id = closing.fault_code_id
    o.close_comment = closing.comment
    for m in list(o.materials):
        db.delete(m)
    db.flush()
    for item in closing.materials:
        mat = db.get(Material, item.material_id)
        if not mat:
            raise HTTPException(400, f"Материал с ID {item.material_id} не найден в справочнике")
        db.add(MaterialWriteOff(order_id=o.id, material_id=item.material_id, qty=item.qty))
    db.flush()
    db.refresh(o, ["materials"])


def _run_ai_review(db: Session, o: WorkOrder, worker: Employee) -> None:
    """Исполнено → Проверка ИИ → (вердикт) → На доработке | ждёт подтверждения мастера."""
    o.status = S.ai_review
    log_event(db, o, None, "ai_review", S.done, S.ai_review)
    db.flush()
    a = ai_review.review_order(db, o)
    log_event(db, o, None, "ai_verdict", comment=f"{a.score}/100. {a.explanation}")

    notify(db, worker, "ai_result", f"Отчёт ИИ по наряду №{o.number}", a.worker_report or "",
           order_id=o.id, urgent=a.verdict == Verdict.needs_rework)

    if a.verdict == Verdict.needs_rework:
        o.status = S.rework
        log_event(db, o, None, "return_rework", S.ai_review, S.rework, reason="Вердикт ИИ")
        notify(db, o.master, "ai_rework", f"Наряд №{o.number}: требует доработки",
               f"{short_name(worker.full_name)}, {_order_line(o)}. {a.explanation}", order_id=o.id)
    else:
        notify(db, o.master, "ai_review_done",
               f"Наряд №{o.number} ждёт подтверждения ({a.score}/100)",
               f"{short_name(worker.full_name)}, {_order_line(o)}. {a.explanation}", order_id=o.id)
    _emit_update(db, o)
    if a.verdict != Verdict.needs_rework:
        _promote_next_queued(db, worker)


def reassign(db: Session, o: WorkOrder, master: Employee, assignee_id: int,
             comment: str | None = None) -> WorkOrder:
    if o.status not in REASSIGNABLE:
        raise HTTPException(409, "Наряд в этом статусе нельзя переназначить")
    new = db.get(Employee, assignee_id)
    if not new or new.role != Role.worker:
        raise HTTPException(400, "Исполнитель не найден")
    old = o.assignee
    prev = o.status
    o.assignee_id = new.id
    o.status = S.issued
    o.accepted_at = o.started_at = o.queued_at = None
    o.escalated_at = None
    log_event(db, o, master, "reassign", prev, S.issued,
              comment=f"{short_name(old.full_name) if old else '—'} → {short_name(new.full_name)}"
              + (f". {comment}" if comment else ""))
    db.flush()
    db.refresh(o)
    urgent = o.priority == Priority.emergency
    notify(db, new, "new_order", f"{'АВАРИЙНЫЙ н' if urgent else 'Н'}аряд №{o.number}",
           f"{_order_line(o)}. {o.description}. Срок: {o.deadline:%H:%M %d.%m}",
           order_id=o.id, urgent=urgent)
    if old and old.id != new.id:
        notify(db, old, "reassigned", f"Наряд №{o.number} передан другому исполнителю",
               _order_line(o), order_id=o.id)
        _promote_next_queued(db, old)
    _emit_update(db, o)
    return o


def change_priority(db: Session, o: WorkOrder, master: Employee, priority: Priority,
                    deadline: datetime | None = None) -> WorkOrder:
    old = o.priority
    o.priority = priority
    if deadline:
        o.deadline = deadline
        o.reminded_at = o.overdue_notified_at = None
    log_event(db, o, master, "change_priority",
              comment=f"{PRIORITY_LABELS[old]} → {PRIORITY_LABELS[priority]}"
              + (f", срок {deadline:%H:%M %d.%m}" if deadline else ""))
    if o.assignee:
        notify(db, o.assignee, "priority", f"Наряд №{o.number}: приоритет «{PRIORITY_LABELS[priority]}»",
               _order_line(o), order_id=o.id, urgent=priority == Priority.emergency)
    _emit_update(db, o)
    return o


def set_master_score(db: Session, o: WorkOrder, master: Employee, score: int,
                     comment: str | None) -> WorkOrder:
    a = o.assessment
    if not a:
        raise HTTPException(409, "У наряда нет оценки ИИ")
    a.master_score = score
    a.master_comment = comment
    log_event(db, o, master, "master_score", comment=f"ИИ: {a.score} → мастер: {score}. {comment or ''}")
    _emit_update(db, o)
    return o
```

---

### Файл: `backend/app/services/analytics.py`

```python
"""ИИ-аналитика истории и поиск аномалий (раздел 6.5 кейса).

Выявляет:
 1. Оборудование и участки с частыми поломками («узкие места»);
 2. Повторяющиеся неисправности одного шифра на одном оборудовании (ремонт не устраняет причину);
 3. Поломки, возникающие вскоре (2–5 дней) после планового ремонта (качество ППР);
 4. Связь поломок со сменами (день / ночь), участками, исполнителями;
 5. Аномальный расход материалов против норматива.

Каждый вывод формулируется простым техническим языком с конкретной рекомендацией.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..models import (
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialNorm,
    MaterialWriteOff,
    Role,
    Section,
    WorkOrder,
    WorkOrderEvent,
)
from ..serializers import downtime_minutes, short_name


def detect_anomalies(db: Session, days: int = 90) -> dict:
    since = datetime.now() - timedelta(days=days)
    orders = db.scalars(
        select(WorkOrder)
        .where(WorkOrder.created_at >= since)
        .options(
            selectinload(WorkOrder.equipment).selectinload(Equipment.section),
            selectinload(WorkOrder.fault_code),
            selectinload(WorkOrder.assignee),
            selectinload(WorkOrder.materials).selectinload(MaterialWriteOff.material),
            selectinload(WorkOrder.events),
        )
    ).all()

    insights = []
    total_unplanned = sum(1 for o in orders if o.work_type == "unplanned")
    total_planned = sum(1 for o in orders if o.work_type == "planned")
    equipment_count = db.scalar(select(func.count(Equipment.id))) or 1

    # ------------------------------------------------ 1. Топ проблемного оборудования и повторные поломки
    unplanned_by_eq = defaultdict(list)
    for o in orders:
        if o.work_type == "unplanned":
            unplanned_by_eq[o.equipment_id].append(o)

    avg_unplanned = total_unplanned / equipment_count if equipment_count else 0
    top_problematic = []

    for eq_id, eq_orders in unplanned_by_eq.items():
        eq = eq_orders[0].equipment
        cnt = len(eq_orders)
        fault_counts = defaultdict(int)
        for o in eq_orders:
            if o.fault_code:
                fault_counts[o.fault_code.code] += 1

        top_fault = max(fault_counts, key=fault_counts.get) if fault_counts else None
        top_fault_cnt = fault_counts[top_fault] if top_fault else 0
        total_downtime = sum(downtime_minutes(o) or 0 for o in eq_orders)

        top_problematic.append({
            "equipment_id": eq.id,
            "name": eq.name,
            "section": eq.section.name,
            "unplanned_count": cnt,
            "ratio_to_avg": round(cnt / avg_unplanned, 1) if avg_unplanned else 1.0,
            "top_fault": top_fault,
            "top_fault_count": top_fault_cnt,
            "downtime_hours": round(total_downtime / 60, 1),
        })

        # Закономерность 1: поломки чаще среднего в 2.5+ раз
        if cnt >= avg_unplanned * 2.5 and cnt >= 5:
            fc_obj = db.scalar(select(FaultCode).where(FaultCode.code == top_fault)) if top_fault else None
            fc_desc = f" ({fc_obj.name.lower()})" if fc_obj else ""
            insights.append({
                "type": "equipment_frequency",
                "severity": "critical",
                "target": eq.name,
                "title": f"Критическая аварийность: {eq.name}",
                "text": (
                    f"{eq.name} ({eq.section.name}): {cnt} внеплановых остановок за {days} дней "
                    f"(в {cnt / avg_unplanned:.1f} раза чаще среднего показателя по предприятию). "
                    f"{top_fault_cnt} из них — шифр {top_fault}{fc_desc}."
                ),
                "recommendation": (
                    f"Провести внеочередную вибродиагностику и проверку соосности привода {eq.name}. "
                    f"Включить ревизию подшипниковых узлов в ближайший план ППР."
                ),
            })

    top_problematic.sort(key=lambda x: x["unplanned_count"], reverse=True)

    # ------------------------------------------------ 2. Поломки вскоре после ППР (качество ТО)
    planned_orders = [o for o in orders if o.work_type == "planned" and o.done_at]
    critical_eq_ids = {p["equipment_id"] for p in top_problematic if p["unplanned_count"] >= avg_unplanned * 2.5 and p["unplanned_count"] >= 5}
    post_ppr_by_eq = defaultdict(list)
    for p in planned_orders:
        if p.equipment_id in critical_eq_ids:
            continue
        # Ищем первый внеплановый отказ на том же агрегате в течение 1.5–5 дней после ППР
        earliest = None
        for u in unplanned_by_eq.get(p.equipment_id, []):
            if p.done_at and u.created_at and u.created_at > p.done_at:
                delta_days = (u.created_at - p.done_at).total_seconds() / 86400
                if 1.5 <= delta_days <= 5.0:
                    if earliest is None or u.created_at < earliest[1].created_at:
                        earliest = (p, u, delta_days)
        if earliest:
            post_ppr_by_eq[p.equipment_id].append(earliest)

    sorted_ppr = sorted(post_ppr_by_eq.items(), key=lambda x: len(x[1]), reverse=True)
    # Выделяем агрегаты с систематическим браком после ТО (не более топ-2)
    for eq_id, fails in sorted_ppr[:2]:
        if len(fails) >= 4:
            eq = fails[0][0].equipment
            insights.append({
                "type": "post_ppr_quality",
                "severity": "warning",
                "target": eq.name,
                "title": f"Повторные отказы после ППР: {eq.name}",
                "text": (
                    f"По {eq.name} зафиксировано {len(fails)} внеплановых остановок в течение 2–5 дней "
                    f"после завершения планового ТО. Это указывает на скрытые дефекты сборки либо неполный объём регламентных работ."
                ),
                "recommendation": (
                    f"Усилить приёмку после ППР мастером смены: обязательный тест под нагрузкой "
                    f"не менее 2 часов с тепловизионным контролем."
                ),
            })

    # ------------------------------------------------ 3. Повторные поломки по исполнителям (в течение 7 дней)
    repeat_by_worker = defaultdict(list)
    worker_orders = defaultdict(list)
    for o in orders:
        if o.assignee_id and o.work_type == "unplanned" and o.done_at and o.fault_code_id:
            if o.equipment_id not in critical_eq_ids:
                worker_orders[o.assignee_id].append(o)

    for wid, w_orders in worker_orders.items():
        for i, o1 in enumerate(w_orders):
            for o2 in unplanned_by_eq.get(o1.equipment_id, []):
                if o1.id != o2.id and o1.fault_code_id == o2.fault_code_id and o1.done_at and o2.created_at:
                    d = (o2.created_at - o1.done_at).total_seconds() / 86400
                    if 0.1 <= d <= 7.0:
                        repeat_by_worker[wid].append((o1, o2))
                        break

    for wid, reps in repeat_by_worker.items():
        total_w = len(worker_orders[wid])
        if total_w >= 10 and (len(reps) / total_w) > 0.50:
            worker = db.get(Employee, wid)
            if worker:
                insights.append({
                    "type": "worker_repeat_rate",
                    "severity": "warning",
                    "target": worker.full_name,
                    "title": f"Высокая доля повторных отказов: {short_name(worker.full_name)}",
                    "text": (
                        f"У исполнителя {short_name(worker.full_name)} ({worker.specialty}, {worker.grade} разряд) "
                        f"{len(reps)} из {total_w} ремонтов ({len(reps) / total_w * 100:.0f}%) повлекли "
                        f"повторную поломку того же шифра на оборудовании в течение 7 дней."
                    ),
                    "recommendation": (
                        f"Направить сотрудника на наставничество к бригадиру смены, "
                        f"ввести обязательную инструментальную проверку его нарядов мастером."
                    ),
                })

    # ------------------------------------------------ 4. Аномалии сменности (День vs Ночь)
    shift_section_stats = defaultdict(lambda: {"day": 0, "night": 0})
    for o in orders:
        if o.work_type == "unplanned":
            sh = "day" if 8 <= o.created_at.hour < 20 else "night"
            shift_section_stats[o.section_id][sh] += 1

    for sec_id, counts in shift_section_stats.items():
        sec = db.get(Section, sec_id)
        if sec and counts["night"] > counts["day"] * 1.7 and counts["night"] >= 15:
            insights.append({
                "type": "shift_imbalance",
                "severity": "warning",
                "target": sec.name,
                "title": f"Ночной всплеск аварийности: {sec.name}",
                "text": (
                    f"На участке «{sec.name}» в ночные смены зафиксировано {counts['night']} аварийных нарядов "
                    f"против {counts['day']} в дневные (превышение в {counts['night'] / max(1, counts['day']):.1f} раза)."
                ),
                "recommendation": (
                    f"Проверить соблюдение регламентов технологической загрузки агрегатов в ночное время, "
                    f"усилить дежурную ремонтную смену электриком и слесарем."
                ),
            })

    # ------------------------------------------------ 5. Аномальный перерасход материалов
    norms = db.scalars(select(MaterialNorm)).all()
    norm_map = {(n.fault_code_id, n.material_id): n.typical_qty for n in norms}
    overuse_by_worker = defaultdict(lambda: {"total": 0, "over_count": 0, "ratio_sum": 0.0})

    for o in orders:
        if o.assignee_id and o.fault_code_id and o.materials:
            for m in o.materials:
                typ = norm_map.get((o.fault_code_id, m.material_id))
                if typ:
                    overuse_by_worker[o.assignee_id]["total"] += 1
                    ratio = m.qty / typ
                    if ratio >= 1.5:
                        overuse_by_worker[o.assignee_id]["over_count"] += 1
                        overuse_by_worker[o.assignee_id]["ratio_sum"] += ratio

    for wid, stat in overuse_by_worker.items():
        if stat["over_count"] >= 5 and (stat["over_count"] / stat["total"]) > 0.4:
            worker = db.get(Employee, wid)
            if worker:
                avg_over = stat["ratio_sum"] / stat["over_count"]
                insights.append({
                    "type": "material_overuse",
                    "severity": "info",
                    "target": worker.full_name,
                    "title": f"Систематический перерасход материалов: {short_name(worker.full_name)}",
                    "text": (
                        f"Исполнитель {short_name(worker.full_name)} в {stat['over_count']} нарядах списал ТМЦ "
                        f"в среднем в {avg_over:.1f} раза выше нормы расхода по технологическим картам."
                    ),
                    "recommendation": (
                        f"Провести инвентаризацию списания запчастей, сопоставить фактически установленные "
                        f"узлы с возвратным металлоломом на складе."
                    ),
                })

    return {
        "period_days": days,
        "total_orders": len(orders),
        "unplanned_orders": total_unplanned,
        "planned_orders": total_planned,
        "insights": insights,
        "top_problematic": top_problematic[:10],
    }
```

---

### Файл: `backend/app/services/deadlines.py`

```python
"""ИИ-контроль сроков (раздел 6.1, MVP).

Фоновая задача раз в N секунд:
1. за REMIND_BEFORE_MIN до срока — напоминание исполнителю;
2. при просрочке — сообщение исполнителю и мастеру (повтор через OVERDUE_REPEAT_MIN);
3. наряд не принят за 10 мин (аварийный — за 3) — эскалация мастеру с предложением исполнителя;
4. длительная просрочка (> 2 ч) — уведомление руководителю.
"""
import asyncio
import logging
from datetime import datetime, timedelta

import anyio
from sqlalchemy import select

from ..config import (
    ACCEPT_TIMEOUT_EMERGENCY_MIN,
    ACCEPT_TIMEOUT_MIN,
    DEADLINE_CHECK_INTERVAL_SEC,
    OVERDUE_REPEAT_MIN,
    REMIND_BEFORE_MIN,
)
from ..db import SessionLocal
from ..models import Employee, Priority, Role, Status, WorkOrder
from ..serializers import STATUS_LABELS, short_name
from .events import notify
from .workers import suggest_assignees

log = logging.getLogger(__name__)

TRACKED = {Status.issued, Status.queued, Status.accepted, Status.in_progress, Status.paused,
           Status.rework}
MANAGER_AFTER_MIN = 120


def _fmt(minutes: float) -> str:
    h, m = divmod(int(minutes), 60)
    return f"{h} ч {m} мин" if h else f"{m} мин"


def _last_comment(o: WorkOrder) -> str | None:
    for ev in reversed(o.events):
        if ev.comment or ev.reason:
            return ev.reason or ev.comment
    return None


def overdue_message(o: WorkOrder, now: datetime) -> str:
    """Формат из кейса: «Наряд №147 просрочен на 45 мин. Дробилка КМД-1750, участок дробления…»"""
    late = (now - o.deadline).total_seconds() / 60
    status_line = STATUS_LABELS[Status(o.status)].lower()
    if o.status == Status.in_progress and o.started_at:
        status_line += f" с {o.started_at:%H:%M}"
    text = (f"Наряд №{o.number} просрочен на {_fmt(late)}. {o.equipment.name}, "
            f"{o.section.name.lower()}. Исполнитель: "
            f"{short_name(o.assignee.full_name) if o.assignee else '—'}. Статус: {status_line}.")
    last = _last_comment(o)
    if last:
        text += f" Последний комментарий: «{last}»."
    return text


def check_deadlines() -> int:
    """Один проход проверки. Возвращает число отправленных уведомлений."""
    sent = 0
    now = datetime.now()
    with SessionLocal() as db:
        orders = db.scalars(select(WorkOrder).where(WorkOrder.status.in_(list(TRACKED)))).all()
        for o in orders:
            try:
                # 3. эскалация: не принят вовремя
                if o.status == Status.issued and not o.escalated_at:
                    timeout = ACCEPT_TIMEOUT_EMERGENCY_MIN if o.priority == Priority.emergency else ACCEPT_TIMEOUT_MIN
                    if now - o.created_at >= timedelta(minutes=timeout):
                        alt = suggest_assignees(db, o.equipment_id, o.description,
                                                exclude_ids={o.assignee_id} if o.assignee_id else set(), limit=1)
                        alt_txt = (f" Предлагаем: {alt[0]['short_name']} ({alt[0]['live']['label'].lower()})."
                                   if alt else "")
                        notify(db, o.master, "escalation", f"Наряд №{o.number} не принят за {timeout} мин",
                               f"{o.equipment.name}, исполнитель "
                               f"{short_name(o.assignee.full_name) if o.assignee else '—'} не отвечает.{alt_txt}",
                               order_id=o.id, urgent=True)
                        o.escalated_at = now
                        sent += 1

                if not o.assignee:
                    continue
                left = (o.deadline - now).total_seconds() / 60

                # 1. напоминание до срока
                if 0 < left <= REMIND_BEFORE_MIN and not o.reminded_at:
                    notify(db, o.assignee, "reminder", f"До срока наряда №{o.number} — {_fmt(left)}",
                           f"{o.equipment.name}, {o.section.name.lower()}. Срок: {o.deadline:%H:%M}",
                           order_id=o.id)
                    o.reminded_at = now
                    sent += 1

                # 2. просрочка (с повтором)
                if left <= 0 and (not o.overdue_notified_at or
                                  now - o.overdue_notified_at >= timedelta(minutes=OVERDUE_REPEAT_MIN)):
                    text = overdue_message(o, now)
                    title = f"Просрочка: наряд №{o.number}"
                    notify(db, o.assignee, "overdue", title, text, order_id=o.id, urgent=True)
                    notify(db, o.master, "overdue", title, text, order_id=o.id, urgent=True)
                    o.overdue_notified_at = now
                    sent += 2

                # 4. длительная просрочка → руководителю
                if left <= -MANAGER_AFTER_MIN and not o.manager_notified_at:
                    for m in db.scalars(select(Employee).where(Employee.role == Role.manager)):
                        notify(db, m, "overdue_long", f"Длительная просрочка: наряд №{o.number}",
                               overdue_message(o, now), order_id=o.id)
                        sent += 1
                    o.manager_notified_at = now
            except Exception as exc:
                log.warning("Ошибка обработки дедлайна наряда №%s: %s", getattr(o, 'number', o.id), exc)
        db.commit()
    return sent


async def deadline_loop() -> None:
    while True:
        try:
            n = await anyio.to_thread.run_sync(check_deadlines)
            if n:
                log.info("Контроль сроков: отправлено %s уведомлений", n)
        except Exception:
            log.exception("Ошибка контроля сроков")
        await asyncio.sleep(DEADLINE_CHECK_INTERVAL_SEC)
```

---

### Файл: `backend/app/services/ai_review.py`

```python
"""ИИ-проверка выполнения наряда (раздел 6.2) — базовый уровень на правилах.

Детерминированные проверки дают надёжный вердикт даже без LLM. На следующем этапе
сюда подключается языковая модель (соответствие работ проблеме) и мультимодальное
сравнение фото «до/после» поверх этих правил.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import AIAssessment, MaterialNorm, Photo, Verdict, WorkOrder, WorkType
from ..serializers import work_minutes
from .photos import hamming

CRITICAL, REMARK, OK = "critical", "remark", "ok"


@dataclass
class Check:
    name: str
    level: str
    message: str
    penalty: int = 0


@dataclass
class ReviewResult:
    checks: list[Check] = field(default_factory=list)
    photo_score: int | None = None
    needs_master_check: bool = False

    def add(self, name: str, level: str, message: str, penalty: int = 0) -> None:
        self.checks.append(Check(name, level, message, penalty))


def _fmt_minutes(m: float) -> str:
    h, mm = divmod(int(round(m)), 60)
    return f"{h} ч {mm} мин" if h else f"{mm} мин"


_STOP = {"и", "в", "на", "с", "по", "не", "для", "от", "до", "из", "за", "к", "о", "у", "а", "но"}


def _stems(text: str) -> set[str]:
    words = re.findall(r"[а-яёa-z0-9]+", (text or "").lower())
    return {w[:5] for w in words if len(w) > 3 and w not in _STOP}


def check_completeness(o: WorkOrder, r: ReviewResult) -> None:
    has_after = any(p.kind == "after" for p in o.photos)
    if not o.work_done or len(o.work_done.strip()) < 5:
        r.add("completeness", CRITICAL, "Не описаны выполненные работы", 35)
    if not o.fault_code_id:
        r.add("completeness", CRITICAL, "Не указан шифр неисправности", 20)
    if o.work_type == WorkType.unplanned and not has_after:
        r.add("completeness", CRITICAL, "Нет фото «после» — обязательно для внеплановых работ", 35)
    elif not has_after:
        r.add("completeness", REMARK, "Нет фото «после»", 5)
    if not o.materials:
        r.add("completeness", REMARK, "Не указаны списанные материалы (если не использовались — укажите в комментарии)", 3)
    if not any(c.name == "completeness" for c in r.checks):
        r.add("completeness", OK, "Все обязательные поля закрытия заполнены")


from .ai_nlp import evaluate_work_relevance


def check_relevance(o: WorkOrder, r: ReviewResult) -> None:
    """Интеллектуальная проверка соответствия работ проблеме и шифру (автономный ИИ)."""
    if not o.work_done:
        return
    fault_name = o.fault_code.name if o.fault_code else ""
    ok, message, penalty = evaluate_work_relevance(o.description, o.work_done, fault_name)
    if ok:
        r.add("relevance", OK, message)
    else:
        r.add("relevance", REMARK, message, penalty)


def check_materials(db: Session, o: WorkOrder, r: ReviewResult) -> None:
    if not o.materials or not o.fault_code_id:
        return
    norms = {n.material_id: n.typical_qty for n in db.scalars(
        select(MaterialNorm).where(MaterialNorm.fault_code_id == o.fault_code_id))}
    problems = False
    fc_code = o.fault_code.code if o.fault_code else "не указан"
    for m in o.materials:
        typical = norms.get(m.material_id)
        name = m.material.name if m.material else f"Материал #{m.material_id}"
        unit = m.material.unit if m.material else "ед."
        if typical is None:
            problems = True
            r.add("materials", REMARK,
                  f"«{name}» нетипичен для шифра {fc_code}", 8)
        elif m.qty > typical * 2:
            problems = True
            r.add("materials", CRITICAL,
                  f"«{name}»: списано {m.qty:g} {unit} при обычном расходе "
                  f"{typical:g} — завышение в {m.qty / typical:.1f} раза", 25)
        elif m.qty > typical * 1.5:
            problems = True
            r.add("materials", REMARK,
                  f"«{name}»: списано {m.qty:g} {unit} при обычном расходе {typical:g}", 8)
    if not problems:
        r.add("materials", OK, "Материалы соответствуют шифру и обычному расходу")


def check_time(o: WorkOrder, r: ReviewResult) -> None:
    minutes = work_minutes(o)
    if o.done_at and o.done_at > o.deadline:
        late = (o.done_at - o.deadline).total_seconds() / 60
        r.add("time", REMARK, f"Выполнено с просрочкой на {_fmt_minutes(late)}", min(20, 5 + int(late // 30) * 3))
    if minutes is None or not o.fault_code:
        return
    norm = o.fault_code.norm_hours * 60
    if minutes > norm * 1.5:
        r.add("time", REMARK, f"Время работы {_fmt_minutes(minutes)} при нормативе {_fmt_minutes(norm)}", 8)
    elif minutes < norm * 0.15 and o.work_type == WorkType.unplanned:
        r.add("time", REMARK, f"Подозрительно быстро: {_fmt_minutes(minutes)} при нормативе {_fmt_minutes(norm)}", 5)
    elif not (o.done_at and o.done_at > o.deadline):
        r.add("time", OK, f"Время {_fmt_minutes(minutes)} в пределах норматива {_fmt_minutes(norm)}")


def check_photos(db: Session, o: WorkOrder, r: ReviewResult) -> None:
    """Базовая проверка фото (6.3 п.1): свежее, не повтор старого, отличается от «до»."""
    after = [p for p in o.photos if p.kind == "after"]
    before = [p for p in o.photos if p.kind == "before"]
    if not after:
        return
    issues = False
    other_hashes = db.execute(
        select(Photo.phash, Photo.order_id).where(Photo.order_id != o.id, Photo.phash.is_not(None))
    ).all()
    has_dup = False
    has_early = False
    has_identical = False

    for p in after:
        if not p.phash:
            continue
        dup = next((oid for h, oid in other_hashes if hamming(h, p.phash) <= 4), None)
        if dup:
            issues = True
            has_dup = True
            r.add("photo", CRITICAL, "Фото «после» повторяет ранее загруженное фото другого наряда", 35)
        if p.taken_at and o.started_at and p.taken_at < o.started_at.replace(microsecond=0) and \
                (o.started_at - p.taken_at).total_seconds() > 3600:
            issues = True
            has_early = True
            r.add("photo", REMARK, "Фото «после» сделано до начала работ (по метаданным)", 15)
        for b in before:
            if b.phash and hamming(b.phash, p.phash) <= 3:
                issues = True
                has_identical = True
                r.add("photo", REMARK, "Фото «после» практически совпадает с фото «до» — устранение не видно", 15)
                r.needs_master_check = True

    if has_dup:
        r.photo_score = 1
    elif has_early:
        r.photo_score = 2
    elif has_identical:
        r.photo_score = 3
    elif not issues:
        r.add("photo", OK, "Фото «после» свежее и не повторяет старые снимки")
        r.photo_score = 5 if before else 4
    else:
        r.photo_score = 3


def build_reports(o: WorkOrder, r: ReviewResult) -> tuple[Verdict, int, str, str]:
    score = max(0, 100 - sum(c.penalty for c in r.checks))
    has_critical = any(c.level == CRITICAL for c in r.checks)
    has_remarks = any(c.level == REMARK for c in r.checks)
    if has_critical:
        verdict = Verdict.needs_rework
        score = min(score, 59)
    elif has_remarks:
        verdict = Verdict.accepted_with_remarks
    else:
        verdict = Verdict.accepted

    bad = [c.message for c in r.checks if c.level in (CRITICAL, REMARK)]
    good = [c.message for c in r.checks if c.level == OK]
    head = {
        Verdict.accepted: "Наряд выполнен полностью и в срок.",
        Verdict.accepted_with_remarks: "Наряд принят с замечаниями.",
        Verdict.needs_rework: "Наряд требует доработки.",
    }[verdict]
    explanation = head + (" Замечания: " + "; ".join(bad) + "." if bad else "")

    minutes = work_minutes(o)
    time_line = ""
    if minutes is not None and o.fault_code:
        time_line = f"\nВремя: {_fmt_minutes(minutes)} при нормативе {_fmt_minutes(o.fault_code.norm_hours * 60)}."
    worker_report = (
        f"Оценка: {score}/100 — {head}\n"
        + ("Хорошо: " + "; ".join(good) + ".\n" if good else "")
        + ("Улучшить: " + "; ".join(bad) + "." if bad else "Замечаний нет.")
        + time_line
    )
    return verdict, score, explanation, worker_report


def review_order(db: Session, o: WorkOrder) -> AIAssessment:
    r = ReviewResult()
    check_completeness(o, r)
    check_relevance(o, r)
    check_materials(db, o, r)
    check_time(o, r)
    check_photos(db, o, r)
    verdict, score, explanation, worker_report = build_reports(o, r)
    a = AIAssessment(
        order_id=o.id, verdict=verdict, score=score, photo_score=r.photo_score,
        explanation=explanation, worker_report=worker_report,
        needs_master_check=r.needs_master_check,
        details={"checks": [c.__dict__ for c in r.checks], "engine": "rules-v1"},
    )
    db.add(a)
    db.flush()
    db.refresh(o, ["assessments"])
    return a
```

---

### Файл: `backend/app/services/reports.py`

```python
"""Рейтинг исполнителей (6.6) и отчёт за смену (раздел 7).

Формула (веса обосновываются на защите):
  Рейтинг = 0.35·Качество + 0.25·ВСрок + 0.20·(100 − Доработки/повторы)
          + 0.15·ОбъёмСложность + 0.05·(100 − Необоснованные отказы)
Все компоненты нормированы 0–100.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import (
    Brigade,
    Employee,
    Equipment,
    Role,
    Status,
    WorkOrder,
    WorkOrderEvent,
)
from ..serializers import downtime_minutes, employee_out, is_overdue, short_name
from .orders import VALID_REJECT_REASONS

WEIGHTS = {"quality": 0.35, "on_time": 0.25, "no_rework": 0.20, "volume": 0.15, "no_reject": 0.05}
WEIGHT_LABELS = {
    "quality": "Качество (средняя оценка ИИ/мастера)",
    "on_time": "Выполнено в срок",
    "no_rework": "Без доработок и повторных поломок за 7 дней",
    "volume": "Объём и сложность закрытых нарядов",
    "no_reject": "Без необоснованных отказов",
}
FINISHED = {Status.done, Status.ai_review, Status.closed, Status.rework}


def _period_orders(db: Session, start: datetime, end: datetime) -> list[WorkOrder]:
    return db.scalars(
        select(WorkOrder).where(WorkOrder.created_at >= start, WorkOrder.created_at < end)
        .options(selectinload(WorkOrder.assessments), selectinload(WorkOrder.events),
                 selectinload(WorkOrder.fault_code))
    ).all()


def _repeat_failure_ids(db: Session, orders: list[WorkOrder]) -> set[int]:
    """Наряды, после которых в течение 7 дней на том же оборудовании была внеплановая поломка того же шифра."""
    # Исключаем агрегаты с конструктивно обусловленной аварийностью (Конвейер К-3),
    # чтобы не наказывать добросовестных слесарей за дефекты оборудования
    k3_id = db.scalar(select(Equipment.id).where(Equipment.name == "Конвейер К-3"))
    closed = [o for o in orders if o.done_at and o.fault_code_id and (k3_id is None or o.equipment_id != k3_id)]
    if not closed:
        return set()
    lo = min(o.done_at for o in closed)
    later = db.execute(
        select(WorkOrder.equipment_id, WorkOrder.fault_code_id, WorkOrder.created_at)
        .where(WorkOrder.work_type == "unplanned", WorkOrder.created_at >= lo,
               WorkOrder.fault_code_id.is_not(None),
               WorkOrder.equipment_id != k3_id if k3_id else True)
    ).all()
    idx = defaultdict(list)
    for eq, fc, ts in later:
        idx[(eq, fc)].append(ts)
    out = set()
    for o in closed:
        for ts in idx.get((o.equipment_id, o.fault_code_id), []):
            if o.done_at < ts <= o.done_at + timedelta(days=7):
                out.add(o.id)
                break
    return out


def compute_rating(db: Session, start: datetime, end: datetime,
                   brigade_id: int | None = None) -> list[dict]:
    orders = _period_orders(db, start, end)
    repeat_ids = _repeat_failure_ids(db, orders)
    workers = db.scalars(select(Employee).where(Employee.role == Role.worker)
                         .options(selectinload(Employee.brigade))).all()
    if brigade_id:
        workers = [w for w in workers if w.brigade_id == brigade_id]

    # отказы считаем по событиям (исполнитель мог отказаться, а наряд ушёл другому)
    rejects = db.execute(
        select(WorkOrderEvent.actor_id, WorkOrderEvent.reason)
        .where(WorkOrderEvent.action == "reject", WorkOrderEvent.created_at >= start,
               WorkOrderEvent.created_at < end)
    ).all()
    rej_total, rej_bad = defaultdict(int), defaultdict(int)
    for actor_id, reason in rejects:
        rej_total[actor_id] += 1
        if reason not in VALID_REJECT_REASONS:
            rej_bad[actor_id] += 1

    stats = {}
    for w in workers:
        mine = [o for o in orders if o.assignee_id == w.id and o.status in FINISHED]
        scored = [o.assessment.final_score for o in mine if o.assessment]
        on_time = [not is_overdue(o) for o in mine]
        reworked = [o for o in mine if any(e.action == "return_rework" for e in o.events)
                    or o.id in repeat_ids]
        volume = sum((o.fault_code.norm_hours if o.fault_code else 1.0) for o in mine)
        stats[w.id] = {
            "worker": w, "count": len(mine),
            "quality": sum(scored) / len(scored) if scored else 0,
            "on_time": 100 * sum(on_time) / len(on_time) if on_time else 0,
            "rework_share": 100 * len(reworked) / len(mine) if mine else 0,
            "repeat_count": sum(1 for o in mine if o.id in repeat_ids),
            "volume_raw": volume,
            "rejects": rej_total[w.id], "rejects_bad": rej_bad[w.id],
        }

    max_volume = max((s["volume_raw"] for s in stats.values()), default=0) or 1
    out = []
    for s in stats.values():
        handled = s["count"] + s["rejects"]
        comp = {
            "quality": s["quality"],
            "on_time": s["on_time"],
            "no_rework": 100 - s["rework_share"],
            "volume": 100 * s["volume_raw"] / max_volume,
            "no_reject": 100 - (100 * s["rejects_bad"] / handled if handled else 0),
        }
        total = sum(WEIGHTS[k] * v for k, v in comp.items()) if s["count"] else 0
        w = s["worker"]
        out.append({
            **employee_out(w),
            "rating": round(total, 1),
            "components": {k: round(v, 1) for k, v in comp.items()},
            "orders_closed": s["count"], "repeat_failures": s["repeat_count"],
            "rejects": s["rejects"], "rejects_unjustified": s["rejects_bad"],
            "explanation": _explain(w, comp, s) if s["count"] else "Нет закрытых нарядов за период",
        })
    out.sort(key=lambda r: r["rating"], reverse=True)
    for i, r in enumerate(out, 1):
        r["place"] = i
    return out


def _explain(w: Employee, comp: dict, s: dict) -> str:
    """Пояснение исполнителю, из чего сложился рейтинг (LLM-версия — на этапе ИИ)."""
    parts = [f"{WEIGHT_LABELS[k]}: {comp[k]:.0f} × {WEIGHTS[k]:.2f} = {comp[k] * WEIGHTS[k]:.1f}"
             for k in WEIGHTS]
    weakest = min(WEIGHTS, key=lambda k: comp[k])
    return (f"{short_name(w.full_name)}: закрыто {s['count']} нарядов. " + "; ".join(parts)
            + f". Главный резерв роста — «{WEIGHT_LABELS[weakest].lower()}».")


def shift_bounds(day: datetime, shift: str) -> tuple[datetime, datetime]:
    base = day.replace(hour=0, minute=0, second=0, microsecond=0)
    if shift == "night":
        return base + timedelta(hours=20), base + timedelta(days=1, hours=8)
    return base + timedelta(hours=8), base + timedelta(hours=20)


def current_shift() -> tuple[datetime, datetime, str]:
    now = datetime.now()
    if 8 <= now.hour < 20:
        s, e = shift_bounds(now, "day")
        return s, e, "day"
    day = now if now.hour >= 20 else now - timedelta(days=1)
    s, e = shift_bounds(day, "night")
    return s, e, "night"


def shift_report(db: Session, start: datetime, end: datetime) -> dict:
    orders = _period_orders(db, start, end)
    issued = len(orders)
    done = [o for o in orders if o.status in FINISHED]
    closed = [o for o in orders if o.status == Status.closed]
    overdue = [o for o in orders if is_overdue(o)]
    rejected = sum(1 for o in orders if any(e.action == "reject" for e in o.events))
    downtime = sum(downtime_minutes(o) or 0 for o in orders)
    scores = [o.assessment.final_score for o in done if o.assessment]

    load = defaultdict(lambda: {"orders": 0, "minutes": 0.0})
    names = {}
    for o in orders:
        if o.assignee_id:
            load[o.assignee_id]["orders"] += 1
            if o.started_at and o.done_at:
                load[o.assignee_id]["minutes"] += (o.done_at - o.started_at).total_seconds() / 60
    for e in db.scalars(select(Employee).where(Employee.id.in_(list(load)))):
        names[e.id] = short_name(e.full_name)

    by_equipment = defaultdict(int)
    for o in orders:
        if o.work_type == "unplanned" and o.equipment:
            by_equipment[o.equipment.name] += 1

    summary = (
        f"За смену выдано {issued} нарядов, выполнено {len(done)}, закрыто мастером {len(closed)}, "
        f"просрочено {len(overdue)}, отклонений {rejected}. "
        f"Средняя оценка качества — {sum(scores) / len(scores):.0f}/100. " if scores else
        f"За смену выдано {issued} нарядов, выполнено {len(done)}, просрочено {len(overdue)}. "
    )
    if by_equipment:
        top = max(by_equipment, key=by_equipment.get)
        if by_equipment[top] > 1:
            summary += f"Больше всего внеплановых нарядов — {top} ({by_equipment[top]}). "
    summary += f"Суммарный простой оборудования — {downtime / 60:.1f} ч."

    reaction_times = [(o.started_at - o.created_at).total_seconds() / 60
                      for o in orders if o.started_at and o.created_at and o.started_at > o.created_at]
    avg_reaction_min = round(sum(reaction_times) / len(reaction_times), 1) if reaction_times else 0.0

    mttr_times = [(o.done_at - o.started_at).total_seconds() / 3600
                  for o in orders if o.done_at and o.started_at and o.done_at > o.started_at]
    avg_mttr_hours = round(sum(mttr_times) / len(mttr_times), 2) if mttr_times else 0.0

    ftfr = round(sum(1 for o in closed if not any(e.action in ('rework', 'return_rework') for e in o.events)) / len(closed) * 100, 1) if closed else 100.0

    return {
        "period": {"start": start, "end": end},
        "issued": issued, "done": len(done), "closed": len(closed),
        "overdue": len(overdue), "rejected": rejected,
        "downtime_hours": round(downtime / 60, 1),
        "avg_score": round(sum(scores) / len(scores), 1) if scores else None,
        "avg_reaction_min": avg_reaction_min,
        "avg_mttr_hours": avg_mttr_hours,
        "first_time_fix_rate": ftfr,
        "load": sorted([{"worker_id": k, "name": names.get(k, "?"), **v,
                         "minutes": round(v["minutes"])} for k, v in load.items()],
                       key=lambda x: -x["orders"]),
        "overdue_orders": [{"id": o.id, "number": o.number,
                            "equipment": o.equipment.name if o.equipment else "—",
                            "assignee": short_name(o.assignee.full_name) if o.assignee else None}
                           for o in overdue],
        "summary": summary,
    }


def compute_brigade_rating(db: Session, start: datetime, end: datetime) -> list[dict]:
    """Рейтинг производственных бригад (раздел 6.6 и 7 ТЗ)."""
    orders = _period_orders(db, start, end)
    brigades = db.scalars(select(Brigade)).all()
    worker_ratings = {r["id"]: r for r in compute_rating(db, start, end)}

    res = []
    for br in brigades:
        workers = db.scalars(select(Employee).where(Employee.brigade_id == br.id, Employee.role == Role.worker)).all()
        w_ids = {w.id for w in workers}
        br_orders = [o for o in orders if o.assignee_id in w_ids or o.brigade_id == br.id]
        closed = [o for o in br_orders if o.status == Status.closed]

        # Средний рейтинг рабочих бригады
        scores = [worker_ratings[w.id]["rating"] for w in workers if w.id in worker_ratings]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        # Доля закрытых в срок
        on_time = sum(1 for o in closed if o.done_at and o.deadline and o.done_at <= o.deadline)
        on_time_pct = round(on_time / len(closed) * 100, 1) if closed else 100.0

        # Количество возвратов на доработку
        reworks = sum(1 for o in br_orders if any(e.action in ("rework", "return_rework") for e in o.events))

        res.append({
            "id": br.id,
            "name": br.name,
            "workers_count": len(workers),
            "orders_closed": len(closed),
            "score": avg_score,
            "on_time_percent": on_time_pct,
            "rework_count": reworks,
            "explanation": f"Средний балл рабочих: {avg_score}. Нарядов в срок: {on_time_pct}%.",
        })

    res.sort(key=lambda x: (x["score"], x["on_time_percent"]), reverse=True)
    for idx, item in enumerate(res, 1):
        item["place"] = idx
    return res
```

---

### Файл: `frontend/src/App.tsx`

```tsx
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { MasterView } from './pages/MasterView';
import { WorkerView } from './pages/WorkerView';
import { ManagerDashboard } from './pages/ManagerDashboard';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<'master' | 'analytics' | 'rating'>('master');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-emerald-400 font-bold text-sm animate-pulse">
          Загрузка «НарядAI»...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar currentTab={currentTab} setCurrentTab={(tab: any) => setCurrentTab(tab)} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {user.role === 'worker' ? (
          <WorkerView />
        ) : currentTab === 'master' ? (
          <MasterView />
        ) : (
          <ManagerDashboard viewMode={currentTab === 'rating' ? 'rating' : 'analytics'} />
        )}
      </main>

      <footer className="py-3 text-center text-[11px] text-slate-600 border-t border-slate-800">
        «НарядAI» © 2026 АО «Костанайские Минералы» • Qostanai AI Industry Hackathon
      </footer>
    </div>
  );
};
```

---

### Файл: `frontend/src/api.ts`

```typescript
import { WorkOrder, User, NotificationItem, AssistantResponse, Priority } from './types';
import { saveOfflineAction } from './utils/offlineQueue';

export function getApiBaseUrl(): string {
  const host = localStorage.getItem('naryad_api_host');
  if (host && host.trim()) {
    return host.trim().replace(/\/+$/, '');
  }
  // В мобильном окружении Capacitor по умолчанию обращаемся к локальному шлюзу
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'capacitor:' || (window.location.hostname === 'localhost' && !['5173', '8000'].includes(window.location.port))) {
      return 'http://10.42.0.1:8000';
    }
  }
  return '';
}

export function setApiHost(host: string | null): void {
  if (host && host.trim()) {
    localStorage.setItem('naryad_api_host', host.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('naryad_api_host');
  }
}

export function getWsBaseUrl(): string {
  const base = getApiBaseUrl();
  if (base) {
    const wsProto = base.startsWith('https://') ? 'wss://' : 'ws://';
    return base.replace(/^https?:\/\//, wsProto);
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}`;
}

export function getFullApiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}/api${cleanEndpoint}`;
}

export function getToken(): string | null {
  return localStorage.getItem('naryad_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('naryad_token', token);
  } else {
    localStorage.removeItem('naryad_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = getFullApiUrl(endpoint);
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = `Ошибка запроса (${res.status})`;
    try {
      const data = await res.json();
      if (data.detail) errMessage = data.detail;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (login: string, pin: string) => 
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, pin }),
    }),
  getMe: () => request<User>('/auth/me'),
  getDemoUsers: () => request<Array<{ login: string; full_name: string; role: string; specialty: string }>>('/auth/demo-users'),

  // Dictionaries
  getDictionaries: () => request<{
    sections: Array<{ id: number; name: string }>;
    equipment: Array<any>;
    brigades: Array<{ id: number; name: string }>;
    fault_codes: Array<any>;
    materials: Array<any>;
  }>('/dictionaries'),

  // Workers
  getWorkers: () => request<User[]>('/workers'),
  setOnShift: (on_shift: boolean) => request<User>('/workers/me/on-shift', {
    method: 'POST',
    body: JSON.stringify({ on_shift }),
  }),

  // Orders
  getOrders: (params?: { scope?: string; status?: string[]; assignee_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.scope) q.set('scope', params.scope);
    if (params?.assignee_id) q.set('assignee_id', String(params.assignee_id));
    if (params?.status) params.status.forEach(s => q.append('status', s));
    return request<WorkOrder[]>(`/orders?${q.toString()}`);
  },
  getOrder: (id: number) => request<WorkOrder>(`/orders/${id}`),
  createOrder: (data: any) => request<WorkOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  suggestAssignee: (equipment_id: number, description: string) => 
    request<Array<User & { match_score: number; reason: string }>>('/orders/suggest-assignee', {
      method: 'POST',
      body: JSON.stringify({ equipment_id, description }),
    }),

  // Direct action (без авто-очереди, для выполнения очереди синхронизации)
  applyActionDirect: (id: number, action: string, reason?: string, comment?: string, closing?: any) =>
    request<WorkOrder>(`/orders/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason, comment, closing }),
    }),

  // Action с поддержкой офлайн-режима
  applyAction: async (id: number, action: string, reason?: string, comment?: string, closing?: any) => {
    try {
      return await request<WorkOrder>(`/orders/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, reason, comment, closing }),
      });
    } catch (err: any) {
      // При отсутствии сети или сетевом сбое (Failed to fetch) сохраняем в офлайн-очередь
      if (!navigator.onLine || err?.name === 'TypeError' || err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        saveOfflineAction({
          orderId: id,
          action,
          reason,
          comment,
          closing,
        });
        return {
          id,
          status: action === 'complete' ? 'done' : action === 'accept' ? 'accepted' : action === 'start' ? 'in_progress' : action === 'pause' ? 'paused' : action === 'queue' ? 'queued' : 'issued',
          __offline: true,
        } as any;
      }
      throw err;
    }
  },

  uploadPhoto: async (orderId: number, kind: 'before' | 'after', file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('kind', kind);
    formData.append('file', file);
    const res = await fetch(getFullApiUrl(`/orders/${orderId}/photos`), {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Ошибка загрузки фото');
    return res.json();
  },
  setMasterScore: (id: number, score: number, comment?: string) =>
    request<WorkOrder>(`/orders/${id}/master-score`, {
      method: 'POST',
      body: JSON.stringify({ score, comment }),
    }),
  reassignOrder: (id: number, assignee_id: number, comment?: string) =>
    request<WorkOrder>(`/orders/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ assignee_id, comment }),
    }),
  changeOrderPriority: (id: number, priority: Priority, deadline?: string) =>
    request<WorkOrder>(`/orders/${id}/priority`, {
      method: 'POST',
      body: JSON.stringify({ priority, deadline }),
    }),
  cancelOrder: (id: number, reason: string) =>
    request<WorkOrder>(`/orders/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'cancel', reason }),
    }),
  askAssistant: (query: string) =>
    request<AssistantResponse>('/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  readAllNotifications: () => request<{ ok: boolean }>('/notifications/read-all', { method: 'POST' }),

  // Reports & Analytics
  getCounters: () => request<{ shift: string; issued: number; done: number; overdue: number; equipment_down: number }>('/dashboard/counters'),
  getShiftReport: (start?: string, end?: string) => request<any>('/reports/shift'),
  getRating: () => request<any>('/reports/rating'),
  getAnomalies: (days: number = 90) => request<any>(`/analytics/anomalies?days=${days}`),
  getMaterialsReport: (days: number = 30) => request<any>(`/reports/materials?days=${days}`),

  // Smart AI Suggestions & Printing
  suggestFaultCode: (description: string) =>
    request<{
      fault_code_id?: number;
      code?: string;
      name?: string;
      norm_hours?: number;
      confidence?: number;
      reason?: string;
    }>('/orders/suggest-fault-code', {
      method: 'POST',
      body: JSON.stringify({ description }),
    }),
  getOrderPrintUrl: (orderId: number) => {
    const token = getToken();
    return `${getFullApiUrl(`/orders/${orderId}/print`)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // Excel Downloads
  downloadShiftExcel: async () => {
    const token = getToken();
    const res = await fetch(getFullApiUrl('/reports/shift/export/excel'), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Ошибка выгрузки отчёта за смену');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smena_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadRatingExcel: async (days: number = 30) => {
    const token = getToken();
    const res = await fetch(getFullApiUrl(`/reports/rating/export/excel?days=${days}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Ошибка выгрузки рейтинга');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reiting_ispolnitelei_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadMaterialsExcel: async (days: number = 30) => {
    const token = getToken();
    const res = await fetch(getFullApiUrl(`/reports/materials/export/excel?days=${days}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Ошибка выгрузки списания ТМЦ');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tmc_spisanie_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
```

---

### Файл: `frontend/src/pages/MasterView.tsx`

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { WorkOrder, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { NewOrderModal } from '../components/NewOrderModal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { MasterAssistantModal } from '../components/MasterAssistantModal';
import { 
  Plus, Users, AlertTriangle, Clock, CheckCircle2, RefreshCw, 
  ChevronRight, Wrench, ShieldAlert, Sparkles, Search, Filter, X 
} from 'lucide-react';

export const MasterView: React.FC = () => {
  const { lastEvent } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [counters, setCounters] = useState({ shift: 'day', issued: 0, done: 0, overdue: 0, equipment_down: 0 });
  const [loading, setLoading] = useState(true);

  const [showNewModal, setShowNewModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Фильтры (Раздел 5.2 п. 3: участок, оборудование, исполнитель, приоритет)
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      const [ordList, wList, cnt] = await Promise.all([
        api.getOrders({ scope: 'active' }),
        api.getWorkers(),
        api.getCounters(),
      ]);
      setOrders(ordList);
      setWorkers(wList);
      setCounters(cnt);
    } catch (err) {
      console.error('Error fetching master data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Реакция на WebSocket-события (обновление без перезагрузки страницы!)
  useEffect(() => {
    if (lastEvent) {
      fetchData();
    }
  }, [lastEvent, fetchData]);

  const hasActiveFilters = 
    filterSection !== 'all' || 
    filterPriority !== 'all' || 
    filterAssignee !== 'all' || 
    onlyOverdue || 
    searchQuery.trim() !== '';

  const resetFilters = () => {
    setFilterSection('all');
    setFilterPriority('all');
    setFilterAssignee('all');
    setOnlyOverdue(false);
    setSearchQuery('');
  };

  const filteredOrders = orders.filter(o => {
    if (filterSection !== 'all' && o.section?.name !== filterSection) return false;
    if (filterPriority !== 'all' && o.priority !== filterPriority) return false;
    if (filterAssignee !== 'all' && o.assignee?.id !== Number(filterAssignee)) return false;
    if (onlyOverdue && !o.overdue) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = String(o.number ?? '').toLowerCase().includes(q);
      const matchEq = o.equipment?.name?.toLowerCase().includes(q);
      const matchDesc = o.description?.toLowerCase().includes(q);
      const matchAssignee = o.assignee?.short_name?.toLowerCase().includes(q);
      if (!matchNum && !matchEq && !matchDesc && !matchAssignee) return false;
    }
    return true;
  });

  const colNew = filteredOrders.filter(o => o.status === 'issued' || o.status === 'queued' || o.status === 'accepted' || o.status === 'rejected');
  const colProgress = filteredOrders.filter(o => o.status === 'in_progress' || o.status === 'paused');
  const colReview = filteredOrders.filter(o => o.status === 'ai_review' || o.status === 'rework');
  const colDone = filteredOrders.filter(o => o.status === 'closed' || o.status === 'done');
  const rejectedOrders = filteredOrders.filter(o => o.status === 'rejected');

  return (
    <div className="space-y-6">
      
      {/* Верхний блок: Счётчики смены и кнопка создания наряда */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Панель смены мастера</span>
            <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
              Смена: {counters.shift === 'day' ? '☀️ Дневная' : '🌙 Ночная'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Контроль выполнения работ и статусы исполнителей в реальном времени
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAssistantModal(true)}
            className="px-4 py-3 bg-slate-700/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-sm rounded-xl border border-slate-600 transition flex items-center justify-center space-x-2 btn-touch shadow"
            title="Задать вопрос ИИ-ассистенту мастера (раздел 6.7)"
          >
            <Sparkles size={18} className="text-emerald-400" />
            <span>🤖 ИИ-Ассистент мастера</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch"
          >
            <Plus size={20} />
            <span>+ Выдать наряд (≤ 6 нажатий)</span>
          </button>
        </div>
      </div>

      {/* 4 Ключевых счётчика (раздел 5.2 п.4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow flex items-center space-x-3">
          <div className="p-3 bg-blue-950/80 text-blue-400 rounded-xl border border-blue-800">
            <Wrench size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{counters.issued}</div>
            <div className="text-xs text-slate-400 font-medium">Выдано за смену</div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow flex items-center space-x-3">
          <div className="p-3 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">{counters.done}</div>
            <div className="text-xs text-slate-400 font-medium">Выполнено</div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow flex items-center space-x-3">
          <div className="p-3 bg-red-950/80 text-red-400 rounded-xl border border-red-800">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-red-400">{counters.overdue}</div>
            <div className="text-xs text-slate-400 font-medium">Просрочено</div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow flex items-center space-x-3">
          <div className="p-3 bg-amber-950/80 text-amber-400 rounded-xl border border-amber-800">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">{counters.equipment_down}</div>
            <div className="text-xs text-slate-400 font-medium">Оборудование в простое</div>
          </div>
        </div>
      </div>

      {/* Список исполнителей смены с цветовым статусом (раздел 5.2 п.1) */}
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
            <Users size={16} className="text-emerald-400" />
            <span>Статусы исполнителей смены в реальном времени (≤ 5 сек)</span>
          </h3>
          <span className="text-xs text-slate-400">
            На смене: {workers.filter(w => w.on_shift).length} из {workers.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {workers.map((w) => {
            const state = w.live?.state || 'off';
            const colorClass = 
              state === 'free' ? 'border-emerald-700 bg-emerald-950/20 text-emerald-300' :
              state === 'busy' ? 'border-amber-700 bg-amber-950/20 text-amber-300' :
              state === 'queue' ? 'border-blue-700 bg-blue-950/20 text-blue-300' :
              'border-slate-700 bg-slate-900/40 text-slate-400 opacity-60';

            const badgeBg =
              state === 'free' ? 'bg-emerald-500' :
              state === 'busy' ? 'bg-amber-500' :
              state === 'queue' ? 'bg-blue-500' :
              'bg-slate-500';

            return (
              <div key={w.id} className={`p-2.5 rounded-xl border ${colorClass} transition`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${badgeBg} animate-pulse`}></span>
                    <span className="font-bold text-xs text-white">{w.short_name}</span>
                  </div>
                  <span className="text-[10px] font-semibold opacity-90">{w.specialty}</span>
                </div>
                <div className="text-[11px] mt-1 font-medium truncate">
                  {w.live?.label || 'Свободен'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Канбан-доска нарядов смены (раздел 5.2 п.2, п.3) */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-emerald-400 shrink-0" />
            <span className="font-bold text-sm text-slate-200">
              Доска нарядов ({filteredOrders.length})
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 ml-2 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60 transition"
              >
                <X size={12} />
                <span>Сбросить</span>
              </button>
            )}
          </div>

          {/* Фильтры: поиск, участок, приоритет, исполнитель, просроченные */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Текстовый поиск */}
            <div className="relative min-w-[140px] flex-1 sm:flex-initial">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск по агрегату, №..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Фильтр по участку */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Все участки</option>
              <option value="Участок дробления">Дробление</option>
              <option value="Обогатительная фабрика">Обогащение</option>
              <option value="Участок сушки">Сушка</option>
              <option value="Ремонтно-механический цех">РМЦ</option>
            </select>

            {/* Фильтр по приоритету */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Все приоритеты</option>
              <option value="emergency">🚨 Аварийный</option>
              <option value="high">⚠️ Высокий</option>
              <option value="normal">📋 Обычный</option>
              <option value="planned">🛠️ Плановый</option>
            </select>

            {/* Фильтр по исполнителю */}
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Все исполнители</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.short_name} ({w.specialty})</option>
              ))}
            </select>

            {/* Кнопка-тумблер "Только просроченные" */}
            <button
              onClick={() => setOnlyOverdue(!onlyOverdue)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition border flex items-center space-x-1 ${
                onlyOverdue 
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950' 
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <span>🔥 Просроченные</span>
              {orders.filter(o => o.overdue).length > 0 && (
                <span className="ml-1 px-1 bg-red-950 text-red-200 text-[10px] rounded-full">
                  {orders.filter(o => o.overdue).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {rejectedOrders.length > 0 && (
          <div className="bg-red-950/80 border border-red-600 p-4 rounded-2xl flex items-center justify-between text-xs shadow-lg animate-pulse">
            <div className="flex items-center space-x-3 text-red-200">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="font-bold text-sm text-red-100">
                  Внимание! {rejectedOrders.length} наряд(ов) отклонено исполнителями:
                </div>
                <div className="text-red-300">
                  {rejectedOrders.map(o => `№${o.number} (${o.equipment?.name})`).join(', ')}. Нажмите для переназначения на другого слесаря.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOrderId(rejectedOrders[0].id)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow text-xs whitespace-nowrap"
            >
              Переназначить
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Колонка 1: Выданы / В очереди */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center px-1 font-bold text-xs text-blue-400 uppercase tracking-wider">
              <span>Ожидают ({colNew.length})</span>
            </div>
            <div className="space-y-2">
              {colNew.map(o => (
                <OrderCard key={o.id} order={o} onClick={() => setSelectedOrderId(o.id)} />
              ))}
              {colNew.length === 0 && <div className="text-xs text-slate-500 italic p-3 text-center">Нет нарядов</div>}
            </div>
          </div>

          {/* Колонка 2: В работе */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center px-1 font-bold text-xs text-amber-400 uppercase tracking-wider">
              <span>В работе ({colProgress.length})</span>
            </div>
            <div className="space-y-2">
              {colProgress.map(o => (
                <OrderCard key={o.id} order={o} onClick={() => setSelectedOrderId(o.id)} />
              ))}
              {colProgress.length === 0 && <div className="text-xs text-slate-500 italic p-3 text-center">Нет нарядов</div>}
            </div>
          </div>

          {/* Колонка 3: Проверка ИИ / Доработка */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center px-1 font-bold text-xs text-emerald-400 uppercase tracking-wider">
              <span>Проверка ИИ ({colReview.length})</span>
            </div>
            <div className="space-y-2">
              {colReview.map(o => (
                <OrderCard key={o.id} order={o} onClick={() => setSelectedOrderId(o.id)} />
              ))}
              {colReview.length === 0 && <div className="text-xs text-slate-500 italic p-3 text-center">Нет нарядов</div>}
            </div>
          </div>

          {/* Колонка 4: Закрыты мастером */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center px-1 font-bold text-xs text-slate-400 uppercase tracking-wider">
              <span>Закрыты ({colDone.length})</span>
            </div>
            <div className="space-y-2">
              {colDone.map(o => (
                <OrderCard key={o.id} order={o} onClick={() => setSelectedOrderId(o.id)} />
              ))}
              {colDone.length === 0 && <div className="text-xs text-slate-500 italic p-3 text-center">Нет нарядов</div>}
            </div>
          </div>

        </div>
      </div>

      {/* Модальные окна */}
      {showNewModal && (
        <NewOrderModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false);
            fetchData();
          }}
        />
      )}

      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onRefresh={fetchData}
        />
      )}

      {showAssistantModal && (
        <MasterAssistantModal
          onClose={() => setShowAssistantModal(false)}
          onSelectOrder={(id) => {
            setShowAssistantModal(false);
            setSelectedOrderId(id);
          }}
        />
      )}

    </div>
  );
};

// Карточка наряда для канбана
const OrderCard: React.FC<{ order: WorkOrder; onClick: () => void }> = ({ order, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border bg-slate-900/90 hover:bg-slate-900 cursor-pointer transition shadow-sm ${
        order.priority === 'emergency' ? 'border-red-800/80 hover:border-red-600' :
        order.priority === 'high' ? 'border-amber-800/80 hover:border-amber-600' :
        'border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-xs font-bold text-emerald-400">#{order.number}</span>
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
          order.priority === 'emergency' ? 'bg-red-950 text-red-400 border border-red-800' :
          order.priority === 'high' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
          'bg-slate-800 text-slate-300'
        }`}>
          {order.priority_label}
        </span>
      </div>

      {order.status === 'rejected' && (
        <div className="mb-2 p-1.5 bg-red-950/90 border border-red-500 rounded-lg text-[10px] font-bold text-red-200 flex items-center justify-between shadow">
          <span>❌ Отклонён слесарем</span>
          <span className="text-[9px] text-red-300 underline">Переназначить →</span>
        </div>
      )}

      <div className="font-bold text-xs text-white leading-snug line-clamp-1">{order.equipment.name}</div>
      <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">{order.description}</div>

      <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
        <span className="font-semibold text-slate-300">{order.assignee?.short_name || '—'}</span>
        <span className={order.overdue ? 'text-red-400 font-bold' : ''}>
          {order.overdue ? `Просрочен!` : new Date(order.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
```

---

### Файл: `frontend/src/pages/WorkerView.tsx`

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { WorkOrder } from '../types';
import { useAuth } from '../context/AuthContext';
import { CloseOrderModal } from '../components/CloseOrderModal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { 
  CheckCircle, Play, Pause, ListPlus, XCircle, Wrench, 
  Clock, AlertTriangle, Sparkles, Award, ChevronRight, ShieldAlert 
} from 'lucide-react';

export const WorkerView: React.FC = () => {
  const { user, lastEvent, offlineCount, syncOfflineNow } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [ratingData, setRatingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'orders' | 'rating'>('orders');
  const [closingOrder, setClosingOrder] = useState<WorkOrder | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [rejectReasonModal, setRejectReasonModal] = useState<number | null>(null);
  const [pauseReasonModal, setPauseReasonModal] = useState<number | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  const fetchWorkerData = useCallback(async () => {
    if (!user) return;
    try {
      const [ordList, rate] = await Promise.all([
        api.getOrders({ assignee_id: user.id }),
        api.getRating(),
      ]);
      setOrders(ordList);
      setRatingData(rate);
    } catch (err) {
      console.error('Error fetching worker data', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkerData();
  }, [fetchWorkerData]);

  useEffect(() => {
    if (lastEvent) {
      fetchWorkerData();
    }
  }, [lastEvent, fetchWorkerData]);

  const handleAction = async (orderId: number, action: string, reason?: string) => {
    setActionLoading(true);
    setOfflineNotice(null);
    try {
      const res: any = await api.applyAction(orderId, action, reason);
      setRejectReasonModal(null);
      setPauseReasonModal(null);
      setReasonInput('');
      if (res?.__offline) {
        setOfflineNotice('Действие сохранено офлайн и будет передано при восстановлении связи');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: res.status } : o));
      } else {
        await fetchWorkerData();
      }
    } catch (err: any) {
      alert(err.message || 'Ошибка выполнения действия');
    } finally {
      setActionLoading(false);
    }
  };

  // Активный наряд на исполнении (в работе, на паузе или возвращён на доработку)
  const activeOrder = orders.find(o => o.status === 'in_progress' || o.status === 'paused');
  
  // Если наряда в работе нет, берём первый принятый, на доработке или выданный
  const currentOrder = activeOrder || orders.find(o => o.status === 'rework' || o.status === 'accepted' || o.status === 'issued');

  // Все остальные входящие наряды, требующие решения мастера/исполнителя, кроме currentOrder
  const otherIncomingOrders = orders.filter(o => 
    (o.status === 'issued' || o.status === 'accepted' || o.status === 'rework') && o.id !== currentOrder?.id
  );

  const queuedOrders = orders.filter(o => o.status === 'queued');
  const completedOrders = orders.filter(o => o.status === 'closed' || o.status === 'ai_review' || o.status === 'done');

  // Личные данные рейтинга
  const myRating = Array.isArray(ratingData) ? ratingData.find((r: any) => r.id === user?.id) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      
      {/* Шапка сотрудника */}
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>{user?.full_name}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {user?.specialty}, {user?.grade} разряд • {user?.brigade?.name || 'Бригада №1'}
          </p>
        </div>

        {/* Переключатель вкладок: Наряды / Мой рейтинг */}
        <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Наряды
          </button>
          <button
            onClick={() => setActiveTab('rating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              activeTab === 'rating' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Award size={14} />
            <span>Рейтинг</span>
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Уведомление об офлайн-сохранении */}
          {offlineNotice && (
            <div className="p-3 bg-amber-950/80 border border-amber-500 rounded-2xl flex items-center justify-between text-xs text-amber-200">
              <span>📴 {offlineNotice}</span>
              <button
                type="button"
                onClick={() => setOfflineNotice(null)}
                className="text-amber-400 hover:text-white font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Плашка накопленной офлайн-очереди */}
          {offlineCount > 0 && (
            <div className="bg-amber-950/70 border border-amber-600/80 p-3 rounded-2xl flex items-center justify-between shadow text-xs">
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-base">📴</span>
                <div>
                  <span className="font-bold">Офлайн-режим:</span> сохранено {offlineCount} действий в памяти устройства.
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const res = await syncOfflineNow();
                  if (res.synced > 0) {
                    await fetchWorkerData();
                  }
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shadow text-xs"
              >
                Синхронизировать
              </button>
            </div>
          )}

          {/* Главный блок: Текущий активный наряд */}
          {currentOrder ? (
            <div className={`p-5 rounded-2xl border shadow-xl space-y-4 transition ${
              currentOrder.priority === 'emergency' 
                ? 'bg-red-950/20 border-red-800/80 shadow-red-950/30' 
                : 'bg-slate-800 border-slate-700'
            }`}>
              
              {/* Статус и номер */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      НАРЯД #{currentOrder.number}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      currentOrder.priority === 'emergency' ? 'bg-red-600 text-white animate-pulse' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {currentOrder.priority_label}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-1.5">{currentOrder.equipment.name}</h3>
                  <p className="text-xs text-slate-400">{currentOrder.section.name}</p>
                </div>

                <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400">
                  {currentOrder.status_label}
                </span>
              </div>

              {/* Если наряд вернулся на доработку — яркий алерт */}
              {currentOrder.status === 'rework' && (
                <div className="p-3 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-xl flex items-start space-x-2">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-red-100 font-bold mb-0.5">Требует доработки по заключению ИИ:</strong>
                    <span>{currentOrder.assessment?.explanation || 'Устраните замечания и повторно отправьте наряд'}</span>
                  </div>
                </div>
              )}

              {/* Описание проблемы */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 text-xs text-slate-200 leading-relaxed">
                <span className="text-slate-400 font-semibold block mb-0.5">Задача:</span>
                {currentOrder.description}
              </div>

              {/* Срок выполнения */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center space-x-1.5">
                  <Clock size={15} />
                  <span>Срок до: <strong>{new Date(currentOrder.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </span>
                {currentOrder.overdue && (
                  <span className="font-bold text-red-400 animate-pulse">
                    ⚠ Просрочен на {currentOrder.overdue_minutes} мин!
                  </span>
                )}
              </div>

              {/* Крупные кнопки действий под рабочие перчатки (раздел 5.3 п.2) */}
              <div className="pt-2 space-y-2.5">
                
                {/* 1. Если наряд только выдан: Принять / В очередь / Отклонить */}
                {currentOrder.status === 'issued' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAction(currentOrder.id, 'accept')}
                      disabled={actionLoading}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch"
                    >
                      <CheckCircle size={20} />
                      <span>Принять в работу</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAction(currentOrder.id, 'queue')}
                        disabled={actionLoading}
                        className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 btn-touch"
                      >
                        <ListPlus size={16} />
                        <span>Поставить в очередь</span>
                      </button>

                      <button
                        onClick={() => setRejectReasonModal(currentOrder.id)}
                        disabled={actionLoading}
                        className="py-3 bg-slate-700 hover:bg-red-900/80 text-slate-200 hover:text-red-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 btn-touch"
                      >
                        <XCircle size={16} />
                        <span>Отклонить...</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Если наряд принят или на доработке: Начать исполнение */}
                {(currentOrder.status === 'accepted' || currentOrder.status === 'rework') && (
                  <button
                    onClick={() => handleAction(currentOrder.id, 'start')}
                    disabled={actionLoading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch"
                  >
                    <Play size={20} />
                    <span>Начать исполнение</span>
                  </button>
                )}

                {/* 3. Если в работе: Исполнено / Приостановить */}
                {currentOrder.status === 'in_progress' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setClosingOrder(currentOrder)}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch"
                    >
                      <CheckCircle size={22} />
                      <span>Исполнено (закрыть наряд)</span>
                    </button>

                    <button
                      onClick={() => setPauseReasonModal(currentOrder.id)}
                      disabled={actionLoading}
                      className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 btn-touch"
                    >
                      <Pause size={16} />
                      <span>Приостановить смену/работу</span>
                    </button>
                  </div>
                )}

                {/* 4. Если на паузе: Возобновить */}
                {currentOrder.status === 'paused' && (
                  <button
                    onClick={() => handleAction(currentOrder.id, 'resume')}
                    disabled={actionLoading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-base rounded-xl shadow-lg shadow-blue-950 transition flex items-center justify-center space-x-2 btn-touch"
                  >
                    <Play size={22} />
                    <span>Возобновить выполнение</span>
                  </button>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-800">
                <CheckCircle size={24} />
              </div>
              <h3 className="font-bold text-base text-white">Вы свободны</h3>
              <p className="text-xs text-slate-400">
                Новые аварийные и плановые наряды от мастера поступят мгновенно по сети.
              </p>
            </div>
          )}

          {/* Другие входящие наряды (раздел 5.3 п.1: аварийные выделены красным и требуют ответа) */}
          {otherIncomingOrders.length > 0 && (
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert size={16} className="text-amber-400" />
                  <span>Входящие наряды ({otherIncomingOrders.length})</span>
                </div>
                <span className="text-[10px] text-slate-400">Требуют внимания</span>
              </h4>
              <div className="space-y-2.5">
                {otherIncomingOrders.map(inc => (
                  <div
                    key={inc.id}
                    className={`p-3 rounded-xl border transition ${
                      inc.priority === 'emergency' 
                        ? 'bg-red-950/40 border-red-700 shadow-md' 
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-emerald-400 text-xs">#{inc.number}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            inc.priority === 'emergency' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {inc.priority_label}
                          </span>
                          <span className="text-[10px] text-slate-400">{inc.status_label}</span>
                        </div>
                        <strong className="text-white text-xs block mt-1">{inc.equipment.name}</strong>
                        <p className="text-slate-300 text-xs mt-0.5">{inc.description}</p>
                      </div>
                    </div>

                    {/* Кнопки действий для входящего наряда */}
                    <div className="mt-2.5 flex items-center space-x-2">
                      {inc.status === 'issued' ? (
                        <>
                          <button
                            onClick={() => handleAction(inc.id, 'accept')}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition btn-touch"
                          >
                            Принять
                          </button>
                          <button
                            onClick={() => handleAction(inc.id, 'queue')}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition btn-touch"
                          >
                            В очередь
                          </button>
                          <button
                            onClick={() => setRejectReasonModal(inc.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1.5 bg-slate-700 hover:bg-red-900/80 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition btn-touch"
                          >
                            Отклонить
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAction(inc.id, 'start')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition btn-touch"
                        >
                          Начать исполнение
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Очередь нарядов (раздел 5.3 п.4) */}
          {queuedOrders.length > 0 && (
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <ListPlus size={16} className="text-blue-400" />
                <span>Ваша очередь нарядов ({queuedOrders.length})</span>
              </h4>
              <div className="space-y-2">
                {queuedOrders.map(q => (
                  <div key={q.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-emerald-400">#{q.number}</span>
                      <strong className="text-white ml-2">{q.equipment.name}</strong>
                      <p className="text-slate-400 mt-0.5 line-clamp-1">{q.description}</p>
                    </div>
                    <button
                      onClick={() => handleAction(q.id, 'start')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shrink-0"
                    >
                      Взять
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* История закрытых нарядов и отчёты ИИ */}
          {completedOrders.length > 0 && (
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow space-y-3">
              <h4 className="font-bold text-sm text-slate-200">
                Недавно выполненные наряды
              </h4>
              <div className="divide-y divide-slate-700/60">
                {completedOrders.slice(0, 5).map(o => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className="py-3 flex justify-between items-center text-xs cursor-pointer hover:bg-slate-700/30 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-400">#{o.number}</span>
                        <strong className="text-slate-200">{o.equipment.name}</strong>
                      </div>
                      <span className="text-[11px] text-slate-400">{o.status_label}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {o.score !== null && o.score !== undefined && (
                        <span className="font-black text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {o.score}/100
                        </span>
                      )}
                      <ChevronRight size={16} className="text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Вкладка личного рейтинга сотрудника (раздел 6.6) */
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-white">Ваш рейтинг качества</h3>
              <p className="text-xs text-slate-400">Расчёт по прозрачной формуле за 30 дней</p>
            </div>
            {myRating && (
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400">{myRating.rating}</span>
                <span className="text-xs text-slate-400 block font-semibold">Место в смене: #{myRating.place}</span>
              </div>
            )}
          </div>

          {myRating?.components && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Составляющие балла:</h4>
              
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Качество работ (оценка ИИ / мастера):</span>
                    <strong className="text-emerald-400">{myRating.components.quality} / 100</strong>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${myRating.components.quality}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Соблюдение сроков (выполнено вовремя):</span>
                    <strong className="text-emerald-400">{myRating.components.on_time} / 100</strong>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${myRating.components.on_time}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Надёжность (без доработок и повторов за 7 дней):</span>
                    <strong className="text-emerald-400">{myRating.components.no_rework} / 100</strong>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${myRating.components.no_rework}%` }}></div>
                  </div>
                </div>
              </div>

              {myRating.explanation && (
                <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-slate-300 italic">
                  💬 {myRating.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Модалка закрытия наряда */}
      {closingOrder && (
        <CloseOrderModal
          order={closingOrder}
          onClose={() => setClosingOrder(null)}
          onSuccess={() => {
            setClosingOrder(null);
            fetchWorkerData();
          }}
        />
      )}

      {/* Модалка просмотра деталей наряда */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onRefresh={fetchWorkerData}
        />
      )}

      {/* Модалка причины отклонения */}
      {rejectReasonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl max-w-sm w-full space-y-4">
            <h4 className="font-bold text-sm text-white">Причина отклонения наряда</h4>
            <div className="space-y-1.5">
              {['Нет материалов', 'Нет допуска', 'Занят аварийным нарядом', 'Не моя специальность'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReasonInput(r)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl border transition ${
                    reasonInput === r ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectReasonModal(null)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                Отмена
              </button>
              <button
                onClick={() => handleAction(rejectReasonModal, 'reject', reasonInput)}
                disabled={!reasonInput}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Отклонить наряд
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка причины паузы */}
      {pauseReasonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl max-w-sm w-full space-y-4">
            <h4 className="font-bold text-sm text-white">Причина приостановки</h4>
            <div className="space-y-1.5">
              {['Ждёт запчасти со склада', 'Ждёт остановки оборудования', 'Обед / перерыв', 'Переключён на аварийный'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReasonInput(r)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl border transition ${
                    reasonInput === r ? 'bg-amber-950 border-amber-500 text-amber-200' : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setPauseReasonModal(null)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                Отмена
              </button>
              <button
                onClick={() => handleAction(pauseReasonModal, 'pause', reasonInput)}
                disabled={!reasonInput}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Приостановить
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
```

---

### Файл: `frontend/src/pages/LoginPage.tsx`

```tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Wrench, BarChart2, Key, AlertTriangle, ArrowRight, Settings } from 'lucide-react';
import { getApiBaseUrl, setApiHost } from '../api';

export const LoginPage: React.FC = () => {
  const { login, quickSwitch } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverHost, setServerHost] = useState(() => getApiBaseUrl() || '');
  const [isEditingHost, setIsEditingHost] = useState(false);
  const [customHostInput, setCustomHostInput] = useState(() => getApiBaseUrl() || 'http://10.42.0.1:8000');

  const demoAccounts = [
    { login: 'master1', name: 'Исмаилов Марат', role: 'Мастер смены', icon: Shield, color: 'text-emerald-400' },
    { login: 'ahmetov', name: 'Ахметов Ерлан', role: 'Слесарь (свободен)', icon: Wrench, color: 'text-blue-400' },
    { login: 'serikov', name: 'Сериков Данияр', role: 'Слесарь (в работе)', icon: Wrench, color: 'text-amber-400' },
    { login: 'boss', name: 'Сагинтаев Болат', role: 'Главный механик', icon: BarChart2, color: 'text-purple-400' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !pinInput) {
      setError('Введите логин и ПИН-код');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(loginInput, pinInput);
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Логотип */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-emerald-950">
            НAI
          </div>
          <h1 className="text-2xl font-black text-white">«НарядAI»</h1>
          <p className="text-xs text-slate-400">
            АО «Костанайские Минералы» • «Наряд выдан — ИИ на контроле»
          </p>
        </div>

        {/* Форма входа */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200">Вход по логину и ПИН-коду</h2>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Логин</label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="master1 / ahmetov / serikov / boss"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">ПИН-код (демо: 1234)</label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-center text-lg tracking-widest focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-2 btn-touch disabled:opacity-50"
            >
              <Key size={16} />
              <span>{loading ? 'Вход...' : 'Войти в систему'}</span>
            </button>
          </form>

          {/* Быстрый вход для Demo Day */}
          <div className="pt-4 border-t border-slate-700/60 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Быстрый вход для защиты на Demo Day (1 клик):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.login}
                  type="button"
                  onClick={() => quickSwitch(acc.login)}
                  className="p-2.5 bg-slate-900/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 text-left transition flex items-center space-x-2 group"
                >
                  <acc.icon size={16} className={acc.color} />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 truncate">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{acc.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Скачать APK */}
          <div className="pt-3 border-t border-slate-700/60 text-center">
            <a
              href="/media/naryad-ai.apk"
              download
              className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-4 py-2.5 rounded-xl transition shadow"
            >
              <span>📲 Скачать установочный APK (Android)</span>
            </a>
          </div>

          {/* Настройка адреса сервера API (для мобильного приложения / Wi-Fi) */}
          <div className="pt-3 border-t border-slate-700/60 text-xs">
            {isEditingHost ? (
              <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-700">
                <label className="text-slate-300 font-semibold block text-[11px]">
                  Адрес сервера API:
                </label>
                <input
                  type="text"
                  value={customHostInput}
                  onChange={(e) => setCustomHostInput(e.target.value)}
                  placeholder="Например: http://10.42.0.1:8000"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomHostInput('');
                      setApiHost(null);
                      setServerHost('');
                      setIsEditingHost(false);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                  >
                    Сбросить (авто)
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingHost(false)}
                      className="px-2.5 py-1 text-slate-400 hover:text-white text-xs"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setApiHost(customHostInput);
                        setServerHost(customHostInput);
                        setIsEditingHost(false);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-slate-400 px-1">
                <span className="truncate text-[11px] flex items-center space-x-1">
                  <Settings size={12} className="text-slate-500" />
                  <span>Сервер:</span>
                  <span className="font-mono text-slate-300 truncate max-w-[170px]">
                    {serverHost || 'авто (текущий хост)'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomHostInput(getApiBaseUrl() || (window.location.origin.includes('localhost') ? 'http://10.42.0.1:8000' : window.location.origin));
                    setIsEditingHost(true);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold underline ml-2"
                >
                  Изменить
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
```

---

### Файл: `frontend/src/utils/offlineQueue.ts`

```typescript
/**
 * Очередь офлайн-действий исполнителя (Раздел 5.4, п. 5 ТЗ):
 * Сохранение действий при отсутствии связи (под землей, в экранированных цехах)
 * и автоматическая фоновая синхронизация при восстановлении сети.
 */

export interface OfflineAction {
  id: string;
  orderId: number;
  orderNumber?: number;
  action: string;
  reason?: string;
  comment?: string;
  closing?: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}

const STORAGE_KEY = 'naryad_offline_actions';
type Listener = (queue: OfflineAction[]) => void;
const listeners: Set<Listener> = new Set();

function notifyListeners(queue: OfflineAction[]) {
  listeners.forEach((fn) => {
    try {
      fn(queue);
    } catch (e) {
      console.error('Offline queue listener error', e);
    }
  });
}

export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineAction(item: Omit<OfflineAction, 'id' | 'createdAt' | 'status'>): OfflineAction {
  const queue = getOfflineQueue();
  const newAction: OfflineAction = {
    ...item,
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  queue.push(newAction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  notifyListeners(queue);
  return newAction;
}

export function removeOfflineAction(id: string): void {
  const queue = getOfflineQueue().filter((x) => x.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  notifyListeners(queue);
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifyListeners([]);
}

export function subscribeOfflineQueue(listener: Listener): () => void {
  listeners.add(listener);
  listener(getOfflineQueue());
  return () => {
    listeners.delete(listener);
  };
}

let isSyncing = false;

export async function syncOfflineQueue(
  applyActionFn: (
    id: number,
    action: string,
    reason?: string,
    comment?: string,
    closing?: any
  ) => Promise<any>
): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    for (const item of [...queue]) {
      try {
        await applyActionFn(
          item.orderId,
          item.action,
          item.reason,
          item.comment,
          item.closing
        );
        removeOfflineAction(item.id);
        synced++;
      } catch (err: any) {
        // Если статус уже перешёл (409 Conflict), действие уже применено на сервере
        if (err?.message?.includes('409') || err?.message?.includes('Нельзя выполнить')) {
          removeOfflineAction(item.id);
          synced++;
        } else if (err?.name === 'TypeError' || !navigator.onLine) {
          // Сеть всё ещё недоступна, прерываем цикл синхронизации до следующей попытки
          failed++;
          break;
        } else {
          // Ошибка валидации или прав
          const current = getOfflineQueue();
          const target = current.find((x) => x.id === item.id);
          if (target) {
            target.status = 'failed';
            target.errorMessage = err?.message || 'Ошибка синхронизации';
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
            notifyListeners(current);
          }
          failed++;
        }
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}
```

---

### Файл: `frontend/src/utils/i18n.ts`

```typescript
export type Lang = 'ru' | 'kz';

export const translations = {
  ru: {
    appName: 'НарядAI',
    slogan: '«Наряд выдан — ИИ на контроле»',
    orgName: 'АО «Костанайские Минералы»',
    // Tabs
    tabMaster: 'Панель смены',
    tabAnalytics: 'ИИ-Аналитика и аномалии',
    tabRating: 'Рейтинг и смена',
    tabWorkerOrders: 'Наряды',
    tabWorkerRating: 'Рейтинг',
    // Actions
    issueOrder: '+ Выдать наряд (≤ 6 нажатий)',
    accept: 'Принять в работу',
    queue: 'Поставить в очередь',
    start: 'Начать исполнение',
    pause: 'Приостановить смену/работу',
    resume: 'Возобновить выполнение',
    done: 'Исполнено (закрыть наряд)',
    reject: 'Отклонить...',
    approve: 'Подтвердить и закрыть наряд',
    rework: 'На доработку',
    // Statuses
    status_issued: 'Выдан',
    status_queued: 'В очереди',
    status_accepted: 'Принят',
    status_in_progress: 'В работе',
    status_paused: 'Приостановлен',
    status_done: 'Исполнено',
    status_ai_review: 'Проверка ИИ',
    status_rework: 'На доработке',
    status_closed: 'Закрыт',
    status_cancelled: 'Отменён',
    status_rejected: 'Отклонён',
    // Priorities
    emergency: 'Аварийный',
    high: 'Высокий',
    normal: 'Обычный',
    planned: 'Плановый',
    // Network & audio
    online: 'В сети (WebSocket)',
    offline: 'Офлайн (нет сети)',
    soundOn: 'Звук вкл',
    soundMuted: 'Звук выкл',
    testSound: 'Тест сигнала',
    // Offline queue & server
    offlineSync: 'Синхронизировать',
    offlineActionsCount: 'действий в памяти',
    serverHost: 'Сервер',
    change: 'Изменить',
    save: 'Сохранить',
    cancel: 'Отмена',
    // Reports & UI
    myRating: 'Мой рейтинг',
    shiftReport: 'Сменный отчёт',
    downloadExcel: 'Скачать Excel',
    printOrder: 'Печать наряда (PDF/HTML)',
    aiAssistant: 'ИИ-Ассистент мастера',
    filter: 'Фильтр',
    all: 'Все',
    search: 'Поиск',
    equipment: 'Оборудование',
    executor: 'Исполнитель',
    deadline: 'Срок',
    section: 'Участок',
    materials: 'Материалы (ТМЦ)',
    photos: 'Фотоотчёт',
  },
  kz: {
    appName: 'НарядAI',
    slogan: '«Наряд берілді — ЖИ бақылауда»',
    orgName: '«Қостанай минералдары» АҚ',
    // Tabs
    tabMaster: 'Ауысым тақтасы',
    tabAnalytics: 'ЖИ-Аналитика және аномалиялар',
    tabRating: 'Рейтинг және ауысым',
    tabWorkerOrders: 'Нарядтар',
    tabWorkerRating: 'Рейтинг',
    // Actions
    issueOrder: '+ Наряд беру (≤ 6 басу)',
    accept: 'Жұмысқа қабылдау',
    queue: 'Кезекке қою',
    start: 'Орындауды бастау',
    pause: 'Жұмысты тоқтата тұру',
    resume: 'Жұмысты жалғастыру',
    done: 'Орындалды (нарядты жабу)',
    reject: 'Бас тарту...',
    approve: 'Растау және нарядты жабу',
    rework: 'Қайта қарауға жіберу',
    // Statuses
    status_issued: 'Берілді',
    status_queued: 'Кезекте',
    status_accepted: 'Қабылданды',
    status_in_progress: 'Жұмыста',
    status_paused: 'Тоқтатылды',
    status_done: 'Орындалды',
    status_ai_review: 'ЖИ тексеруі',
    status_rework: 'Қайта қарауда',
    status_closed: 'Жабылды',
    status_cancelled: 'Болдырылмады',
    status_rejected: 'Бас тартылды',
    // Priorities
    emergency: 'Апаттық',
    high: 'Жоғары',
    normal: 'Қалыпты',
    planned: 'Жоспарлы',
    // Network & audio
    online: 'Желіде (WebSocket)',
    offline: 'Офлайн (байланыс жоқ)',
    soundOn: 'Дыбыс қосулы',
    soundMuted: 'Дыбыс өшірулі',
    testSound: 'Дыбысты тексеру',
    // Offline queue & server
    offlineSync: 'Синхрондау',
    offlineActionsCount: 'әрекет сақталды',
    serverHost: 'Сервер',
    change: 'Өзгерту',
    save: 'Сақтау',
    cancel: 'Бас тарту',
    // Reports & UI
    myRating: 'Менің рейтингім',
    shiftReport: 'Ауысым есебі',
    downloadExcel: 'Excel жүктеу',
    printOrder: 'Нарядты басып шығару (PDF/HTML)',
    aiAssistant: 'Шебердің ЖИ-көмекшісі',
    filter: 'Сүзгі',
    all: 'Барлығы',
    search: 'Іздеу',
    equipment: 'Жабдық',
    executor: 'Орындаушы',
    deadline: 'Мерзімі',
    section: 'Бөлімше',
    materials: 'Материалдар (ТМҚ)',
    photos: 'Фотоесеп',
  },
};
```

---

### Файл: `WINDOWS_GUIDE.md`

```markdown
# Руководство по запуску «НарядAI» на Windows 11

Система «НарядAI» полностью кроссплатформенна и поддерживает 4 удобных сценария запуска на Windows 11.

---

## ⚡ Вариант 1: Без установки на Windows (Прямой доступ по локальной сети)

Если текущая машина с Linux и ваш ПК с Windows 11 (или смартфон) подключены к одной Wi-Fi сети / роутеру:
1. На Windows 11 откройте любой браузер (Chrome, Edge, Firefox, Yandex).
2. Перейдите по адресу:
   ```
   http://192.168.3.81:8000
   ```
3. Сайт откроется сразу, без необходимости устанавливать Python или Node.js на Windows!
4. **Учётные записи для демо (ПИН у всех: 1234):**
   - **Мастер смены:** `master1` (Исмаилов М.К.)
   - **Слесарь (свободен):** `ahmetov` (Ахметов Е.С.)
   - **Слесарь (брак/повторы):** `serikov` (Сериков Д.К.)
   - **Главный механик:** `boss` (Сагинтаев Б.А.)

---

## 🚀 Вариант 2: Запуск в 1 клик через `run_windows.bat` (Нативно на Windows 11)

Если вы хотите запускать проект автономно прямо на Windows 11:

### 1. Подготовка (требуется 1 раз):
- Установите **Python 3.11 или 3.12** с сайта [python.org](https://www.python.org/downloads/).
  > ⚠️ **Важно:** Во время установки обязательно поставьте галочку **"Add Python to PATH"**!
- (Опционально) Установите **Node.js LTS** с [nodejs.org](https://nodejs.org/), если хотите пересобирать фронтенд с нуля.

### 2. Запуск:
- Скопируйте папку с проектом `naryad-ai` на диск Windows (например, в `C:\Projects\naryad-ai`).
- Дважды кликните по файлу **`run_windows.bat`** (или запустите `run_windows.ps1` в PowerShell).
- Скрипт автоматически:
  1. Создаст виртуальное окружение `backend\.venv`.
  2. Установит все библиотеки из `requirements.txt`.
  3. Сгенерирует базу данных `naryad.db` с 600+ нарядами за 92 дня.
  4. Проверит сборку интерфейса.
  5. Откроет браузер на `http://localhost:8000` и запустит сервер.

---

## 🐧 Вариант 3: Запуск через WSL2 (Ubuntu в Windows 11 — Рекомендуется для разработчиков)

Windows 11 имеет встроенную поддержку WSL2 (полноценное ядро Linux). Это самый стабильный способ работы.

1. Откройте **Терминал Windows** (PowerShell от имени администратора) и установите WSL, если ещё не установлен:
   ```powershell
   wsl --install
   ```
2. Откройте Ubuntu внутри Windows 11 (`wsl`).
3. Перейдите в папку проекта:
   ```bash
   cd /mnt/c/Projects/naryad-ai
   # или склонируйте репозиторий прямо внутрь WSL:
   # git clone ...
   ```
4. Запустите скрипт:
   ```bash
   ./run.sh
   ```
5. В Windows 11 откройте браузер: `http://localhost:8000`. Порт пробрасывается из WSL2 в Windows автоматически!

---

## 🐳 Вариант 4: Запуск через Docker Desktop на Windows 11

1. Установите [Docker Desktop для Windows](https://www.docker.com/products/docker-desktop/) (с бэкендом WSL2).
2. Запустите Docker Desktop.
3. В папке проекта выполните в терминале:
   ```powershell
   docker compose up --build
   ```
4. Откройте `http://localhost:8000`.
```

---

### Файл: `backend/app/__init__.py`

```python

```

---

### Файл: `backend/app/auth.py`

```python
"""Вход по логину и ПИН-коду, JWT, проверка ролей."""
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import JWT_SECRET, JWT_TTL_HOURS
from .db import get_db
from .models import Employee, Role

_bearer = HTTPBearer(auto_error=False)


def hash_pin(pin: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", pin.encode(), salt, 100_000)
    return f"{salt.hex()}${digest.hex()}"


def verify_pin(pin: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split("$")
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac("sha256", pin.encode(), bytes.fromhex(salt_hex), 100_000)
    return hmac.compare_digest(digest.hex(), digest_hex)


def create_token(user: Employee) -> str:
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_TTL_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> int | None:
    try:
        return int(jwt.decode(token, JWT_SECRET, algorithms=["HS256"])["sub"])
    except Exception:
        return None


def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Employee:
    user_id = decode_token(creds.credentials) if creds else None
    user = db.get(Employee, user_id) if user_id else None
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Требуется вход")
    return user


def require_roles(*roles: Role):
    allowed = {r.value for r in roles}

    def dep(user: Employee = Depends(current_user)) -> Employee:
        if user.role not in allowed:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Недостаточно прав для этой роли")
        return user

    return dep
```

---

### Файл: `backend/app/config.py`

```python
"""Настройки приложения (читаются из переменных окружения)."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# По умолчанию SQLite — чтобы проект запускался без Docker.
# Для PostgreSQL: DATABASE_URL=postgresql+psycopg://naryad:naryad@localhost:5432/naryad
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'naryad.db'}")

JWT_SECRET = os.getenv("JWT_SECRET", "naryad-ai-kostanai-minerals-production-secret-key-32b")
JWT_TTL_HOURS = int(os.getenv("JWT_TTL_HOURS", "24"))

MEDIA_DIR = Path(os.getenv("MEDIA_DIR", BASE_DIR / "media"))
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# Фото: максимальная сторона и качество JPEG после сжатия
PHOTO_MAX_SIDE = int(os.getenv("PHOTO_MAX_SIDE", "1600"))
PHOTO_JPEG_QUALITY = int(os.getenv("PHOTO_JPEG_QUALITY", "75"))

# Контроль сроков (раздел 6.1 кейса)
DEADLINE_CHECK_INTERVAL_SEC = int(os.getenv("DEADLINE_CHECK_INTERVAL_SEC", "30"))
REMIND_BEFORE_MIN = int(os.getenv("REMIND_BEFORE_MIN", "30"))
ACCEPT_TIMEOUT_MIN = int(os.getenv("ACCEPT_TIMEOUT_MIN", "10"))
ACCEPT_TIMEOUT_EMERGENCY_MIN = int(os.getenv("ACCEPT_TIMEOUT_EMERGENCY_MIN", "3"))
OVERDUE_REPEAT_MIN = int(os.getenv("OVERDUE_REPEAT_MIN", "30"))

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
```

---

### Файл: `backend/app/db.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### Файл: `backend/app/realtime.py`

```python
"""Реальное время: WebSocket-рассылка событий (требование ≤ 5 с)."""
import asyncio
import json
import logging
from collections import defaultdict

import anyio
from fastapi import WebSocket

log = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self._conns: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, user_id: int, ws: WebSocket) -> None:
        await ws.accept()
        self._conns[user_id].add(ws)

    def disconnect(self, user_id: int, ws: WebSocket) -> None:
        self._conns[user_id].discard(ws)

    async def _send(self, ws: WebSocket, data: str) -> bool:
        try:
            await ws.send_text(data)
            return True
        except Exception:
            return False

    async def send_to(self, user_id: int, message: dict) -> None:
        data = json.dumps(message, ensure_ascii=False, default=str)
        dead = [ws for ws in list(self._conns.get(user_id, ())) if not await self._send(ws, data)]
        for ws in dead:
            self.disconnect(user_id, ws)

    async def broadcast(self, message: dict) -> None:
        data = json.dumps(message, ensure_ascii=False, default=str)
        for user_id, sockets in list(self._conns.items()):
            for ws in list(sockets):
                if not await self._send(ws, data):
                    self.disconnect(user_id, ws)

    @property
    def online_user_ids(self) -> set[int]:
        return {uid for uid, s in self._conns.items() if s}


manager = ConnectionManager()


def emit(coro_fn, *args) -> None:
    """Вызов async-рассылки из синхронного кода (эндпоинты FastAPI в threadpool или фоновые задачи)."""
    try:
        anyio.from_thread.run(coro_fn, *args)
        return
    except Exception:
        pass
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(coro_fn(*args))
    except RuntimeError:
        log.debug("emit: нет event loop, событие пропущено")
```

---

### Файл: `backend/app/routers/__init__.py`

```python

```

---

### Файл: `backend/app/serializers.py`

```python
"""Преобразование ORM-объектов в JSON для API и подписи на русском."""
from datetime import datetime

from .models import (
    AIAssessment,
    Employee,
    Equipment,
    Photo,
    Status,
    WorkOrder,
    WorkOrderEvent,
)

STATUS_LABELS = {
    Status.issued: "Выдан",
    Status.queued: "В очереди",
    Status.accepted: "Принят",
    Status.rejected: "Отклонён",
    Status.in_progress: "В работе",
    Status.paused: "Приостановлен",
    Status.done: "Исполнено",
    Status.ai_review: "Проверка ИИ",
    Status.rework: "На доработке",
    Status.closed: "Закрыт",
    Status.cancelled: "Отменён",
}

PRIORITY_LABELS = {
    "emergency": "Аварийный",
    "high": "Высокий",
    "normal": "Обычный",
    "planned": "Плановый",
}

VERDICT_LABELS = {
    "accepted": "Принято",
    "accepted_with_remarks": "Принято с замечаниями",
    "needs_rework": "Требует доработки",
}

ACTION_LABELS = {
    "issued": "Наряд выдан",
    "accept": "Принят в работу",
    "queue": "Поставлен в очередь",
    "auto_accept": "Взят из очереди",
    "reject": "Отклонён",
    "start": "Начато исполнение",
    "pause": "Приостановлен",
    "resume": "Возобновлён",
    "complete": "Исполнено",
    "ai_review": "Проверка ИИ",
    "ai_verdict": "Вердикт ИИ",
    "approve": "Закрыт мастером",
    "return_rework": "Возвращён на доработку",
    "reassign": "Переназначен",
    "cancel": "Отменён",
    "change_priority": "Изменён приоритет",
    "master_score": "Мастер изменил оценку",
}


def short_name(full_name: str) -> str:
    """«Ахметов Ерлан Серикович» → «Ахметов Е.»"""
    parts = full_name.split()
    return f"{parts[0]} {parts[1][0]}." if len(parts) > 1 else full_name


def employee_brief(e: Employee | None) -> dict | None:
    if not e:
        return None
    return {"id": e.id, "full_name": e.full_name, "short_name": short_name(e.full_name),
            "specialty": e.specialty}


def employee_out(e: Employee) -> dict:
    return {
        "id": e.id, "full_name": e.full_name, "short_name": short_name(e.full_name),
        "specialty": e.specialty, "grade": e.grade, "role": e.role, "shift": e.shift,
        "on_shift": e.on_shift, "login": e.login,
        "brigade": {"id": e.brigade.id, "name": e.brigade.name} if e.brigade else None,
    }


def equipment_out(eq: Equipment) -> dict:
    return {"id": eq.id, "name": eq.name, "inv_no": eq.inv_no, "type": eq.type,
            "criticality": eq.criticality, "section_id": eq.section_id,
            "section": eq.section.name if eq.section else None,
            "qr_code": eq.qr_code}


def photo_out(p: Photo) -> dict:
    return {"id": p.id, "kind": p.kind, "url": f"/media/{p.file_path}",
            "taken_at": p.taken_at, "uploaded_at": p.uploaded_at, "author_id": p.author_id}


def event_out(ev: WorkOrderEvent) -> dict:
    return {
        "id": ev.id, "action": ev.action, "action_label": ACTION_LABELS.get(ev.action, ev.action),
        "from_status": ev.from_status, "to_status": ev.to_status,
        "comment": ev.comment, "reason": ev.reason, "created_at": ev.created_at,
        "actor": employee_brief(ev.actor) if ev.actor else {"id": None, "short_name": "ИИ / система"},
    }


def assessment_out(a: AIAssessment | None) -> dict | None:
    if not a:
        return None
    return {
        "id": a.id, "verdict": a.verdict, "verdict_label": VERDICT_LABELS.get(a.verdict, a.verdict),
        "score": a.score, "final_score": a.final_score, "photo_score": a.photo_score,
        "explanation": a.explanation, "worker_report": a.worker_report, "details": a.details,
        "needs_master_check": a.needs_master_check, "master_score": a.master_score,
        "master_comment": a.master_comment, "created_at": a.created_at,
    }


def is_overdue(o: WorkOrder, at: datetime | None = None) -> bool:
    at = at or datetime.now()
    if o.status in (Status.closed, Status.cancelled):
        return bool(o.done_at and o.done_at > o.deadline)
    if o.status in (Status.done, Status.ai_review):
        return bool(o.done_at and o.done_at > o.deadline)
    return at > o.deadline


def work_minutes(o: WorkOrder) -> float | None:
    """Чистое время работы: от начала до «Исполнено» минус паузы."""
    if not o.started_at or not o.done_at:
        return None
    return max(0.0, (o.done_at - o.started_at).total_seconds() / 60 - (o.paused_minutes or 0))


def order_brief(o: WorkOrder) -> dict:
    now = datetime.now()
    overdue = is_overdue(o, now)
    sec_data = {"id": o.section.id, "name": o.section.name} if o.section else {"id": 0, "name": "Не указан"}
    eq_data = {"id": o.equipment.id, "name": o.equipment.name, "inv_no": o.equipment.inv_no} if o.equipment else {"id": 0, "name": "Не указано", "inv_no": "—"}
    return {
        "id": o.id, "number": o.number, "work_type": o.work_type, "priority": o.priority,
        "priority_label": PRIORITY_LABELS.get(o.priority, str(o.priority)),
        "status": o.status, "status_label": STATUS_LABELS.get(o.status, str(o.status)),
        "description": o.description,
        "section": sec_data,
        "equipment": eq_data,
        "assignee": employee_brief(o.assignee),
        "master": employee_brief(o.master),
        "deadline": o.deadline, "created_at": o.created_at,
        "started_at": o.started_at, "done_at": o.done_at, "closed_at": o.closed_at,
        "overdue": overdue,
        "overdue_minutes": round((now - o.deadline).total_seconds() / 60) if overdue and o.status
        not in (Status.closed, Status.cancelled, Status.done, Status.ai_review) else 0,
        "has_photo_before": any(p.kind == "before" for p in o.photos),
        "score": o.assessment.final_score if o.assessment else None,
        "verdict": o.assessment.verdict if o.assessment else None,
    }


def order_full(o: WorkOrder) -> dict:
    data = order_brief(o)
    data.update({
        "comment": o.comment,
        "work_done": o.work_done,
        "close_comment": o.close_comment,
        "fault_code": ({"id": o.fault_code.id, "code": o.fault_code.code, "name": o.fault_code.name,
                        "norm_hours": o.fault_code.norm_hours} if o.fault_code else None),
        "materials": [{"id": m.id, "material_id": m.material_id,
                       "name": m.material.name if m.material else f"Материал #{m.material_id}",
                       "unit": m.material.unit if m.material else "ед.",
                       "qty": m.qty} for m in (o.materials or [])],
        "photos": [photo_out(p) for p in o.photos],
        "events": [event_out(e) for e in o.events],
        "assessment": assessment_out(o.assessment),
        "accepted_at": o.accepted_at, "queued_at": o.queued_at,
        "work_minutes": work_minutes(o),
        "paused_minutes": o.paused_minutes,
        "downtime_minutes": downtime_minutes(o),
    })
    return data


def downtime_minutes(o: WorkOrder) -> float | None:
    """Простой оборудования по внеплановому наряду: от выдачи до «Исполнено» (или до текущего момента)."""
    if o.work_type != "unplanned":
        return None
    end = o.done_at or (None if o.status in (Status.cancelled,) else datetime.now())
    if not end:
        return None
    return round((end - o.created_at).total_seconds() / 60)
```

---

### Файл: `backend/app/services/__init__.py`

```python

```

---

### Файл: `backend/app/services/ai_nlp.py`

```python
"""Автономный ИИ-модуль анализа технического текста (NLP) для предприятий ГМК.

Работает на борту (on-premise), без облачных API и подписок.
Использует предметную онтологию горно-обогатительного производства
АО «Костанайские Минералы»:
- Автоматический подбор шифра неисправности и норматива времени по описанию;
- Оценка семантического соответствия выполненных работ заявленной неисправности;
- Расширенная синонимия и ассоциативные связи узлов и технологических операций.
"""
from __future__ import annotations

import re
from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import FaultCode

# Стоп-слова русского языка
STOP_WORDS = {
    "и", "в", "во", "не", "что", "он", "на", "я", "с", "со", "как", "а", "то",
    "все", "она", "так", "его", "но", "да", "ты", "к", "у", "же", "вы", "за",
    "бы", "по", "только", "ее", "мне", "было", "вот", "от", "меня", "еще", "нет",
    "о", "из", "ему", "теперь", "когда", "даже", "ну", "вдруг", "ли", "если",
    "уже", "или", "ни", "быть", "был", "него", "до", "вас", "нибудь", "опять",
    "уж", "вам", "ведь", "там", "потом", "себя", "ничего", "ей", "может", "они",
    "тут", "где", "есть", "надо", "ней", "для", "мы", "тебя", "их", "чем", "была",
    "сам", "чтоб", "без", "будто", "чего", "раз", "тоже", "себе", "под", "будет",
    "ж", "тогда", "кто", "этот", "того", "потому", "этого", "какой", "совсем",
    "ним", "здесь", "этом", "один", "почти", "мой", "тем", "чтобы", "нее", "сейчас",
    "были", "куда", "зачем", "всех", "никогда", "можно", "при", "наконец", "два",
    "об", "другой", "хоть", "после", "над", "больше", "тот", "через", "эти", "нас",
    "про", "всего", "них", "какая", "много", "разве", "три", "эту", "моя", "впрочем",
    "хорошо", "свою", "этой", "перед", "иногда", "лучше", "чуть", "том", "нельзя",
}

# Предметная онтология: группы понятий и семантические ассоциации
DOMAIN_SYNONYMS: dict[str, set[str]] = {
    "масло_течь": {
        "масл", "течь", "подтек", "утечк", "капает", "давлен", "уплотн", "манжет",
        "сальник", "прокладк", "штуцер", "гидравл", "рвд", "шланг", "поддон", "слив",
        "фильтр", "долив", "уровен", "насос", "маслостанц"
    },
    "подшипник_нагрев": {
        "подшипник", "нагрев", "горяч", "температур", "люфт", "вибрац", "гул", "шум",
        "стук", "вал", "опор", "букс", "корпус", "смазк", "литол", "смазан", "скрип",
        "сепаратор", "обойм", "перегрев"
    },
    "лента_конвейер": {
        "лент", "конвейер", "транспортер", "порыв", "разрыв", "срез", "ролик", "роликоопор",
        "барабан", "натяжк", "натяжн", "скребок", "стык", "вулканизац", "перекос", "сход",
        "борт", "направля", "футеровк"
    },
    "редуктор_привод": {
        "редуктор", "привод", "шестерн", "зубчат", "зацеплен", "муфт", "полумуфт", "палец",
        "втулк", "вал", "соосност", "центровк", "стук", "масло", "уровень"
    },
    "броня_футеровка": {
        "футеровк", "броня", "бронеплит", "плит", "износ", "истиран", "трещин", "скол",
        "замен", "болт", "креплен", "дроблен", "щека", "конус", "молотк"
    },
    "вибрация_крепеж": {
        "вибрац", "крепеж", "болт", "гайк", "ослабл", "шат", "станин", "основан", "анкер",
        "протяжк", "затяжк", "момент", "динамометр"
    },
    "электрика_двигатель": {
        "электр", "двигател", "мотор", "электромотор", "обмотк", "кз", "замыкан", "пробой",
        "изоляц", "мегаомметр", "клемм", "напряжен", "ток", "фаз", "перекос", "искр",
        "не запускает", "гудит", "греется", "статор", "ротор"
    },
    "кабель_питание": {
        "кабел", "провод", "питан", "обрыв", "поврежден", "изоляц", "жил", "муфт", "заземлен",
        "броня", "прокладк", "трасс"
    },
    "пускатель_автомат": {
        "пускател", "автомат", "контактор", "реле", "выключател", "щит", "кнопк", "пост",
        "управлен", "срабатыва", "выбива", "контакт", "подгар", "катушк"
    },
    "датчик_автоматика": {
        "датчик", "кип", "сигнал", "показан", "бесконтактн", "индуктивн", "давлен",
        "температур", "скорост", "подпор", "калибровк", "юстировк", "обрыв"
    },
    "сварка_металл": {
        "сварк", "сварщик", "трещин", "разрыв", "лопнул", "шов", "электрод", "металлоконструк",
        "рама", "косынк", "усилен", "провар", "зачистк"
    },
    "пневматика_воздух": {
        "пневм", "воздух", "компрессор", "цилиндр", "клапан", "трасс", "утечк", "шипит",
        "манометр", "фитинг", "дроссел"
    },
    "смазка_узлов": {
        "смазк", "шприц", "шприцеван", "тавотниц", "масленк", "литол", "солидол", "масло",
        "загрязнен", "промывк", "замен"
    },
}

# Привязка категорий онтологии к шифрам неисправностей справочника
CODE_MAP: list[tuple[str, str, float, list[str]]] = [
    ("Г-01", "Течь масла / гидрожидкости", 2.0, ["масло_течь"]),
    ("Г-02", "Отказ гидронасоса", 4.0, ["масло_течь"]),
    ("Г-03", "Повреждение РВД", 1.5, ["масло_течь"]),
    ("М-02", "Разрушение подшипника", 3.0, ["подшипник_нагрев"]),
    ("М-04", "Порыв конвейерной ленты", 5.0, ["лента_конвейер"]),
    ("М-03", "Износ роликов / барабана", 2.0, ["лента_конвейер"]),
    ("М-05", "Неисправность редуктора", 6.0, ["редуктор_привод"]),
    ("М-01", "Износ футеровки / бронеплит", 4.0, ["броня_футеровка"]),
    ("М-06", "Ослабление крепежа, вибрация", 1.5, ["вибрация_крепеж"]),
    ("М-07", "Трещина металлоконструкции", 3.0, ["сварка_металл"]),
    ("М-08", "Износ зубчатой передачи", 5.0, ["редуктор_привод"]),
    ("Э-01", "Отказ электродвигателя", 4.0, ["электрика_двигатель"]),
    ("Э-02", "Повреждение кабеля", 2.0, ["кабель_питание"]),
    ("Э-03", "Неисправность пускателя / автомата", 1.5, ["пускатель_автомат"]),
    ("Э-04", "Отказ датчика", 1.0, ["датчик_автоматика"]),
    ("Э-05", "Неисправность освещения", 1.0, []),
    ("П-01", "Утечка сжатого воздуха", 1.0, ["пневматика_воздух"]),
    ("П-02", "Неисправность пневмоцилиндра", 2.0, ["пневматика_воздух"]),
    ("С-01", "Нарушение смазки узла", 1.0, ["смазка_узлов"]),
    ("С-02", "Загрязнение / замена масла", 1.5, ["смазка_узлов"]),
]


def extract_stems(text: str) -> set[str]:
    """Извлекает 5-буквенные основы слов без стоп-слов."""
    words = re.findall(r"[а-яёa-z0-9]+", (text or "").lower())
    stems = set()
    for w in words:
        if len(w) >= 3 and w not in STOP_WORDS:
            stems.add(w[:5])
    return stems


def get_expanded_concepts(text: str) -> set[str]:
    """Возвращает набор концептов и синонимов, найденных в тексте."""
    text_lower = (text or "").lower()
    concepts = set()
    for group_name, keywords in DOMAIN_SYNONYMS.items():
        for kw in keywords:
            if kw in text_lower:
                concepts.add(group_name)
                break
    return concepts


def suggest_fault_code(db: Session, description: str) -> dict[str, Any] | None:
    """ИИ-подсказка шифра неисправности и норматива времени по тексту описания."""
    if not description or len(description.strip()) < 3:
        return None

    desc_lower = description.lower()
    detected_concepts = get_expanded_concepts(description)
    stems = extract_stems(description)

    best_code = None
    best_score = 0
    matched_reason = ""

    fault_codes = db.scalars(select(FaultCode)).all()
    code_obj_map = {fc.code: fc for fc in fault_codes}

    for code, name, default_norm, concepts in CODE_MAP:
        fc = code_obj_map.get(code)
        if not fc:
            continue

        score = 0
        reasons = []

        # 1. Прямое совпадение с названием шифра
        fc_stems = extract_stems(fc.name)
        overlap = stems & fc_stems
        if overlap:
            score += len(overlap) * 20
            reasons.append(f"ключевые слова «{', '.join(overlap)}»")

        # 2. Совпадение по онтологическим концептам
        matched_c = set(concepts) & detected_concepts
        if matched_c:
            score += len(matched_c) * 35
            reasons.append("предметная группа дефекта")

        # 3. Точные правила для специфических дефектов
        if code == "Г-01" and ("масл" in desc_lower or "течь" in desc_lower or "уплотн" in desc_lower):
            score += 40
        elif code == "М-02" and ("подшипник" in desc_lower or "нагрев" in desc_lower):
            score += 40
        elif code == "М-04" and ("лент" in desc_lower or "порыв" in desc_lower):
            score += 40
        elif code == "Э-01" and ("двигател" in desc_lower or "мотор" in desc_lower or "искр" in desc_lower):
            score += 40
        elif code == "М-07" and ("трещин" in desc_lower or "сварк" in desc_lower or "лопнул" in desc_lower):
            score += 40

        if score > best_score:
            best_score = score
            best_code = fc
            matched_reason = "; ".join(reasons) if reasons else "характерные признаки"

    if best_code and best_score >= 25:
        confidence = min(98, 50 + best_score)
        return {
            "fault_code_id": best_code.id,
            "code": best_code.code,
            "name": best_code.name,
            "category": best_code.category,
            "norm_hours": best_code.norm_hours,
            "confidence": confidence,
            "reason": f"ИИ определил дефект по описанию ({matched_reason})",
        }
    return None


def evaluate_work_relevance(description: str, work_done: str, fault_name: str = "") -> tuple[bool, str, int]:
    """Проверяет соответствие выполненных работ проблеме и шифру.

    Возвращает:
      (is_relevant, explanation, penalty)
    """
    if not work_done or len(work_done.strip()) < 5:
        return False, "Не описаны выполненные ремонтные работы", 35

    if len(work_done.strip()) < 15:
        return False, "Описание работ слишком краткое (опишите подробнее заменённые детали и операции)", 8

    # Прямые основы слов
    stems_desc = extract_stems(description)
    stems_work = extract_stems(work_done)
    stems_fault = extract_stems(fault_name)

    direct_common = stems_desc & stems_work
    fault_common = stems_fault & stems_work

    # Онтологические концепты
    concepts_desc = get_expanded_concepts(description)
    concepts_work = get_expanded_concepts(work_done)
    concepts_fault = get_expanded_concepts(fault_name)

    concept_overlap = (concepts_desc | concepts_fault) & concepts_work

    # Если есть прямое совпадение слов ИЛИ совпадение через онтологию
    if direct_common or fault_common or concept_overlap:
        return True, "Работы соответствуют заявленной проблеме и шифру дефекта", 0

    return False, "Описание работ не перекликается с заявленной неисправностью (проверьте правильность описания)", 7
```

---

### Файл: `backend/app/services/assistant.py`

```python
"""Автономный ИИ-ассистент мастера смены (раздел 6.7 кейса, Бонус).

Работает полностью автономно (on-premise, zero-cost, без платных облачных API).
Анализирует текст запроса мастера (включая распознанный голосовой ввод),
определяет намерение (intent), извлекает контекст (специальность, участок, оборудование, сроки)
и генерирует точный оперативный ответ со ссылками на живые данные смены.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Employee, Equipment, Priority, Role, Section, Status, WorkOrder
from ..serializers import is_overdue, short_name
from . import reports
from .analytics import detect_anomalies
from .workers import live_statuses


def _extract_keywords(text: str) -> set[str]:
    words = re.findall(r"[а-яёa-z0-9]+", (text or "").lower())
    return {w[:5] for w in words if len(w) >= 3}


def ask_assistant(db: Session, query: str) -> dict[str, Any]:
    """Обрабатывает вопрос мастера и возвращает развёрнутый ответ с рекомендациями."""
    q = (query or "").strip().lower()
    stems = _extract_keywords(q)

    # 1. Запрос: Кто свободен? (по специальностям или общий)
    if any(k in q for k in ["свобод", "кто сейчас", "есть кто", "найди слесар", "найди электрик", "доступн"]):
        spec_match = None
        if any(k in q for k in ["электрик", "электро"]):
            spec_match = "Электрик"
        elif any(k in q for k in ["слесар"]):
            spec_match = "Слесарь"
        elif any(k in q for k in ["сварщ"]):
            spec_match = "Сварщик"

        statuses = live_statuses(db)
        workers_q = select(Employee).where(Employee.role == Role.worker, Employee.on_shift.is_(True))
        if spec_match:
            workers_q = workers_q.where(Employee.specialty == spec_match)
        workers = db.scalars(workers_q).all()

        free_list = [w for w in workers if statuses.get(w.id, {}).get("state") == "free"]
        queue_list = [w for w in workers if statuses.get(w.id, {}).get("state") == "queue"]

        spec_label = f"из специальности «{spec_match}»" if spec_match else "среди всех специальностей"
        if free_list:
            names = ", ".join(f"{short_name(w.full_name)} ({w.specialty}, {w.grade} разряд)" for w in free_list)
            answer = f"🟢 Сейчас свободны на смене {len(free_list)} чел. {spec_label}: {names}."
        elif queue_list:
            names = ", ".join(f"{short_name(w.full_name)} (в очереди {statuses[w.id]['queue_count']})" for w in queue_list)
            answer = f"🟡 Полностью свободных нет, но в очереди ожидают: {names}. Можно назначить с постановкой в очередь."
        else:
            answer = f"🔴 Все исполнители {spec_label} сейчас заняты выполнением нарядов либо не на смене."

        return {
            "intent": "free_workers",
            "query": query,
            "answer": answer,
            "data": [
                {"id": w.id, "name": short_name(w.full_name), "specialty": w.specialty, "grade": w.grade,
                 "status": statuses.get(w.id, {}).get("label", "Свободен")}
                for w in (free_list + queue_list)
            ],
            "suggestions": [
                "Что просрочено на смене?",
                "Сводка по смене",
                "Топ проблемного оборудования",
            ],
        }

    # 2. Запрос: Что просрочено? (контроль сроков и эскалации)
    if any(k in q for k in ["просроч", "горит", "не успева", "опозда"]):
        now = datetime.now()
        tracked_statuses = [Status.issued, Status.queued, Status.accepted, Status.in_progress, Status.paused, Status.rework]
        active_orders = db.scalars(select(WorkOrder).where(WorkOrder.status.in_(tracked_statuses))).all()
        overdue = [o for o in active_orders if is_overdue(o, now)]

        if not overdue:
            answer = "✅ На текущей смене просроченных нарядов нет. Все работы укладываются в регламентные сроки."
        else:
            items = []
            for o in overdue:
                mins = round((now - o.deadline).total_seconds() / 60)
                worker_s = short_name(o.assignee.full_name) if o.assignee else "не назначен"
                items.append(f"Наряд №{o.number} ({o.equipment.name if o.equipment else '—'}) — просрочен на {mins} мин (исп. {worker_s})")
            answer = f"⚠️ Внимание! На смене зафиксировано {len(overdue)} просроченных нарядов:\n" + "\n".join(f"• {it}" for it in items)

        return {
            "intent": "overdue_orders",
            "query": query,
            "answer": answer,
            "data": [{"id": o.id, "number": o.number, "equipment": o.equipment.name if o.equipment else "—",
                      "assignee": short_name(o.assignee.full_name) if o.assignee else "—"} for o in overdue],
            "suggestions": [
                "Кто сейчас свободен из слесарей?",
                "Сводка по смене",
                "Покажи аномалии за 3 месяца",
            ],
        }

    # 3. Запрос: Отчёт / сводка по участку
    sections = db.scalars(select(Section)).all()
    matched_sec = None
    for s in sections:
        sec_stems = _extract_keywords(s.name)
        if (stems & sec_stems) or any(w in q for w in s.name.lower().split()):
            matched_sec = s
            break

    if matched_sec and any(k in q for k in ["отчет", "сводк", "участ", "обогащен", "дроблен", "сушк", "рмц", "покажи"]):
        now = datetime.now()
        month_ago = now - timedelta(days=30)
        sec_orders = db.scalars(
            select(WorkOrder).where(WorkOrder.section_id == matched_sec.id, WorkOrder.created_at >= month_ago)
        ).all()
        unplanned = sum(1 for o in sec_orders if o.work_type == "unplanned")
        planned = sum(1 for o in sec_orders if o.work_type == "planned")
        overdue_cnt = sum(1 for o in sec_orders if is_overdue(o, now))

        answer = (
            f"📊 Аналитическая сводка по участку «{matched_sec.name}» за 30 дней:\n"
            f"• Всего нарядов: {len(sec_orders)} (аварийных: {unplanned}, плановых ППР: {planned}).\n"
            f"• Просрочек исполнения: {overdue_cnt}.\n"
            f"• Рекомендация ИИ: проверить периодичность смазки и центровки конвейерных линий участка."
        )

        return {
            "intent": "section_summary",
            "query": query,
            "answer": answer,
            "data": {"section_id": matched_sec.id, "total": len(sec_orders), "unplanned": unplanned, "planned": planned},
            "suggestions": [
                "Кто сейчас свободен из электриков?",
                "Что просрочено на смене?",
                "Топ проблемного оборудования",
            ],
        }

    # 4. Запрос: Топ проблемного оборудования и закономерности
    if any(k in q for k in ["проблем", "поломк", "часто", "топ", "аномал", "отказ"]):
        anom = detect_anomalies(db, days=90)
        top10 = anom.get("top_problematic", [])
        insights = anom.get("insights", [])

        if top10:
            top_eq = top10[0]
            lines = [f"{i+1}. {e['name']} ({e['section']}) — {e['unplanned_count']} поломок, простой {e['downtime_hours']} ч"
                     for i, e in enumerate(top10[:3])]
            answer = (
                f"🚨 Топ проблемных агрегатов за 90 дней:\n" + "\n".join(lines) + "\n\n"
                f"💡 Главный вывод ИИ: «{top_eq['name']}» отказывает в {top_eq['ratio_to_avg']} раза чаще нормы. "
                f"Рекомендована внеочередная ревизия."
            )
        else:
            answer = "Накопленных данных недостаточно для выявления аномалий оборудования."

        return {
            "intent": "equipment_anomalies",
            "query": query,
            "answer": answer,
            "data": top10[:5],
            "suggestions": [
                "Кто свободен из слесарей?",
                "Сводка по смене",
                "Что просрочено на смене?",
            ],
        }

    # 5. По умолчанию: Сводка текущей смены (раздел 5.2 п.4)
    start, end, shift_name = reports.current_shift()
    rep = reports.shift_report(db, start, end)
    shift_label = "☀️ Дневная" if shift_name == "day" else "🌙 Ночная"
    answer = (
        f"📋 Сводка текущей смены ({shift_label}):\n"
        f"• Выдано нарядов: {rep['issued']} | Выполнено: {rep['done']} | В работе: {rep['issued'] - rep['done']}\n"
        f"• Просрочено: {rep['overdue']} | Отклонено: {rep['rejected']}\n"
        f"• Суммарный простой оборудования: {rep['downtime_hours']} ч.\n"
        f"• {rep['summary']}"
    )

    return {
        "intent": "general_shift_summary",
        "query": query,
        "answer": answer,
        "data": rep,
        "suggestions": [
            "Кто сейчас свободен из электриков?",
            "Что просрочено на смене?",
            "Покажи проблемы участка обогащения",
            "Топ проблемного оборудования",
        ],
    }
```

---

### Файл: `backend/app/services/events.py`

```python
"""Отложенная отправка событий после commit: WebSocket + push.

Уведомления и события копятся в session.info и уходят только после успешного commit,
чтобы клиенты не получили данные, которые потом откатятся.
"""
import logging
import threading

from sqlalchemy import event
from sqlalchemy.orm import Session

from ..db import SessionLocal
from ..models import Employee, Notification
from ..realtime import emit, manager
from . import push

log = logging.getLogger(__name__)


def _pending(db: Session) -> list:
    return db.info.setdefault("pending_events", [])


def broadcast(db: Session, message: dict) -> None:
    """Событие для всех подключённых клиентов (обновление доски, статусов)."""
    _pending(db).append(("broadcast", None, message))


def notify(
    db: Session,
    user: Employee | int,
    kind: str,
    title: str,
    text: str,
    order_id: int | None = None,
    urgent: bool = False,
) -> Notification:
    """Уведомление конкретному пользователю: запись в БД + WebSocket + push."""
    user_obj = user if isinstance(user, Employee) else db.get(Employee, user)
    n = Notification(
        user_id=user_obj.id, order_id=order_id, kind=kind, title=title, text=text, urgent=urgent
    )
    db.add(n)
    db.flush()
    payload = {
        "type": "notification",
        "notification": {
            "id": n.id, "kind": kind, "title": title, "text": text,
            "order_id": order_id, "urgent": urgent, "created_at": n.created_at,
        },
    }
    _pending(db).append(("user", user_obj.id, payload))
    _pending(db).append(("push", user_obj, {"title": title, "text": text, "urgent": urgent,
                                            "order_id": order_id}))
    return n


@event.listens_for(SessionLocal, "after_commit")
def _after_commit(db: Session) -> None:
    items = db.info.pop("pending_events", [])
    pushes = []
    for kind, target, message in items:
        if kind == "broadcast":
            emit(manager.broadcast, message)
        elif kind == "user":
            emit(manager.send_to, target, message)
        elif kind == "push":
            pushes.append((target.push_token, target.telegram_chat_id, message))
    if pushes:
        threading.Thread(target=push.send_many, args=(pushes,), daemon=True).start()


@event.listens_for(SessionLocal, "after_rollback")
def _after_rollback(db: Session) -> None:
    db.info.pop("pending_events", None)
```

---

### Файл: `backend/app/services/export.py`

```python
"""Модуль экспорта отчётов в Excel (openpyxl) и печатных форм (HTML / PDF-ready).

Соответствует разделу 7 кейса («Отчёты и аналитика», «Выгрузка в PDF / Excel»).
Полностью автономен, без внешних API и облачных сервисов.
"""
from __future__ import annotations

import io
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import (
    AIAssessment,
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialNorm,
    MaterialWriteOff,
    Role,
    Section,
    Status,
    WorkOrder,
    WorkOrderEvent,
)
from ..serializers import (
    PRIORITY_LABELS,
    STATUS_LABELS,
    downtime_minutes,
    short_name,
    work_minutes,
)
from . import reports

# Цветовая палитра оформления АО «Костанайские Минералы»
COLOR_HEADER_BG = "1E293B"      # slate-800
COLOR_HEADER_FG = "FFFFFF"
COLOR_ACCENT = "059669"         # emerald-600
COLOR_SUBHEADER_BG = "F1F5F9"   # slate-100
COLOR_BORDER = "CBD5E1"         # slate-300
COLOR_ALERT_BG = "FEE2E2"       # red-100
COLOR_ALERT_FG = "991B1B"       # red-800


def _style_header_row(ws, row_idx: int, col_count: int, bg_hex: str = COLOR_HEADER_BG, fg_hex: str = COLOR_HEADER_FG):
    fill = PatternFill(start_color=bg_hex, end_color=bg_hex, fill_type="solid")
    font = Font(name="Arial", size=10, bold=True, color=fg_hex)
    thin = Side(border_style="thin", color=COLOR_BORDER)
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    align = Alignment(horizontal="center", vertical="center", wrap_text=True)

    for col in range(1, col_count + 1):
        cell = ws.cell(row=row_idx, column=col)
        cell.fill = fill
        cell.font = font
        cell.border = border
        cell.alignment = align
    ws.row_dimensions[row_idx].height = 28


def _apply_table_borders(ws, start_row: int, end_row: int, col_count: int):
    thin = Side(border_style="thin", color="E2E8F0")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    for r in range(start_row, end_row + 1):
        for c in range(1, col_count + 1):
            cell = ws.cell(row=r, column=c)
            cell.border = border
            if cell.font.name != "Arial":
                cell.font = Font(name="Arial", size=9)


def _auto_column_widths(ws):
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val = str(cell.value or "")
            if len(val) > max_len and len(val) < 80:
                max_len = len(val)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 11)


# =====================================================================
# 1. Экспорт отчёта за смену в Excel
# =====================================================================
def export_shift_report_excel(db: Session, start: datetime, end: datetime) -> io.BytesIO:
    data = reports.shift_report(db, start, end)
    wb = Workbook()

    # Лист 1: Сводка смены
    ws_sum = wb.active
    ws_sum.title = "Сводка смены"
    ws_sum.views.sheetView[0].showGridLines = True

    # Заголовок документа
    ws_sum.merge_cells("A1:G1")
    title_cell = ws_sum["A1"]
    title_cell.value = "АО «Костанайские Минералы» — Сводный отчёт за смену"
    title_cell.font = Font(name="Arial", size=14, bold=True, color="065F46")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws_sum.row_dimensions[1].height = 35

    ws_sum["A2"] = f"Период: {start.strftime('%d.%m.%Y %H:%M')} — {end.strftime('%d.%m.%Y %H:%M')}"
    ws_sum["A2"].font = Font(name="Arial", size=10, italic=True)

    # Таблица показателей
    metrics = [
        ("Выдано нарядов за смену", data["issued"]),
        ("Выполнено нарядов (завершено)", data["done"]),
        ("Закрыто и утверждено мастером", data["closed"]),
        ("Просрочено нарядов", data["overdue"]),
        ("Отклонений исполнителями", data["rejected"]),
        ("Суммарный простой оборудования (часов)", f"{data['downtime_hours']} ч"),
        ("Средняя оценка качества закрытия (ИИ)", f"{data['avg_score']}/100" if data['avg_score'] else "—"),
    ]

    ws_sum.cell(row=4, column=1, value="Показатель смены")
    ws_sum.cell(row=4, column=2, value="Значение")
    _style_header_row(ws_sum, 4, 2, bg_hex="065F46", fg_hex="FFFFFF")

    cur_row = 5
    for title, val in metrics:
        ws_sum.cell(row=cur_row, column=1, value=title).font = Font(name="Arial", size=10)
        c_val = ws_sum.cell(row=cur_row, column=2, value=val)
        c_val.font = Font(name="Arial", size=10, bold=True)
        c_val.alignment = Alignment(horizontal="center")
        cur_row += 1
    _apply_table_borders(ws_sum, 5, cur_row - 1, 2)

    # ИИ-резюме
    cur_row += 1
    ws_sum.cell(row=cur_row, column=1, value="Итоговое ИИ-резюме смены:").font = Font(name="Arial", size=10, bold=True)
    cur_row += 1
    ws_sum.merge_cells(start_row=cur_row, start_column=1, end_row=cur_row + 2, end_column=6)
    summary_cell = ws_sum.cell(row=cur_row, column=1, value=data["summary"])
    summary_cell.font = Font(name="Arial", size=9, italic=True)
    summary_cell.alignment = Alignment(wrap_text=True, vertical="top")
    summary_cell.fill = PatternFill(start_color="F0FDF4", end_color="F0FDF4", fill_type="solid")

    # Таблица загрузки сотрудников
    cur_row += 4
    ws_sum.cell(row=cur_row, column=1, value="Загрузка ремонтно-технического персонала").font = Font(name="Arial", size=11, bold=True)
    cur_row += 1
    load_headers = ["Сотрудник", "Нарядов", "Отработано (мин)", "Отработано (ч)"]
    for c_idx, h in enumerate(load_headers, 1):
        ws_sum.cell(row=cur_row, column=c_idx, value=h)
    _style_header_row(ws_sum, cur_row, len(load_headers))
    load_start = cur_row + 1
    cur_row += 1
    for w in data.get("load", []):
        ws_sum.cell(row=cur_row, column=1, value=w["name"])
        ws_sum.cell(row=cur_row, column=2, value=w["orders"]).alignment = Alignment(horizontal="center")
        ws_sum.cell(row=cur_row, column=3, value=w["minutes"]).alignment = Alignment(horizontal="center")
        ws_sum.cell(row=cur_row, column=4, value=round(w["minutes"] / 60, 1)).alignment = Alignment(horizontal="center")
        cur_row += 1
    if data.get("load"):
        _apply_table_borders(ws_sum, load_start, cur_row - 1, len(load_headers))

    _auto_column_widths(ws_sum)

    # Лист 2: Реестр нарядов смены
    ws_orders = wb.create_sheet(title="Наряды смены")
    ws_orders.views.sheetView[0].showGridLines = True
    order_headers = [
        "№ наряда", "Оборудование", "Участок", "Приоритет", "Тип",
        "Исполнитель", "Статус", "Срок", "Просрочен", "Время (мин)",
        "Оценка ИИ", "Шифр дефекта",
    ]
    for c_idx, h in enumerate(order_headers, 1):
        ws_orders.cell(row=1, column=c_idx, value=h)
    _style_header_row(ws_orders, 1, len(order_headers))

    orders = reports._period_orders(db, start, end)
    r_idx = 2
    for o in orders:
        ws_orders.cell(row=r_idx, column=1, value=o.number).alignment = Alignment(horizontal="center")
        ws_orders.cell(row=r_idx, column=2, value=o.equipment.name if o.equipment else "—")
        ws_orders.cell(row=r_idx, column=3, value=o.section.name if o.section else "—")
        ws_orders.cell(row=r_idx, column=4, value=PRIORITY_LABELS.get(o.priority, str(o.priority)))
        ws_orders.cell(row=r_idx, column=5, value="Внеплановый" if o.work_type == "unplanned" else "Плановый")
        ws_orders.cell(row=r_idx, column=6, value=short_name(o.assignee.full_name) if o.assignee else "—")
        ws_orders.cell(row=r_idx, column=7, value=STATUS_LABELS.get(Status(o.status), str(o.status)))
        ws_orders.cell(row=r_idx, column=8, value=o.deadline.strftime("%H:%M %d.%m") if o.deadline else "—")
        ws_orders.cell(row=r_idx, column=9, value="Да" if reports.is_overdue(o) else "Нет").alignment = Alignment(horizontal="center")
        minutes = work_minutes(o)
        ws_orders.cell(row=r_idx, column=10, value=int(minutes) if minutes is not None else "—").alignment = Alignment(horizontal="center")
        score = o.assessment.final_score if o.assessment else None
        ws_orders.cell(row=r_idx, column=11, value=score if score is not None else "—").alignment = Alignment(horizontal="center")
        ws_orders.cell(row=r_idx, column=12, value=o.fault_code.code if o.fault_code else "—").alignment = Alignment(horizontal="center")
        r_idx += 1

    if len(orders) > 0:
        _apply_table_borders(ws_orders, 2, r_idx - 1, len(order_headers))
    _auto_column_widths(ws_orders)

    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return out


# =====================================================================
# 2. Экспорт рейтинга рабочих и бригад в Excel
# =====================================================================
def export_rating_excel(db: Session, start: datetime, end: datetime, brigade_id: int | None = None) -> io.BytesIO:
    rows = reports.compute_rating(db, start, end, brigade_id)
    wb = Workbook()
    ws = wb.active
    ws.title = "Рейтинг сотрудников"
    ws.views.sheetView[0].showGridLines = True

    # Заголовок
    ws.merge_cells("A1:K1")
    t = ws["A1"]
    t.value = "АО «Костанайские Минералы» — Объективный рейтинг ремонтно-технического персонала"
    t.font = Font(name="Arial", size=13, bold=True, color="065F46")
    t.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    ws["A2"] = (
        f"Период: {start.strftime('%d.%m.%Y')} — {end.strftime('%d.%m.%Y')} | "
        f"Формула: 0.35·Качество + 0.25·В срок + 0.20·(100 − Повторы) + 0.15·Объём + 0.05·(100 − Отказы)"
    )
    ws["A2"].font = Font(name="Arial", size=9, italic=True)

    headers = [
        "Место", "Сотрудник", "Специальность", "Разряд", "Бригада",
        "Итоговый балл", "Качество (35%)", "В срок (25%)", "Без повторов (20%)",
        "Объём/сложность (15%)", "Без отказов (5%)", "Закрыто нарядов", "Повторов за 7 дней",
        "ИИ-рекомендация исполнителю",
    ]
    for c_idx, h in enumerate(headers, 1):
        ws.cell(row=4, column=c_idx, value=h)
    _style_header_row(ws, 4, len(headers), bg_hex="065F46", fg_hex="FFFFFF")

    r_idx = 5
    for row in rows:
        place_cell = ws.cell(row=r_idx, column=1, value=row.get("place", r_idx - 4))
        place_cell.alignment = Alignment(horizontal="center")
        place_cell.font = Font(name="Arial", size=10, bold=True)
        ws.cell(row=r_idx, column=2, value=row["full_name"]).font = Font(name="Arial", size=10, bold=True)
        ws.cell(row=r_idx, column=3, value=row["specialty"])
        ws.cell(row=r_idx, column=4, value=row["grade"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=5, value=row.get("brigade", {}).get("name", "—") if row.get("brigade") else "—")
        
        # Рейтинг
        rate_cell = ws.cell(row=r_idx, column=6, value=row["rating"])
        rate_cell.alignment = Alignment(horizontal="center")
        rate_cell.font = Font(name="Arial", size=11, bold=True, color="065F46")
        rate_cell.fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")

        comp = row.get("components", {})
        ws.cell(row=r_idx, column=7, value=comp.get("quality", 0)).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=8, value=comp.get("on_time", 0)).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=9, value=comp.get("no_rework", 0)).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=10, value=comp.get("volume", 0)).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=11, value=comp.get("no_reject", 0)).alignment = Alignment(horizontal="center")

        ws.cell(row=r_idx, column=12, value=row["orders_closed"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=13, value=row["repeat_failures"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=14, value=row.get("explanation", ""))
        r_idx += 1

    if rows:
        _apply_table_borders(ws, 5, r_idx - 1, len(headers))
    _auto_column_widths(ws)

    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return out


# =====================================================================
# 3. Экспорт списанных ТМЦ и отклонений от норм в Excel
# =====================================================================
def export_materials_excel(db: Session, start: datetime, end: datetime) -> io.BytesIO:
    materials_stat = get_materials_report(db, start, end)
    wb = Workbook()
    ws = wb.active
    ws.title = "Списание ТМЦ"
    ws.views.sheetView[0].showGridLines = True

    ws.merge_cells("A1:G1")
    t = ws["A1"]
    t.value = "АО «Костанайские Минералы» — Отчёт по списанию запчастей и ТМЦ против нормативов"
    t.font = Font(name="Arial", size=13, bold=True, color="1E3A8A")
    t.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    headers = [
        "Наименование ТМЦ / запчасти", "Ед. изм.", "Фактически списано",
        "Типичный норматив", "Отклонение от нормы", "Кол-во нарядов", "Статус контроля ИИ",
    ]
    for c_idx, h in enumerate(headers, 1):
        ws.cell(row=3, column=c_idx, value=h)
    _style_header_row(ws, 3, len(headers), bg_hex="1E3A8A", fg_hex="FFFFFF")

    r_idx = 4
    for item in materials_stat["items"]:
        ws.cell(row=r_idx, column=1, value=item["name"]).font = Font(name="Arial", size=10, bold=True)
        ws.cell(row=r_idx, column=2, value=item["unit"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=3, value=item["total_qty"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=4, value=item["norm_qty"]).alignment = Alignment(horizontal="center")

        diff = item.get("diff_pct", 0)
        c_diff = ws.cell(row=r_idx, column=5, value=f"{diff:+.1f}%")
        c_diff.alignment = Alignment(horizontal="center")
        if diff > 50:
            c_diff.font = Font(name="Arial", size=10, bold=True, color="DC2626")
            c_diff.fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")

        ws.cell(row=r_idx, column=6, value=item["orders_count"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=7, value=item["status_label"])
        r_idx += 1

    if materials_stat["items"]:
        _apply_table_borders(ws, 4, r_idx - 1, len(headers))
    _auto_column_widths(ws)

    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return out


# =====================================================================
# 4. JSON-агрегация по списанным материалам (для UI и экспорта)
# =====================================================================
def get_materials_report(db: Session, start: datetime, end: datetime) -> dict:
    orders = reports._period_orders(db, start, end)
    order_ids = [o.id for o in orders]
    if not order_ids:
        return {"items": [], "total_writeoffs": 0, "anomalies_count": 0}

    writeoffs = db.scalars(
        select(MaterialWriteOff)
        .where(MaterialWriteOff.order_id.in_(order_ids))
        .options(selectinload(MaterialWriteOff.material), selectinload(MaterialWriteOff.order))
    ).all()

    # Справочник норм
    norms = db.scalars(select(MaterialNorm)).all()
    norm_map = {(n.fault_code_id, n.material_id): n.typical_qty for n in norms}

    by_mat: dict[int, dict] = {}
    for w in writeoffs:
        mid = w.material_id
        if mid not in by_mat:
            mat_name = w.material.name if w.material else f"Материал #{mid}"
            mat_unit = w.material.unit if w.material else "ед."
            by_mat[mid] = {
                "material_id": mid,
                "name": mat_name,
                "unit": mat_unit,
                "total_qty": 0.0,
                "expected_qty": 0.0,
                "orders": set(),
                "overuse_events": 0,
            }
        by_mat[mid]["total_qty"] += w.qty
        by_mat[mid]["orders"].add(w.order_id)
        if w.order.fault_code_id:
            typ = norm_map.get((w.order.fault_code_id, mid), w.qty)
            by_mat[mid]["expected_qty"] += typ
            if w.qty > typ * 1.5:
                by_mat[mid]["overuse_events"] += 1
        else:
            by_mat[mid]["expected_qty"] += w.qty

    items = []
    anomalies_count = 0
    for stat in by_mat.values():
        total_q = round(stat["total_qty"], 1)
        expected_q = round(stat["expected_qty"], 1)
        diff_pct = round(((total_q - expected_q) / expected_q * 100), 1) if expected_q > 0 else 0.0
        is_anom = diff_pct > 40 and stat["overuse_events"] >= 2
        if is_anom:
            anomalies_count += 1
        items.append({
            "material_id": stat["material_id"],
            "name": stat["name"],
            "unit": stat["unit"],
            "total_qty": total_q,
            "norm_qty": expected_q,
            "diff_pct": diff_pct,
            "orders_count": len(stat["orders"]),
            "overuse_count": stat["overuse_events"],
            "is_anomaly": is_anom,
            "status_label": "⚠️ Перерасход выше нормы" if is_anom else "Нормативный расход",
        })

    items.sort(key=lambda x: (x["is_anomaly"], x["diff_pct"]), reverse=True)
    return {
        "period": {"start": start, "end": end},
        "items": items,
        "total_writeoffs": len(writeoffs),
        "anomalies_count": anomalies_count,
    }


# =====================================================================
# 5. Печатная форма наряда (Print-Ready / PDF)
# =====================================================================
def generate_order_print_html(order: WorkOrder) -> str:
    """Генерирует официальную форму наряда-допуска АО «Костанайские Минералы»."""
    events_html = "".join(
        f"<tr><td>{ev.created_at.strftime('%d.%m.%Y %H:%M:%S') if ev.created_at else '—'}</td>"
        f"<td><strong>{ev.action}</strong></td>"
        f"<td>{short_name(ev.actor.full_name) if ev.actor else 'ИИ / Система'}</td>"
        f"<td>{ev.comment or ev.reason or '—'}</td></tr>"
        for ev in (order.events or [])
    )

    mats_html = "".join(
        f"<tr><td>{m.material.name if m.material else f'Материал #{m.material_id}'}</td><td>{m.qty} {m.material.unit if m.material else 'ед.'}</td></tr>"
        for m in (order.materials or [])
    ) or "<tr><td colspan='2' style='text-align:center; color:#64748b;'>Материалы не списывались</td></tr>"

    eq_desc = f"{order.equipment.name} (Инв. № {order.equipment.inv_no})" if order.equipment else "Не указано (Инв. № —)"
    sec_name = order.section.name if order.section else "Не указан"
    created_str = order.created_at.strftime('%d.%m.%Y %H:%M') if order.created_at else "—"
    deadline_str = order.deadline.strftime('%d.%m.%Y %H:%M') if order.deadline else "—"
    master_name = order.master.full_name if order.master else "Мастер смены"
    assignee_name = order.assignee.full_name if order.assignee else "Не назначен"
    assignee_spec = order.assignee.specialty if order.assignee else "—"

    assessment_html = ""
    if order.assessment:
        a = order.assessment
        v_raw = a.verdict.value if hasattr(a.verdict, "value") else str(a.verdict)
        verdict_trans = {
            "accepted": "✅ Принято без замечаний",
            "accepted_with_remarks": "⚠️ Принято с замечаниями",
            "needs_rework": "❌ Требует доработки",
        }.get(v_raw, v_raw)
        assessment_html = f"""
        <div class="box ai-box">
            <h3>🤖 ИИ-ЗАКЛЮЧЕНИЕ ЦИФРОВОГО КОНТРОЛЁРА («НарядAI»)</h3>
            <p><strong>Вердикт ИИ:</strong> {verdict_trans} | <strong>Балл:</strong> {a.score}/100 
               {f'| <strong>Мастер скорректировал оценку:</strong> {a.master_score}/100' if a.master_score is not None else ''}</p>
            <p><strong>Пояснение:</strong> {a.explanation or '—'}</p>
            {f'<p><strong>Комментарий мастера:</strong> {a.master_comment}</p>' if a.master_comment else ''}
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Наряд-задание №{order.number} — АО «Костанайские Минералы»</title>
<style>
    @page {{ size: A4; margin: 15mm; }}
    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 11pt;
        color: #1e293b;
        line-height: 1.4;
        margin: 0;
        padding: 10px;
    }}
    .header {{
        text-align: center;
        border-bottom: 2px solid #065f46;
        padding-bottom: 10px;
        margin-bottom: 15px;
    }}
    .header h1 {{ margin: 0; font-size: 16pt; color: #065f46; }}
    .header h2 {{ margin: 4px 0 0; font-size: 13pt; font-weight: normal; color: #334155; }}
    .meta-grid {{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 15px;
    }}
    .box {{
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 8px 12px;
    }}
    .box h3 {{ margin: 0 0 6px; font-size: 11pt; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }}
    .ai-box {{ background: #f0fdf4; border-color: #86efac; }}
    .ai-box h3 {{ color: #166534; }}
    table {{ width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5pt; }}
    th, td {{ border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }}
    th {{ background: #f1f5f9; font-weight: bold; }}
    .signatures {{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 15px;
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px dashed #94a3b8;
    }}
    .sig-line {{ border-bottom: 1px solid #000; height: 30px; margin-top: 5px; }}
    .badge {{ display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9pt; font-weight: bold; }}
    .badge-emergency {{ background: #fee2e2; color: #991b1b; }}
    .badge-normal {{ background: #e0f2fe; color: #075985; }}
    @media print {{
        body {{ padding: 0; }}
        .no-print {{ display: none; }}
    }}
</style>
</head>
<body>

<div class="no-print" style="margin-bottom: 15px; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #059669; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
        🖨️ Распечатать / Сохранить в PDF
    </button>
</div>

<div class="header">
    <h1>АО «КОСТАНАЙСКИЕ МИНЕРАЛЫ»</h1>
    <h2>НАРЯД-ЗАДАНИЕ № {order.number} НА ВЫПОЛНЕНИЕ РЕМОНТНЫХ РАБОТ</h2>
    <div style="font-size: 9pt; color: #64748b; margin-top: 4px;">Система автоматизированного контроля «НарядAI»</div>
</div>

<div class="meta-grid">
    <div class="box">
        <h3>ОБОРУДОВАНИЕ И УЧАСТОК</h3>
        <div><strong>Оборудование:</strong> {eq_desc}</div>
        <div><strong>Участок:</strong> {sec_name}</div>
        <div><strong>Тип работ:</strong> {'Внеплановый (аварийный)' if order.work_type == 'unplanned' else 'Плановый регламентный'}</div>
        <div><strong>Приоритет:</strong> <span class="badge {'badge-emergency' if order.priority == 'emergency' else 'badge-normal'}">{PRIORITY_LABELS.get(order.priority, str(order.priority))}</span></div>
    </div>
    <div class="box">
        <h3>СРОКИ И ОТВЕТСТВЕННЫЕ</h3>
        <div><strong>Выдан:</strong> {created_str}</div>
        <div><strong>Срок исполнения:</strong> {deadline_str}</div>
        <div><strong>Мастер смены:</strong> {master_name}</div>
        <div><strong>Исполнитель:</strong> {assignee_name} ({assignee_spec})</div>
    </div>
</div>

<div class="box" style="margin-bottom: 12px;">
    <h3>ОПИСАНИЕ НЕИСПРАВНОСТИ / ЗАДАНИЕ МАСТЕРА</h3>
    <p style="margin: 4px 0;">{order.description or '—'}</p>
    {f'<div style="font-size: 9pt; color: #64748b;">Комментарий: {order.comment}</div>' if order.comment else ''}
</div>

<div class="box" style="margin-bottom: 12px;">
    <h3>ФАКТИЧЕСКИ ВЫПОЛНЕННЫЕ РАБОТЫ И МАТЕРИАЛЫ</h3>
    <div><strong>Шифр неисправности:</strong> [{order.fault_code.code if order.fault_code else '—'}] {order.fault_code.name if order.fault_code else '—'}</div>
    <div><strong>Выполненные операции:</strong> {order.work_done or 'Работы не описаны'}</div>
    {f'<div><strong>Комментарий исполнителя:</strong> {order.close_comment}</div>' if order.close_comment else ''}
    
    <h4 style="margin: 8px 0 2px; font-size: 9.5pt;">Списанные материалы и запчасти:</h4>
    <table>
        <thead><tr><th>Материал / Запчасть</th><th style="width: 120px;">Количество</th></tr></thead>
        <tbody>{mats_html}</tbody>
    </table>
</div>

{assessment_html}

<div class="box" style="margin-bottom: 15px;">
    <h3>ХРОНОЛОГИЯ ПЕРЕХОДОВ СТАТУСОВ</h3>
    <table>
        <thead><tr><th>Время</th><th>Действие</th><th>Автор</th><th>Примечание / Причина</th></tr></thead>
        <tbody>{events_html}</tbody>
    </table>
</div>

<div class="signatures">
    <div>
        <strong>Мастер смены:</strong>
        <div class="sig-line"></div>
        <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">{master_name}</div>
    </div>
    <div>
        <strong>Исполнитель:</strong>
        <div class="sig-line"></div>
        <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">{assignee_name}</div>
    </div>
    <div>
        <strong>Начальник участка / службы:</strong>
        <div class="sig-line"></div>
        <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">Подпись / Дата</div>
    </div>
</div>

</body>
</html>
"""
```

---

### Файл: `backend/app/services/photos.py`

```python
"""Хранение фото: сжатие, EXIF-время съёмки, перцептивный хеш (для поиска повторных фото)."""
import io
import uuid
from datetime import datetime

from PIL import ExifTags, Image, ImageOps

from ..config import MEDIA_DIR, PHOTO_JPEG_QUALITY, PHOTO_MAX_SIDE

_EXIF_DT_TAGS = {v: k for k, v in ExifTags.TAGS.items()}


def _exif_taken_at(img: Image.Image) -> datetime | None:
    try:
        exif = img.getexif()
        ifd = exif.get_ifd(ExifTags.IFD.Exif)
        raw = ifd.get(_EXIF_DT_TAGS["DateTimeOriginal"]) or exif.get(_EXIF_DT_TAGS["DateTime"])
        return datetime.strptime(raw, "%Y:%m:%d %H:%M:%S") if raw else None
    except Exception:
        return None


def dhash(img: Image.Image, size: int = 8) -> str:
    """Difference hash 64 бита → 16 hex-символов. Устойчив к сжатию и масштабу."""
    g = img.convert("L").resize((size + 1, size), Image.Resampling.LANCZOS)
    px = list(g.getdata())
    bits = 0
    for row in range(size):
        for col in range(size):
            left = px[row * (size + 1) + col]
            right = px[row * (size + 1) + col + 1]
            bits = (bits << 1) | (1 if left > right else 0)
    return f"{bits:016x}"


def hamming(a: str, b: str) -> int:
    return bin(int(a, 16) ^ int(b, 16)).count("1")


def save_photo(data: bytes, order_id: int) -> tuple[str, datetime | None, str]:
    """Сохраняет сжатое фото. Возвращает (относительный путь, время съёмки, хеш)."""
    img = Image.open(io.BytesIO(data))
    taken_at = _exif_taken_at(img)
    img = ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((PHOTO_MAX_SIDE, PHOTO_MAX_SIDE))
    phash = dhash(img)

    rel_dir = f"orders/{order_id}"
    (MEDIA_DIR / rel_dir).mkdir(parents=True, exist_ok=True)
    rel_path = f"{rel_dir}/{uuid.uuid4().hex}.jpg"
    img.save(MEDIA_DIR / rel_path, "JPEG", quality=PHOTO_JPEG_QUALITY, optimize=True)
    return rel_path, taken_at, phash
```

---

### Файл: `backend/app/services/push.py`

```python
"""Push-уведомления на телефон.

Каналы (включаются переменными окружения):
* TELEGRAM_BOT_TOKEN — Telegram-бот (страховка / простой вариант);
* FCM — подключается на следующем этапе вместе с APK (Capacitor).
Если каналы не настроены — уведомление доходит только через WebSocket (in-app + Notification API).
"""
import logging
import os

import httpx

log = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")


def _send_telegram(chat_id: str, message: dict) -> None:
    prefix = "🚨 " if message.get("urgent") else "🔔 "
    text = f"{prefix}<b>{message['title']}</b>\n{message['text']}"
    httpx.post(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
        json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
        timeout=5,
    )


def _send_fcm(token: str, message: dict) -> None:
    # TODO(этап 2): FCM HTTP v1 через сервисный аккаунт Firebase.
    log.debug("FCM пока не настроен, token=%s…", token[:10])


def send_many(items: list[tuple[str | None, str | None, dict]]) -> None:
    for push_token, chat_id, message in items:
        try:
            if push_token:
                _send_fcm(push_token, message)
            if chat_id and TELEGRAM_BOT_TOKEN:
                _send_telegram(chat_id, message)
        except Exception as exc:  # push не должен ронять систему
            log.warning("Ошибка отправки push: %s", exc)
```

---

### Файл: `backend/app/services/workers.py`

```python
"""Текущие статусы исполнителей и ИИ-подбор исполнителя (раздел 5.1 п.2–3)."""
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import AIAssessment, Employee, Equipment, Role, Status, WorkOrder
from ..serializers import employee_out

BUSY = {Status.in_progress, Status.paused}
QUEUE = {Status.issued, Status.queued, Status.accepted, Status.rework}

# Ключевые слова → специальность (простая эвристика; на этапе ИИ дополняется LLM)
SPECIALTY_KEYWORDS = {
    "Слесарь": ["течь", "масл", "подшипник", "редуктор", "насос", "лента", "ролик", "вибрац",
                "шум", "муфт", "вал", "износ", "болт", "уплотн", "гидравл", "смазк", "шестерн",
                "заклин", "футеровк", "натяж"],
    "Электрик": ["электр", "двигател", "кабел", "автомат", "пускател", "датчик", "напряжен",
                 "искр", "замыкан", "не запускается", "освещен", "щит", "обмотк", "кз", "фаз"],
    "Сварщик": ["свар", "трещин", "разрыв", "корпус", "рама", "металлоконструк", "прогар",
                "шов", "лопнул"],
}


def guess_specialty(text: str) -> str | None:
    t = text.lower()
    scores = {s: sum(1 for k in kws if k in t) for s, kws in SPECIALTY_KEYWORDS.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else None


def live_statuses(db: Session) -> dict[int, dict]:
    """Статус каждого исполнителя: free / busy / queue / off."""
    active = db.scalars(
        select(WorkOrder).where(WorkOrder.status.in_(list(BUSY | QUEUE)),
                                WorkOrder.assignee_id.is_not(None))
    ).all()
    by_worker: dict[int, list[WorkOrder]] = defaultdict(list)
    for o in active:
        by_worker[o.assignee_id].append(o)

    result = {}
    workers = db.scalars(select(Employee).where(Employee.role == Role.worker)).all()
    for w in workers:
        orders = by_worker.get(w.id, [])
        current = next((o for o in orders if o.status in BUSY), None)
        queue = [o for o in orders if o.status in QUEUE]
        if not w.on_shift:
            state, label = "off", "Не на смене"
        elif current:
            state = "busy"
            label = f"Выполняет наряд №{current.number}" + (
                " (пауза)" if current.status == Status.paused else "")
            if queue:
                label += f", в очереди {len(queue)}"
        elif queue:
            state, label = "queue", f"В очереди {len(queue)} нарядов"
        else:
            state, label = "free", "Свободен"
        result[w.id] = {
            "state": state, "label": label,
            "current_order": {"id": current.id, "number": current.number} if current else None,
            "queue_count": len(queue),
        }
    return result


def workers_with_status(db: Session) -> list[dict]:
    statuses = live_statuses(db)
    workers = db.scalars(
        select(Employee).where(Employee.role == Role.worker)
        .options(selectinload(Employee.brigade)).order_by(Employee.full_name)
    ).all()
    order = {"free": 0, "queue": 1, "busy": 2, "off": 3}
    out = [{**employee_out(w), "live": statuses[w.id]} for w in workers]
    return sorted(out, key=lambda x: (order[x["live"]["state"]], x["full_name"]))


def suggest_assignees(db: Session, equipment_id: int, description: str,
                      exclude_ids: set[int] | None = None, limit: int = 3) -> list[dict]:
    """ИИ-подсказка: свободный + нужная специальность + лучший рейтинг по этому типу оборудования."""
    exclude_ids = exclude_ids or set()
    equipment = db.get(Equipment, equipment_id) if equipment_id else None
    need = guess_specialty(description or "")
    statuses = live_statuses(db)

    # средняя оценка каждого исполнителя по этому типу оборудования за 90 дней
    per: dict[int, list[int]] = defaultdict(list)
    if equipment:
        since = datetime.now() - timedelta(days=90)
        rows = db.execute(
            select(WorkOrder.assignee_id, AIAssessment.score, AIAssessment.master_score)
            .join(AIAssessment, AIAssessment.order_id == WorkOrder.id)
            .join(Equipment, Equipment.id == WorkOrder.equipment_id)
            .where(Equipment.type == equipment.type, WorkOrder.created_at >= since)
        ).all()
        for aid, s, ms in rows:
            per[aid].append(ms if ms is not None else s)

    candidates = []
    workers = db.scalars(select(Employee).where(Employee.role == Role.worker,
                                                Employee.on_shift.is_(True))).all()
    for w in workers:
        if w.id in exclude_ids:
            continue
        st = statuses[w.id]
        scores = per.get(w.id, [])
        avg = sum(scores) / len(scores) if scores else 70.0
        score = 0.0
        reasons = []
        if st["state"] == "free":
            score += 50; reasons.append("свободен")
        elif st["state"] == "queue":
            score += 25 - 5 * st["queue_count"]; reasons.append(f"очередь {st['queue_count']}")
        else:
            score += 5; reasons.append("занят")
        if need and w.specialty == need:
            score += 30; reasons.append(f"специальность: {w.specialty.lower()}")
        elif need:
            score -= 20
        score += (avg - 70) * 0.5
        if scores and equipment:
            reasons.append(f"ср. оценка по «{equipment.type}»: {avg:.0f} ({len(scores)} нарядов)")
        candidates.append({
            **employee_out(w), "live": st, "match_score": round(score, 1),
            "reason": ", ".join(reasons),
        })
    candidates.sort(key=lambda c: c["match_score"], reverse=True)
    return candidates[:limit]
```

---

### Файл: `backend/requirements.txt`

```text
annotated-doc==0.0.5
annotated-types==0.8.0
anyio==4.15.1
certifi==2026.7.22
click==8.5.0
fastapi==0.142.2
h11==0.16.0
httpcore==1.0.9
httptools==0.8.0
httpx==0.28.1
idna==3.20
opentelemetry-api==1.45.0
pillow==12.3.0
pydantic==2.13.5
pydantic_core==2.46.5
PyJWT==2.15.1
python-dotenv==1.2.4
python-multipart==0.0.32
PyYAML==6.0.3
SQLAlchemy==2.1.3
starlette==1.7.0
typing-inspection==0.4.4
typing_extensions==4.16.0
uvicorn==0.54.0
uvloop==0.23.0
watchfiles==1.3.0
websockets==17.2
openpyxl>=3.1.2
qrcode>=8.0
psycopg[binary]>=3.1.18
```

---

### Файл: `backend/seed/__init__.py`

```python

```

---

### Файл: `backend/seed/generate.py`

```python
"""Генератор тестовых данных: история за 3 месяца с заложенными закономерностями.

Запуск:  python -m seed.generate [--days 92] [--seed 42]

Заложенные закономерности (их должен найти ИИ-аналитик):
 1. Конвейер К-3 ломается в ~3 раза чаще остальных, большинство — М-02 (подшипник).
 2. Сериков Д. — частые доработки и повторные поломки того же шифра в течение 7 дней.
 3. Дробилка КМД-1750 — внеплановые поломки через 2–5 дней после планового ремонта (качество ППР).
 4. Обогатительная фабрика — в ночную смену внеплановых нарядов примерно в 2 раза больше.
 5. Ковалёв И. — списывает материалы примерно в 2 раза выше нормы.
"""
from __future__ import annotations

import argparse
import heapq
import random
from dataclasses import dataclass, field
from datetime import datetime, timedelta

from app.auth import hash_pin
from app.db import Base, SessionLocal, engine
from app.models import (
    AIAssessment,
    Brigade,
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialNorm,
    MaterialWriteOff,
    Role,
    Section,
    Status,
    Verdict,
    WorkOrder,
    WorkOrderEvent,
)

from . import reference as R

DEMO_PIN = "1234"
K3 = "Конвейер К-3"
KMD = "Дробилка КМД-1750"
BAD_WORKER = "serikov"
OVERUSE_WORKER = "kovalev"
ENRICHMENT = "Обогатительная фабрика"


@dataclass(order=True)
class Job:
    at: datetime
    seq: int
    equipment: str = field(compare=False)
    planned: bool = field(compare=False)
    fault: str | None = field(compare=False, default=None)
    origin: str = field(compare=False, default="base")  # base | k3 | ppr | repeat


def weighted(rng: random.Random, d: dict[str, float]) -> str:
    keys = list(d)
    return rng.choices(keys, weights=[d[k] for k in keys])[0]


def shift_of(t: datetime) -> str:
    return "day" if 8 <= t.hour < 20 else "night"


def night_brigade(t: datetime, start: datetime) -> int:
    """Бригады чередуются в ночь понедельно (чтобы смена не совпадала с бригадой)."""
    day = t if t.hour >= 8 else t - timedelta(days=1)
    return ((day - start).days // 7) % 3


def build_reference(db):
    sections = [Section(name=n) for n in R.SECTIONS]
    db.add_all(sections)
    db.flush()
    equipment = {}
    for name, inv, sec, typ, crit in R.EQUIPMENT:
        e = Equipment(name=name, inv_no=inv, section_id=sections[sec].id, type=typ, criticality=crit,
                      qr_code=f"NARYAD:{inv}")
        db.add(e)
        equipment[name] = e
    brigades = [Brigade(name=f"Бригада №{i}") for i in (1, 2, 3)]
    db.add_all(brigades)
    faults = {}
    for code, cat, name, hours, _ in R.FAULT_CODES:
        f = FaultCode(code=code, category=cat, name=name, norm_hours=hours)
        db.add(f)
        faults[code] = f
    materials = {}
    for name, unit in R.MATERIALS:
        m = Material(name=name, unit=unit)
        db.add(m)
        materials[name] = m
    db.flush()
    for code, items in R.MATERIAL_NORMS.items():
        for mname, qty in items:
            db.add(MaterialNorm(fault_code_id=faults[code].id, material_id=materials[mname].id,
                                typical_qty=qty))

    pin = hash_pin(DEMO_PIN)  # один хеш на всех — быстрее, ПИН у всех демо-учёток одинаковый
    workers = []
    for full, spec, grade, br, login in R.WORKERS:
        w = Employee(full_name=full, specialty=spec, grade=grade, brigade_id=brigades[br].id,
                     role=Role.worker, login=login, pin_hash=pin)
        db.add(w)
        workers.append(w)
    masters = []
    for i, (full, login) in enumerate(R.MASTERS):
        m = Employee(full_name=full, specialty="Мастер смены", grade=0, role=Role.master,
                     shift="day" if i == 0 else "night", login=login, pin_hash=pin)
        db.add(m)
        masters.append(m)
    db.add(Employee(full_name=R.MANAGER[0], specialty="Главный механик", grade=0, role=Role.manager,
                    login=R.MANAGER[1], pin_hash=pin))
    db.add(Employee(full_name=R.ADMIN[0], specialty="Администратор", grade=0, role=Role.admin,
                    login=R.ADMIN[1], pin_hash=pin))
    db.flush()
    return equipment, brigades, faults, materials, workers, masters


def generate(days: int = 92, seed: int = 42) -> None:
    rng = random.Random(seed)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    equipment, brigades, faults, materials, workers, masters = build_reference(db)
    fault_spec = {c[0]: c[4] for c in R.FAULT_CODES}
    eq_section = {e.name: R.SECTIONS[R.EQUIPMENT[i][2]] for i, e in enumerate(equipment.values())}
    eq_type = {e.name: e.type for e in equipment.values()}
    worker_by_login = {w.login: w for w in workers}
    brigade_idx = {b.id: i for i, b in enumerate(brigades)}

    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    start = today - timedelta(days=days)
    end = today  # история — до вчерашнего дня включительно; сегодняшнюю смену создаём отдельно

    # ------------------------------------------------ 1. поток событий-«поломок» и ППР
    heap: list[Job] = []
    seq = 0

    def push(job_at, eq, planned, fault=None, origin="base"):
        nonlocal seq
        if start <= job_at < end:
            seq += 1
            heapq.heappush(heap, Job(job_at, seq, eq, planned, fault, origin))

    base_rate = 0.075  # внеплановых в смену на единицу оборудования
    for eq in equipment:
        for d in range(days):
            for sh in ("day", "night"):
                rate = base_rate
                if eq == K3:
                    rate *= 3.2                                 # закономерность 1
                if eq_section[eq] == ENRICHMENT and sh == "night":
                    rate *= 2.2                                 # закономерность 4
                if eq_type[eq] in ("станок", "сварочное оборудование", "циклон"):
                    rate *= 0.5
                n = sum(1 for _ in range(3) if rng.random() < rate / 3)
                for _ in range(n):
                    h = rng.uniform(8, 20) if sh == "day" else rng.uniform(20, 32)
                    push(start + timedelta(days=d, hours=h), eq, False,
                         origin="k3" if eq == K3 else "base")
        # ППР каждые ~14 дней, дневная смена
        t = start + timedelta(days=rng.randint(0, 13))
        while t < end:
            push(t.replace(hour=rng.randint(8, 11), minute=rng.choice([0, 15, 30])), eq, True)
            t += timedelta(days=rng.randint(12, 16))

    # ------------------------------------------------ 2. моделирование выполнения
    busy_until: dict[int, datetime] = {w.id: start for w in workers}
    orders: list[dict] = []

    def pick_worker(t: datetime, spec: str) -> Employee:
        if shift_of(t) == "night":
            pool = [w for w in workers if brigade_idx[w.brigade_id] == night_brigade(t, start)]
        else:
            nb = night_brigade(t, start)
            pool = [w for w in workers if brigade_idx[w.brigade_id] != nb]
        cands = [w for w in pool if w.specialty == spec] or pool
        free = [w for w in cands if busy_until[w.id] <= t]
        return rng.choice(free or cands)

    while heap:
        job = heapq.heappop(heap)
        t = job.at
        eq = equipment[job.equipment]
        if job.planned:
            fault = rng.choice(["С-01", "С-02", "М-06"])
            spec = "Слесарь"
        else:
            if job.fault:
                fault = job.fault
            elif job.equipment == K3 and rng.random() < 0.7:
                fault = "М-02"                                  # закономерность 1
            else:
                fault = weighted(rng, R.TYPE_FAULTS[eq.type])
            spec = fault_spec[fault]
        worker = pick_worker(t, spec)
        master = masters[0] if shift_of(t) == "day" else masters[1]
        norm = faults[fault].norm_hours

        if job.planned:
            priority = "planned"
        else:
            crit_boost = 0.15 if eq.criticality == 1 else 0
            priority = rng.choices(["emergency", "high", "normal"],
                                   weights=[0.22 + crit_boost, 0.45, 0.33 - crit_boost])[0]
        slack = {"emergency": 1, "high": 2, "normal": 6, "planned": 24}[priority]
        deadline = t + timedelta(hours=norm * 1.3 + slack)

        is_bad = worker.login == BAD_WORKER
        events = [("issued", master, t, None, Status.issued, None, None)]
        cur = t
        assignee = worker

        # отказ и переназначение (~6%)
        if rng.random() < 0.06:
            cur += timedelta(minutes=rng.randint(2, 10))
            reason = rng.choice(R.VALID_REJECTS) if rng.random() < 0.7 else rng.choice(R.INVALID_REJECTS)
            events.append(("reject", assignee, cur, Status.issued, Status.rejected, None, reason))
            cur += timedelta(minutes=rng.randint(2, 8))
            others = [w for w in workers if w.specialty == spec and w.id != assignee.id] or workers
            new = rng.choice(others)
            events.append(("reassign", master, cur, Status.rejected, Status.issued,
                           f"→ {new.full_name.split()[0]}", None))
            assignee = new
            is_bad = assignee.login == BAD_WORKER

        # очередь (~10%) или сразу принятие
        accepted_at = None
        queued_at = None
        if busy_until[assignee.id] > cur and priority != "emergency" and rng.random() < 0.8:
            cur += timedelta(minutes=rng.randint(1, 6))
            queued_at = cur
            events.append(("queue", assignee, cur, Status.issued, Status.queued, None, None))
            cur = max(cur, busy_until[assignee.id]) + timedelta(minutes=rng.randint(2, 10))
            events.append(("auto_accept", None, cur, Status.queued, Status.accepted, None, None))
            accepted_at = cur
        else:
            cur += timedelta(minutes=rng.randint(1, 4) if priority == "emergency" else rng.randint(2, 15))
            accepted_at = cur
            events.append(("accept", assignee, cur, events[-1][4], Status.accepted, None, None))
        cur += timedelta(minutes=rng.randint(3, 25))
        started_at = cur
        events.append(("start", assignee, cur, Status.accepted, Status.in_progress, None, None))

        dur = norm * 60 * rng.lognormvariate(0, 0.28) * (1.15 if is_bad else 1.0)
        if rng.random() < 0.08:
            dur *= rng.uniform(1.6, 2.5)                        # затяжные работы → просрочки
        paused = 0.0
        if rng.random() < 0.15:
            p_at = cur + timedelta(minutes=dur * rng.uniform(0.2, 0.6))
            paused = rng.uniform(25, 120)
            reason = rng.choice(R.PAUSE_REASONS)
            events.append(("pause", assignee, p_at, Status.in_progress, Status.paused, None, reason))
            events.append(("resume", assignee, p_at + timedelta(minutes=paused), Status.paused,
                           Status.in_progress, None, None))
        done_at = cur + timedelta(minutes=dur + paused)

        # материалы
        overuse = assignee.login == OVERUSE_WORKER                # закономерность 5
        mats = []
        norms = R.MATERIAL_NORMS[fault]
        chosen = norms if len(norms) <= 3 else rng.sample(norms, k=rng.randint(2, len(norms)))
        if fault == "М-02":  # подшипник ставится один тип
            brg = [n for n in norms if n[0].startswith("Подшипник")]
            chosen = [rng.choice(brg)] + [n for n in norms if not n[0].startswith("Подшипник")]
        for mname, typical in chosen:
            k = rng.uniform(1.8, 2.6) if overuse else (rng.uniform(1.6, 2.2) if rng.random() < 0.03
                                                         else rng.uniform(0.7, 1.15))
            qty = typical * k
            unit = next(u for n, u in R.MATERIALS if n == mname)
            qty = max(1, round(qty)) if unit == "шт" else round(qty, 1)
            mats.append((mname, qty))

        # оценка качества
        overdue = done_at > deadline
        score = rng.gauss(86, 6)
        if is_bad:
            score = rng.gauss(68, 9)
        if overdue:
            score -= 8
        if overuse:
            score -= 12
        rework = rng.random() < (0.32 if is_bad else 0.04)
        events.append(("complete", assignee, done_at, Status.in_progress, Status.done, None, None))
        events.append(("ai_review", None, done_at + timedelta(seconds=5), Status.done, Status.ai_review,
                       None, None))
        if rework:
            events.append(("ai_verdict", None, done_at + timedelta(seconds=8), None, None,
                           "Требует доработки: описание работ не соответствует проблеме", None))
            events.append(("return_rework", None, done_at + timedelta(seconds=9), Status.ai_review,
                           Status.rework, None, "Вердикт ИИ"))
            r_start = done_at + timedelta(minutes=rng.randint(10, 40))
            events.append(("start", assignee, r_start, Status.rework, Status.in_progress, None, None))
            done_at = r_start + timedelta(minutes=norm * 60 * rng.uniform(0.3, 0.6))
            events.append(("complete", assignee, done_at, Status.in_progress, Status.done, None, None))
            events.append(("ai_review", None, done_at + timedelta(seconds=5), Status.done,
                           Status.ai_review, None, None))
            score -= 10
            overdue = done_at > deadline
        score = int(max(25, min(100, score)))
        verdict = (Verdict.accepted if score >= 85 else
                   Verdict.accepted_with_remarks if score >= 60 else Verdict.needs_rework)
        if verdict == Verdict.needs_rework:
            verdict, score = Verdict.accepted_with_remarks, 60
        remarks = []
        if overdue:
            remarks.append("выполнено с просрочкой")
        if overuse:
            remarks.append("списание материалов выше обычного расхода")
        if is_bad and score < 75:
            remarks.append("описание работ недостаточно подробное")
        expl = ("Наряд принят." if verdict == Verdict.accepted else
                "Наряд принят с замечаниями: " + (", ".join(remarks) or "незначительные отклонения") + ".")
        events.append(("ai_verdict", None, done_at + timedelta(seconds=8), None, None,
                       f"{score}/100. {expl}", None))
        closed_at = done_at + timedelta(minutes=rng.randint(10, 90))
        events.append(("approve", master, closed_at, Status.ai_review, Status.closed, None, None))

        busy_until[assignee.id] = done_at
        orders.append(dict(
            created_at=t, work_type="planned" if job.planned else "unplanned",
            description=(rng.choice(R.PLANNED_TEXT) if job.planned else rng.choice(R.PROBLEM_TEXT[fault])),
            equipment=eq, assignee=assignee, master=master, priority=priority, deadline=deadline,
            accepted_at=accepted_at, queued_at=queued_at, started_at=started_at, done_at=done_at,
            closed_at=closed_at, paused=paused, fault=fault,
            work_done=(R.WORK_TEXT[fault] if not (is_bad and rng.random() < 0.4) else "Сделано"),
            mats=mats, score=score, verdict=verdict, expl=expl, events=events,
            brigade_id=assignee.brigade_id,
        ))

        # закономерность 2: после ремонта Серикова поломка повторяется в течение 7 дней
        if not job.planned and assignee.login == BAD_WORKER and rng.random() < 0.45:
            push(done_at + timedelta(days=rng.uniform(1.5, 6)), job.equipment, False, fault, "repeat")
        # закономерность 3: после ППР дробилки КМД-1750 — поломка через 2–5 дней
        if job.planned and job.equipment == KMD and rng.random() < 0.8:
            push(done_at + timedelta(days=rng.uniform(2, 5)), job.equipment, False,
                 rng.choice(["М-06", "Г-01", "М-02"]), "ppr")

    # ------------------------------------------------ 3. запись в БД
    orders.sort(key=lambda o: o["created_at"])
    for num, o in enumerate(orders, 1):
        wo = WorkOrder(
            number=num, work_type=o["work_type"], description=o["description"],
            section_id=o["equipment"].section_id, equipment_id=o["equipment"].id,
            assignee_id=o["assignee"].id, brigade_id=o["brigade_id"], master_id=o["master"].id,
            priority=o["priority"], deadline=o["deadline"], status=Status.closed,
            work_done=o["work_done"], fault_code_id=faults[o["fault"]].id,
            created_at=o["created_at"], accepted_at=o["accepted_at"], queued_at=o["queued_at"],
            started_at=o["started_at"], done_at=o["done_at"], closed_at=o["closed_at"],
            paused_minutes=o["paused"],
        )
        db.add(wo)
        db.flush()
        for action, actor, at, fs, ts, comment, reason in o["events"]:
            db.add(WorkOrderEvent(order_id=wo.id, actor_id=actor.id if actor else None, action=action,
                                  from_status=fs, to_status=ts, comment=comment, reason=reason,
                                  created_at=at))
        for mname, qty in o["mats"]:
            db.add(MaterialWriteOff(order_id=wo.id, material_id=materials[mname].id, qty=qty))
        db.add(AIAssessment(order_id=wo.id, verdict=o["verdict"], score=o["score"],
                            explanation=o["expl"], worker_report=f"Оценка: {o['score']}/100. {o['expl']}",
                            details={"engine": "seed"}, created_at=o["done_at"] + timedelta(seconds=8)))

    # ------------------------------------------------ 4. текущая смена (для демо)
    nb = night_brigade(datetime.now(), start)
    is_day = 8 <= datetime.now().hour < 20
    for w in workers:
        in_night = brigade_idx[w.brigade_id] == nb
        w.on_shift = in_night != is_day
        w.shift = "night" if in_night else "day"

    # Гарантируем, что главные герои демо на смене
    ahmetov = worker_by_login["ahmetov"]
    serikov = worker_by_login["serikov"]
    zhaksybekov = worker_by_login["zhaksybekov"]
    kovalev = worker_by_login["kovalev"]
    ahmetov.on_shift = True
    serikov.on_shift = True
    zhaksybekov.on_shift = True
    kovalev.on_shift = True

    # Для Серикова создаём наряд «В работе» — чтобы в панели мастера было видно 🟡 В работе
    now_dt = datetime.now()
    demo_order_num = len(orders) + 1
    eq_k4 = equipment["Конвейер К-4"]
    wo_serikov = WorkOrder(
        number=demo_order_num,
        work_type="unplanned",
        description="Замена повреждённых роликов холостой ветви",
        section_id=eq_k4.section_id,
        equipment_id=eq_k4.id,
        assignee_id=serikov.id,
        brigade_id=serikov.brigade_id,
        master_id=masters[0].id,
        priority="normal",
        deadline=now_dt + timedelta(hours=3),
        status=Status.in_progress,
        created_at=now_dt - timedelta(minutes=45),
        accepted_at=now_dt - timedelta(minutes=40),
        started_at=now_dt - timedelta(minutes=30),
    )
    db.add(wo_serikov)
    db.flush()
    db.add(WorkOrderEvent(order_id=wo_serikov.id, actor_id=masters[0].id, action="issued",
                          from_status=None, to_status=Status.issued, created_at=now_dt - timedelta(minutes=45)))
    db.add(WorkOrderEvent(order_id=wo_serikov.id, actor_id=serikov.id, action="accept",
                          from_status=Status.issued, to_status=Status.accepted, created_at=now_dt - timedelta(minutes=40)))
    db.add(WorkOrderEvent(order_id=wo_serikov.id, actor_id=serikov.id, action="start",
                          from_status=Status.accepted, to_status=Status.in_progress, created_at=now_dt - timedelta(minutes=30)))

    db.commit()
    db.close()

    k3 = sum(1 for o in orders if o["equipment"].name == K3 and o["work_type"] == "unplanned")
    avg = sum(1 for o in orders if o["work_type"] == "unplanned") / len(equipment)
    print(f"Сгенерировано нарядов: {len(orders)} за {days} дней "
          f"(внеплановых: {sum(1 for o in orders if o['work_type'] == 'unplanned')}).")
    print(f"  К-3: {k3} внеплановых при среднем {avg:.1f} на единицу оборудования")
    print(f"  Повторных поломок после Серикова: {sum(1 for o in orders if False)}"
          if False else "", end="")
    print(f"Учётные записи: master1, master2, boss, admin, исполнители — по фамилии (ahmetov, serikov…). "
          f"ПИН у всех: {DEMO_PIN}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=92)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    generate(args.days, args.seed)
```

---

### Файл: `backend/seed/reference.py`

```python
"""Справочники и шаблоны для генератора тестовых данных «Костанайские минералы»."""

SECTIONS = ["Участок дробления", "Обогатительная фабрика", "Участок сушки",
            "Ремонтно-механический цех"]

# (название, инв. номер, участок, тип, критичность 1–3)
EQUIPMENT = [
    ("Дробилка КМД-1750", "ДР-001", 0, "дробилка", 1),
    ("Дробилка ККД-1500", "ДР-002", 0, "дробилка", 1),
    ("Дробилка СМД-110", "ДР-003", 0, "дробилка", 2),
    ("Конвейер К-1", "КН-001", 0, "конвейер", 2),
    ("Конвейер К-2", "КН-002", 0, "конвейер", 2),
    ("Питатель пластинчатый ПП-1", "ПТ-001", 0, "питатель", 2),
    ("Грохот ГИТ-51", "ГР-001", 0, "грохот", 2),
    ("Конвейер К-3", "КН-003", 1, "конвейер", 1),
    ("Конвейер К-4", "КН-004", 1, "конвейер", 2),
    ("Грохот ГИЛ-52", "ГР-002", 1, "грохот", 2),
    ("Насос ГрАТ-1400 №1", "НС-001", 1, "насос", 1),
    ("Насос ГрАТ-1400 №2", "НС-002", 1, "насос", 2),
    ("Сепаратор СВ-1", "СП-001", 1, "сепаратор", 2),
    ("Циклон ЦН-15", "ЦК-001", 1, "циклон", 3),
    ("Вентилятор ВДН-12", "ВН-001", 1, "вентилятор", 2),
    ("Сушильный барабан СБ-2.8", "СБ-001", 2, "сушильный барабан", 1),
    ("Дымосос ДН-15", "ДМ-001", 2, "дымосос", 2),
    ("Конвейер К-5", "КН-005", 2, "конвейер", 2),
    ("Элеватор ковшовый Э-1", "ЭЛ-001", 2, "элеватор", 2),
    ("Маслостанция МС-32", "НС-003", 2, "насос", 3),
    ("Токарный станок 1М63", "СТ-001", 3, "станок", 3),
    ("Кран-балка КБ-5", "КР-001", 3, "кран", 2),
    ("Компрессор К-250", "КМ-001", 3, "компрессор", 2),
    ("Сварочный пост СП-1", "СВ-001", 3, "сварочное оборудование", 3),
    ("Пресс гидравлический П-100", "ПР-001", 3, "пресс", 3),
]

# (код, категория, название, норматив ч, специальность)
FAULT_CODES = [
    ("М-01", "М", "Износ футеровки / бронеплит", 4.0, "Слесарь"),
    ("М-02", "М", "Разрушение подшипника", 3.0, "Слесарь"),
    ("М-03", "М", "Износ роликов / барабана", 2.0, "Слесарь"),
    ("М-04", "М", "Порыв конвейерной ленты", 5.0, "Слесарь"),
    ("М-05", "М", "Неисправность редуктора", 6.0, "Слесарь"),
    ("М-06", "М", "Ослабление крепежа, вибрация", 1.5, "Слесарь"),
    ("М-07", "М", "Трещина металлоконструкции", 3.0, "Сварщик"),
    ("М-08", "М", "Износ зубчатой передачи", 5.0, "Слесарь"),
    ("Э-01", "Э", "Отказ электродвигателя", 4.0, "Электрик"),
    ("Э-02", "Э", "Повреждение кабеля", 2.0, "Электрик"),
    ("Э-03", "Э", "Неисправность пускателя / автомата", 1.5, "Электрик"),
    ("Э-04", "Э", "Отказ датчика", 1.0, "Электрик"),
    ("Э-05", "Э", "Неисправность освещения", 1.0, "Электрик"),
    ("Г-01", "Г", "Течь масла / гидрожидкости", 2.0, "Слесарь"),
    ("Г-02", "Г", "Отказ гидронасоса", 4.0, "Слесарь"),
    ("Г-03", "Г", "Повреждение РВД", 1.5, "Слесарь"),
    ("П-01", "П", "Утечка сжатого воздуха", 1.0, "Слесарь"),
    ("П-02", "П", "Неисправность пневмоцилиндра", 2.0, "Слесарь"),
    ("С-01", "С", "Нарушение смазки узла", 1.0, "Слесарь"),
    ("С-02", "С", "Загрязнение / замена масла", 1.5, "Слесарь"),
]

MATERIALS = [
    ("Подшипник 22220", "шт"), ("Подшипник 3626", "шт"), ("Подшипник 6312", "шт"),
    ("Ролик конвейерный Ж-127", "шт"), ("Лента конвейерная ЕР-400", "м"), ("Клей для стыковки ленты", "кг"),
    ("Болт М20", "шт"), ("Гайка М20", "шт"), ("Масло индустриальное И-40", "л"),
    ("Масло трансмиссионное ТАД-17", "л"), ("Смазка Литол-24", "кг"), ("Смазка ЦИАТИМ-201", "кг"),
    ("Манжета армированная", "шт"), ("Сальниковая набивка", "м"), ("Кольцо уплотнительное", "шт"),
    ("Рукав высокого давления", "шт"), ("Гидрожидкость МГЕ-46", "л"), ("Кабель ВВГ 4×16", "м"),
    ("Кабель КГ 3×6", "м"), ("Пускатель ПМЛ-2100", "шт"), ("Автоматический выключатель 63А", "шт"),
    ("Датчик индуктивный", "шт"), ("Лампа светодиодная 50 Вт", "шт"), ("Изолента ПВХ", "шт"),
    ("Наконечник кабельный", "шт"), ("Электроды УОНИ-13/55", "кг"), ("Лист стальной 10 мм", "кг"),
    ("Уголок 50×50", "м"), ("Плита футеровочная", "шт"), ("Шестерня ведомая", "шт"),
    ("Муфта упругая МУВП", "шт"), ("Пневмоцилиндр", "шт"), ("Фитинг пневматический", "шт"),
    ("Шланг пневматический", "м"), ("Ветошь", "кг"), ("Растворитель", "л"),
    ("Фильтр масляный", "шт"), ("Ремень клиновой", "шт"), ("Втулка бронзовая", "шт"),
    ("Шпонка", "шт"),
]

# шифр → [(материал, обычный расход)]
MATERIAL_NORMS = {
    "М-01": [("Плита футеровочная", 4), ("Болт М20", 8), ("Гайка М20", 8)],
    "М-02": [("Подшипник 22220", 1), ("Подшипник 3626", 1), ("Подшипник 6312", 2),
             ("Смазка Литол-24", 0.5), ("Ветошь", 1)],
    "М-03": [("Ролик конвейерный Ж-127", 3), ("Подшипник 6312", 2), ("Смазка Литол-24", 0.3)],
    "М-04": [("Лента конвейерная ЕР-400", 6), ("Клей для стыковки ленты", 2), ("Болт М20", 4)],
    "М-05": [("Масло трансмиссионное ТАД-17", 20), ("Шестерня ведомая", 1), ("Манжета армированная", 2),
             ("Подшипник 3626", 2), ("Кольцо уплотнительное", 4)],
    "М-06": [("Болт М20", 6), ("Гайка М20", 6), ("Шпонка", 1), ("Муфта упругая МУВП", 1),
             ("Ремень клиновой", 2)],
    "М-07": [("Электроды УОНИ-13/55", 3), ("Лист стальной 10 мм", 15), ("Уголок 50×50", 3)],
    "М-08": [("Шестерня ведомая", 1), ("Масло трансмиссионное ТАД-17", 10), ("Втулка бронзовая", 2)],
    "Э-01": [("Подшипник 6312", 2), ("Кабель КГ 3×6", 5), ("Наконечник кабельный", 6), ("Изолента ПВХ", 1)],
    "Э-02": [("Кабель ВВГ 4×16", 10), ("Наконечник кабельный", 6), ("Изолента ПВХ", 2)],
    "Э-03": [("Пускатель ПМЛ-2100", 1), ("Автоматический выключатель 63А", 1), ("Наконечник кабельный", 4)],
    "Э-04": [("Датчик индуктивный", 1), ("Кабель КГ 3×6", 3)],
    "Э-05": [("Лампа светодиодная 50 Вт", 4), ("Изолента ПВХ", 1)],
    "Г-01": [("Манжета армированная", 2), ("Кольцо уплотнительное", 4), ("Масло индустриальное И-40", 10),
             ("Сальниковая набивка", 2), ("Ветошь", 2)],
    "Г-02": [("Гидрожидкость МГЕ-46", 20), ("Кольцо уплотнительное", 6), ("Фильтр масляный", 1)],
    "Г-03": [("Рукав высокого давления", 1), ("Гидрожидкость МГЕ-46", 5), ("Кольцо уплотнительное", 2)],
    "П-01": [("Фитинг пневматический", 3), ("Шланг пневматический", 3)],
    "П-02": [("Пневмоцилиндр", 1), ("Фитинг пневматический", 2)],
    "С-01": [("Смазка Литол-24", 1), ("Смазка ЦИАТИМ-201", 0.5), ("Ветошь", 1)],
    "С-02": [("Масло индустриальное И-40", 20), ("Фильтр масляный", 1), ("Растворитель", 2), ("Ветошь", 2)],
}

# тип оборудования → вероятные шифры (с весами)
TYPE_FAULTS = {
    "дробилка": {"М-01": 4, "М-02": 3, "М-05": 2, "М-06": 2, "Г-01": 3, "Э-01": 1, "С-01": 2, "М-07": 1},
    "конвейер": {"М-02": 3, "М-03": 4, "М-04": 3, "М-06": 2, "Э-01": 1, "Э-03": 1, "С-01": 1},
    "питатель": {"М-06": 3, "М-08": 2, "М-02": 2, "Э-03": 1, "М-07": 1},
    "грохот": {"М-06": 4, "М-02": 3, "М-07": 2, "Э-01": 1},
    "насос": {"Г-01": 4, "М-02": 2, "Э-01": 2, "Г-02": 2, "С-02": 1, "Э-04": 1},
    "сепаратор": {"М-02": 2, "Э-01": 2, "Э-04": 2, "М-06": 2},
    "циклон": {"М-07": 3, "М-01": 2},
    "вентилятор": {"М-02": 3, "М-06": 3, "Э-01": 2, "С-01": 1},
    "сушильный барабан": {"М-08": 2, "М-02": 2, "М-07": 2, "Э-04": 2, "С-01": 2},
    "дымосос": {"М-02": 3, "М-06": 2, "Э-01": 2},
    "элеватор": {"М-04": 2, "М-06": 2, "М-02": 2, "Э-03": 1},
    "станок": {"Э-03": 2, "С-02": 2, "М-08": 1, "Э-05": 1},
    "кран": {"Э-02": 2, "Э-03": 2, "М-02": 1, "Э-05": 1},
    "компрессор": {"П-01": 3, "П-02": 1, "С-02": 2, "Э-01": 1},
    "сварочное оборудование": {"Э-02": 3, "Э-03": 2},
    "пресс": {"Г-01": 3, "Г-03": 3, "Г-02": 1, "П-02": 1},
}

# Описание проблемы (мастер) и выполненных работ (исполнитель) по шифру
PROBLEM_TEXT = {
    "М-01": ["Износ футеровки, стук при работе", "Износ бронеплит, снижение производительности"],
    "М-02": ["Посторонний шум и нагрев подшипникового узла", "Вибрация, гул в районе подшипника приводного барабана",
             "Заклинил подшипник, повышенная температура узла"],
    "М-03": ["Не вращаются ролики, лента сходит", "Износ роликоопор, шум"],
    "М-04": ["Порыв ленты, конвейер остановлен", "Надрыв кромки ленты"],
    "М-05": ["Шум в редукторе, течь масла из редуктора", "Редуктор греется, стук"],
    "М-06": ["Сильная вибрация, ослабли болты крепления", "Повышенная вибрация рамы"],
    "М-07": ["Трещина на раме", "Трещина корпуса, нужна сварка"],
    "М-08": ["Износ зубчатой передачи, стук", "Проскальзывание шестерни"],
    "Э-01": ["Двигатель не запускается", "Перегрев электродвигателя, срабатывает защита"],
    "Э-02": ["Повреждён кабель питания", "Искрит кабель, оплавлена изоляция"],
    "Э-03": ["Не включается пускатель", "Выбивает автомат при пуске"],
    "Э-04": ["Не работает датчик скорости", "Ложные срабатывания датчика"],
    "Э-05": ["Не работает освещение на участке", "Перегорели светильники"],
    "Г-01": ["Течь масла на насосе", "Течь масла из-под уплотнения", "Подтекает гидравлика"],
    "Г-02": ["Не создаёт давление гидронасос", "Шум гидронасоса, падение давления"],
    "Г-03": ["Порыв РВД", "Течь рукава высокого давления"],
    "П-01": ["Утечка воздуха, падает давление", "Шипит пневмолиния"],
    "П-02": ["Не срабатывает пневмоцилиндр", "Медленно ходит пневмоцилиндр"],
    "С-01": ["Сухой узел, нет смазки", "Не поступает смазка в узел"],
    "С-02": ["Загрязнённое масло, требуется замена", "Потемнело масло, превышен срок замены"],
}

WORK_TEXT = {
    "М-01": "Заменены плиты футеровки, протянут крепёж",
    "М-02": "Заменён подшипник, узел смазан, проверен нагрев после пуска",
    "М-03": "Заменены изношенные ролики, отрегулирован ход ленты",
    "М-04": "Выполнена стыковка ленты, проверено натяжение",
    "М-05": "Редуктор разобран, заменены шестерня и уплотнения, залито масло",
    "М-06": "Протянут крепёж, заменена шпонка, вибрация в норме",
    "М-07": "Трещина заварена, усилена накладкой",
    "М-08": "Заменена шестерня и втулки, проверено зацепление",
    "Э-01": "Двигатель проверен, заменены подшипники, восстановлено подключение",
    "Э-02": "Заменён повреждённый участок кабеля, проверена изоляция",
    "Э-03": "Заменён пускатель, проверена работа схемы",
    "Э-04": "Заменён датчик, выполнена настройка",
    "Э-05": "Заменены светильники, освещение восстановлено",
    "Г-01": "Заменены манжеты и уплотнения, течь устранена, долито масло",
    "Г-02": "Гидронасос отремонтирован, заменён фильтр, давление в норме",
    "Г-03": "Заменён РВД, долита гидрожидкость",
    "П-01": "Заменены фитинги и участок шланга, утечка устранена",
    "П-02": "Заменён пневмоцилиндр, проверена работа",
    "С-01": "Узел прошприцован, восстановлена подача смазки",
    "С-02": "Масло слито, промыто, залито новое, заменён фильтр",
}

PLANNED_TEXT = [
    "Плановый осмотр и ТО по графику ППР",
    "Плановая замена смазки и протяжка крепежа",
    "ППР: ревизия узлов, проверка износа",
]

# (ФИО, специальность, разряд, бригада 0–2, логин)
WORKERS = [
    ("Ахметов Ерлан Серикович", "Слесарь", 5, 0, "ahmetov"),
    ("Ковалёв Игорь Петрович", "Слесарь", 4, 0, "kovalev"),        # закономерность: перерасход материалов
    ("Нурланов Асхат Болатович", "Слесарь", 6, 0, "nurlanov"),
    ("Жаксыбеков Ринат Маратович", "Электрик", 5, 0, "zhaksybekov"),
    ("Петренко Олег Викторович", "Сварщик", 5, 0, "petrenko"),
    ("Сериков Данияр Канатович", "Слесарь", 4, 1, "serikov"),      # закономерность: повторные отказы
    ("Иванов Сергей Николаевич", "Слесарь", 5, 1, "ivanov"),
    ("Тулегенов Арман Ерикович", "Слесарь", 4, 1, "tulegenov"),
    ("Бекмуханов Талгат Сапарович", "Электрик", 6, 1, "bekmuhanov"),
    ("Григорьев Денис Андреевич", "Сварщик", 4, 1, "grigoriev"),
    ("Омаров Бауыржан Нурланович", "Слесарь", 5, 2, "omarov"),
    ("Сидоренко Максим Юрьевич", "Слесарь", 3, 2, "sidorenko"),
    ("Касымов Ержан Айдарович", "Электрик", 4, 2, "kasymov"),
    ("Морозов Алексей Игоревич", "Электрик", 5, 2, "morozov"),
    ("Абдрахманов Нурсултан Ерланович", "Сварщик", 5, 2, "abdrahmanov"),
]

MASTERS = [("Исмаилов Марат Кайратович", "master1"), ("Волков Андрей Сергеевич", "master2")]
MANAGER = ("Сагинтаев Болат Амангельдиевич", "boss")
ADMIN = ("Администратор системы", "admin")

VALID_REJECTS = ["Нет материалов", "Нет допуска", "Занят аварийным нарядом"]
INVALID_REJECTS = ["Конец смены", "Не хочу", "Пусть другой сделает"]
PAUSE_REASONS = ["Ждёт запчасти", "Ждёт остановки оборудования", "Обед / перерыв"]
```

---

### Файл: `backend/tests/test_exports_nlp.py`

```python
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
```

---

### Файл: `backend/tests/test_lifecycle.py`

```python
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

    def test_z_create_order_retry_on_collision(self):
        # Проверяем, что при коллизии уникального номера срабатывает retry через savepoint
        calls = 0
        orig_next = svc.next_number

        def mock_next(db):
            nonlocal calls
            calls += 1
            if calls == 1:
                return 1  # уже существует в БД
            return orig_next(db)

        try:
            svc.next_number = mock_next
            o = svc.create_order(self.db, self.master, OrderCreate(
                work_type=WorkType.planned, description="Retry order", equipment_id=self.equipment.id,
                assignee_id=self.worker1.id, priority=Priority.normal, deadline=datetime.now() + timedelta(hours=4)
            ))
            self.assertIsNotNone(o)
            self.assertGreater(calls, 1)
        finally:
            svc.next_number = orig_next


if __name__ == "__main__":
    unittest.main()
```

---

### Файл: `docker-compose.yml`

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: naryad_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: naryad
      POSTGRES_USER: naryad
      POSTGRES_PASSWORD: naryad_secret_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: naryad_backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql+psycopg://naryad:naryad_secret_password@db:5432/naryad
      JWT_SECRET: production-secret-key-kosta-minerals
      DEADLINE_CHECK_INTERVAL_SEC: 15
    volumes:
      - media_data:/app/media
    ports:
      - "8000:8000"
    depends_on:
      - db

volumes:
  pgdata:
  media_data:
```

---

### Файл: `frontend/android/app/src/main/AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

    <!-- Permissions -->

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>
```

---

### Файл: `frontend/android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml`

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="108dp"
    android:height="108dp"
    android:viewportHeight="108"
    android:viewportWidth="108">
    <path
        android:fillType="evenOdd"
        android:pathData="M32,64C32,64 38.39,52.99 44.13,50.95C51.37,48.37 70.14,49.57 70.14,49.57L108.26,87.69L108,109.01L75.97,107.97L32,64Z"
        android:strokeColor="#00000000"
        android:strokeWidth="1">
        <aapt:attr name="android:fillColor">
            <gradient
                android:endX="78.5885"
                android:endY="90.9159"
                android:startX="48.7653"
                android:startY="61.0927"
                android:type="linear">
                <item
                    android:color="#44000000"
                    android:offset="0.0" />
                <item
                    android:color="#00000000"
                    android:offset="1.0" />
            </gradient>
        </aapt:attr>
    </path>
    <path
        android:fillColor="#FFFFFF"
        android:fillType="nonZero"
        android:pathData="M66.94,46.02L66.94,46.02C72.44,50.07 76,56.61 76,64L32,64C32,56.61 35.56,50.11 40.98,46.06L36.18,41.19C35.45,40.45 35.45,39.3 36.18,38.56C36.91,37.81 38.05,37.81 38.78,38.56L44.25,44.05C47.18,42.57 50.48,41.71 54,41.71C57.48,41.71 60.78,42.57 63.68,44.05L69.11,38.56C69.84,37.81 70.98,37.81 71.71,38.56C72.44,39.3 72.44,40.45 71.71,41.19L66.94,46.02ZM62.94,56.92C64.08,56.92 65,56.01 65,54.88C65,53.76 64.08,52.85 62.94,52.85C61.8,52.85 60.88,53.76 60.88,54.88C60.88,56.01 61.8,56.92 62.94,56.92ZM45.06,56.92C46.2,56.92 47.13,56.01 47.13,54.88C47.13,53.76 46.2,52.85 45.06,52.85C43.92,52.85 43,53.76 43,54.88C43,56.01 43.92,56.92 45.06,56.92Z"
        android:strokeColor="#00000000"
        android:strokeWidth="1" />
</vector>
```

---

### Файл: `frontend/android/app/src/main/res/drawable/ic_launcher_background.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportHeight="108"
    android:viewportWidth="108">
    <path
        android:fillColor="#26A69A"
        android:pathData="M0,0h108v108h-108z" />
    <path
        android:fillColor="#00000000"
        android:pathData="M9,0L9,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M19,0L19,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M29,0L29,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M39,0L39,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M49,0L49,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M59,0L59,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M69,0L69,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M79,0L79,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M89,0L89,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M99,0L99,108"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,9L108,9"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,19L108,19"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,29L108,29"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,39L108,39"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,49L108,49"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,59L108,59"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,69L108,69"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,79L108,79"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,89L108,89"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M0,99L108,99"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M19,29L89,29"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M19,39L89,39"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M19,49L89,49"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M19,59L89,59"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M19,69L89,69"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M19,79L89,79"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M29,19L29,89"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M39,19L39,89"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M49,19L49,89"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M59,19L59,89"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M69,19L69,89"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
    <path
        android:fillColor="#00000000"
        android:pathData="M79,19L79,89"
        android:strokeColor="#33FFFFFF"
        android:strokeWidth="0.8" />
</vector>
```

---

### Файл: `frontend/android/app/src/main/res/layout/activity_main.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <WebView
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

---

### Файл: `frontend/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

---

### Файл: `frontend/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

---

### Файл: `frontend/android/app/src/main/res/values/ic_launcher_background.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
```

---

### Файл: `frontend/android/app/src/main/res/values/strings.xml`

```xml
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">НарядAI</string>
    <string name="title_activity_main">НарядAI</string>
    <string name="package_name">kz.km.naryadai</string>
    <string name="custom_url_scheme">kz.km.naryadai</string>
</resources>
```

---

### Файл: `frontend/android/app/src/main/res/values/styles.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>

    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <!-- Customize your theme here. -->
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
    </style>


    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
    </style>
</resources>
```

---

### Файл: `frontend/android/app/src/main/res/xml/config.xml`

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
  <access origin="*" />
  
  
</widget>
```

---

### Файл: `frontend/android/app/src/main/res/xml/file_paths.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="my_images" path="." />
    <cache-path name="my_cache_images" path="." />
</paths>
```

---

### Файл: `frontend/android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml`

```xml
<?xml version='1.0' encoding='utf-8'?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
xmlns:amazon="http://schemas.amazon.com/apk/res/android">
<application  android:usesCleartextTraffic="true">

</application>

</manifest>
```

---

### Файл: `frontend/android/gradlew.bat`

```bat
@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem
@rem SPDX-License-Identifier: Apache-2.0
@rem

@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
@rem This is normally unused
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if %ERRORLEVEL% equ 0 goto execute

echo. 1>&2
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH. 1>&2
echo. 1>&2
echo Please set the JAVA_HOME variable in your environment to match the 1>&2
echo location of your Java installation. 1>&2

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo. 1>&2
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME% 1>&2
echo. 1>&2
echo Please set the JAVA_HOME variable in your environment to match the 1>&2
echo location of your Java installation. 1>&2

goto fail

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar


@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:end
@rem End local scope for the variables with windows NT shell
if %ERRORLEVEL% equ 0 goto mainEnd

:fail
rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd.exe /c_ return code!
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% equ 0 set EXIT_CODE=1
if not ""=="%GRADLE_EXIT_CONSOLE%" exit %EXIT_CODE%
exit /b %EXIT_CODE%

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
```

---

### Файл: `frontend/capacitor.config.ts`

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kz.km.naryadai',
  appName: 'НарядAI',
  webDir: 'dist',
  server: {
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
```

---

### Файл: `frontend/index.html`

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#1e293b" />
    <title>НарядAI — АО «Костанайские Минералы»</title>
  </head>
  <body class="bg-slate-900 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### Файл: `frontend/package.json`

```json
{
  "name": "naryad-ai-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@capacitor/android": "^8.5.2",
    "@capacitor/cli": "^7.6.9",
    "@capacitor/core": "^8.5.2",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^5.4.14"
  }
}
```

---

### Файл: `frontend/postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

### Файл: `frontend/src/components/CloseOrderModal.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { WorkOrder, FaultCode, Material } from '../types';
import { X, Camera, Plus, Trash2, CheckCircle2, AlertTriangle, Sparkles, Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../utils/useVoice';

interface CloseOrderModalProps {
  order: WorkOrder;
  onClose: () => void;
  onSuccess: () => void;
}

export const CloseOrderModal: React.FC<CloseOrderModalProps> = ({ order, onClose, onSuccess }) => {
  const [faultCodes, setFaultCodes] = useState<FaultCode[]>([]);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);

  const [workDone, setWorkDone] = useState('');
  const [faultCodeId, setFaultCodeId] = useState<number | ''>('');
  const [materials, setMaterials] = useState<Array<{ material_id: number; qty: number }>>([]);
  const [comment, setComment] = useState('');
  const [photoAfter, setPhotoAfter] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isListening: isListeningWork, toggleListening: toggleVoiceWork } = useVoiceInput((transcript) => {
    setWorkDone(prev => (prev ? `${prev} ${transcript}` : transcript));
  });

  useEffect(() => {
    async function loadDicts() {
      try {
        const dicts = await api.getDictionaries();
        setFaultCodes(dicts.fault_codes);
        setMaterialsList(dicts.materials);

        // Авто-подбор шифра по описанию
        const lowerDesc = order.description.toLowerCase();
        let matched = dicts.fault_codes.find((f: any) => lowerDesc.includes(f.name.toLowerCase()));
        if (!matched) {
          if (lowerDesc.includes('масл') || lowerDesc.includes('течь')) {
            matched = dicts.fault_codes.find((f: any) => f.code === 'Г-01');
          } else if (lowerDesc.includes('подшипник')) {
            matched = dicts.fault_codes.find((f: any) => f.code === 'М-02');
          }
        }
        if (matched) {
          setFaultCodeId(matched.id);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadDicts();
  }, [order.description]);

  // Демо-пресет: Заполнить корректно с материалами и фото
  const fillGoodDemo = () => {
    const fc = faultCodes.find(f => f.code === 'Г-01') || faultCodes[0];
    if (fc) setFaultCodeId(fc.id);
    setWorkDone('Заменены изношенные манжеты и уплотнительные кольца гидронасоса, долито индустриальное масло И-40, течь устранена, проверена работа под нагрузкой');
    
    const m1 = materialsList.find(m => m.name.includes('Манжета'));
    const m2 = materialsList.find(m => m.name.includes('Масло индустриальное'));
    const mats: any[] = [];
    if (m1) mats.push({ material_id: m1.id, qty: 2 });
    if (m2) mats.push({ material_id: m2.id, qty: 10 });
    setMaterials(mats);
    setComment('Оборудование выведено на номинальный режим работы');
  };

  // Демо-пресет: Заполнить с нарушениями (без фото, завышение материалов) для Шага 7
  const fillBadDemo = () => {
    const fc = faultCodes.find(f => f.code === 'Г-01') || faultCodes[0];
    if (fc) setFaultCodeId(fc.id);
    setWorkDone('Сделано быстро');
    const m2 = materialsList.find(m => m.name.includes('Масло индустриальное'));
    if (m2) {
      setMaterials([{ material_id: m2.id, qty: 40 }]); // норма 10 -> завышение в 4 раза!
    }
    setPhotoAfter(null);
    setComment('Без замечаний');
  };

  const addMaterialRow = () => {
    if (materialsList.length > 0) {
      setMaterials([...materials, { material_id: materialsList[0].id, qty: 1 }]);
    }
  };

  const removeMaterialRow = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterialRow = (index: number, field: 'material_id' | 'qty', value: any) => {
    const next = [...materials];
    next[index] = { ...next[index], [field]: value };
    setMaterials(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Сначала загружаем фото «после», если приложено
      if (photoAfter) {
        await api.uploadPhoto(order.id, 'after', photoAfter);
      }

      // 2. Отправляем действие complete с формой закрытия
      await api.applyAction(order.id, 'complete', undefined, undefined, {
        work_done: workDone,
        fault_code_id: faultCodeId ? Number(faultCodeId) : null,
        materials: materials.map(m => ({ material_id: Number(m.material_id), qty: Number(m.qty) })),
        comment,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка закрытия наряда');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Заголовок */}
        <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-white">Форма закрытия наряда №{order.number}</h3>
            <p className="text-xs text-slate-400">{order.equipment.name} • {order.section.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Быстрые кнопки пресетов для сценария защиты */}
        <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-700/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Пресеты сценария демо:</span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={fillGoodDemo}
              className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg font-medium transition"
            >
              ✓ Шаг 5: Идеально с фото
            </button>
            <button
              type="button"
              onClick={fillBadDemo}
              className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg font-medium transition"
            >
              ⚠ Шаг 7: Ошибка для ИИ
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          
          {/* Шифр неисправности */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Шифр неисправности (раздел 5.3) *
            </label>
            <select
              value={faultCodeId}
              onChange={(e) => setFaultCodeId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              required
            >
              <option value="">Выберите шифр...</option>
              {faultCodes.map(f => (
                <option key={f.id} value={f.id}>
                  [{f.code}] {f.name} (норма: {f.norm_hours}ч)
                </option>
              ))}
            </select>
          </div>

          {/* Описание выполненных работ */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">
                Выполненные работы (текст / голос) *
              </label>
              <button
                type="button"
                onClick={toggleVoiceWork}
                className={`flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold transition ${
                  isListeningWork
                    ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-md shadow-red-950'
                    : 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-emerald-400'
                }`}
                title="Голосовой ввод выполненных работ"
              >
                {isListeningWork ? <MicOff size={12} /> : <Mic size={12} />}
                <span>{isListeningWork ? 'Слушаю...' : 'Голос'}</span>
              </button>
            </div>
            <textarea
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              rows={3}
              placeholder="Детально опишите, какие узлы заменены, что отрегулировано (или надиктуйте голосом)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Списание материалов */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-300 font-semibold">Списанные материалы и запчасти</label>
              <button
                type="button"
                onClick={addMaterialRow}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
              >
                <Plus size={14} />
                <span>Добавить материал</span>
              </button>
            </div>

            {materials.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                Материалы не добавлены (нажмите «Добавить материал», если использовались запчасти)
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((m, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                    <select
                      value={m.material_id}
                      onChange={(e) => updateMaterialRow(idx, 'material_id', Number(e.target.value))}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                    >
                      {materialsList.map(mat => (
                        <option key={mat.id} value={mat.id}>{mat.name} ({mat.unit})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={m.qty}
                      onChange={(e) => updateMaterialRow(idx, 'qty', Number(e.target.value))}
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => removeMaterialRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Фото «после» */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Фото «после» ремонта (обязательно для внеплановых работ)
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer flex items-center space-x-2 bg-slate-900 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition">
                <Camera size={18} className="text-emerald-400" />
                <span className="text-xs">{photoAfter ? 'Фото «после» выбрано' : 'Сделать фото «после»'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPhotoAfter(e.target.files[0]);
                    }
                  }}
                />
              </label>
              {photoAfter ? (
                <span className="text-xs text-emerald-400 font-semibold truncate max-w-xs">
                  ✓ {photoAfter.name}
                </span>
              ) : (
                <span className="text-xs text-amber-400">
                  (ИИ требует фото для вердикта «Принято»)
                </span>
              )}
            </div>
          </div>

          {/* Комментарий */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Дополнительный комментарий</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Примечание мастера / рабочего..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Кнопки действий */}
          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white bg-slate-700/60 rounded-xl transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center space-x-2 btn-touch disabled:opacity-50"
            >
              {submitting ? (
                <span>ИИ проверяет наряд...</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Отправить на проверку ИИ</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
```

---

### Файл: `frontend/src/components/MasterAssistantModal.tsx`

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { AssistantResponse } from '../types';
import { useVoiceInput } from '../utils/useVoice';
import { 
  X, Sparkles, Send, Mic, MicOff, Users, Clock, AlertTriangle, 
  CheckCircle, ArrowRight, ExternalLink, Bot, RotateCcw 
} from 'lucide-react';

interface MasterAssistantModalProps {
  onClose: () => void;
  onSelectOrder?: (orderId: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  response?: AssistantResponse;
  timestamp: string;
}

export const MasterAssistantModal: React.FC<MasterAssistantModalProps> = ({ onClose, onSelectOrder }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Здравствуйте! Я автономный ИИ-ассистент мастера «НарядAI». Задайте мне вопрос текстом или голосом — я проанализирую текущую смену, статусы слесарей и электриков, просрочки и оборудование.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, toggleListening } = useVoiceInput((transcript) => {
    if (transcript && transcript.trim()) {
      setInputQuery(transcript);
      handleSend(transcript);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askAssistant(q);
      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        sender: 'assistant',
        text: res.answer,
        response: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        sender: 'assistant',
        text: '❌ Не удалось получить ответ: ' + (err.message || 'Ошибка связи с сервером'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Кто сейчас свободен из электриков?',
    'Кто сейчас свободен из слесарей?',
    'Что просрочено на смене?',
    'Сводка по смене',
    'Топ проблемного оборудования',
    'Сформируй отчёт по участку дробления',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-850 border border-slate-700 w-full max-w-2xl h-[85vh] max-h-[750px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Заголовок */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30 flex items-center justify-center">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">ИИ-Ассистент мастера смены</h3>
                <span className="text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  On-Premise NLP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Раздел 6.7 кейса • Голосовой и текстовый диалог со сменными данными
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Быстрые подсказки */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 shrink-0 overflow-x-auto">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center space-x-1 shrink-0">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Примеры:</span>
            </span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="shrink-0 px-2.5 py-1 bg-slate-850 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-700 rounded-lg transition text-xs whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-md ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {/* Заголовок сообщения ИИ */}
                {m.sender === 'assistant' && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold mb-1.5 pb-1 border-b border-slate-700">
                    <span className="flex items-center space-x-1">
                      <Sparkles size={12} />
                      <span>ИИ-Аналитик «НарядAI»</span>
                    </span>
                    <span className="text-slate-400 font-normal">{m.timestamp}</span>
                  </div>
                )}

                {/* Основной текст ответа */}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>

                {/* Если в ответе есть структурированные данные по исполнителям */}
                {m.response?.intent === 'free_workers' && Array.isArray(m.response.data) && m.response.data.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-2">
                    <div className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
                      <Users size={13} className="text-emerald-400" />
                      <span>Исполнители, готовые к назначению:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.response.data.map((w: any) => (
                        <div
                          key={w.id}
                          className="p-2 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-white">{w.name}</div>
                            <div className="text-[10px] text-slate-400">{w.specialty} • {w.grade} разряд</div>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                            {w.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Если в ответе есть структурированные данные по просроченным нарядам */}
                {m.response?.intent === 'overdue_orders' && Array.isArray(m.response.data) && m.response.data.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-2">
                    <div className="text-[11px] font-bold text-red-400 flex items-center space-x-1">
                      <AlertTriangle size={13} />
                      <span>Просроченные наряды:</span>
                    </div>
                    <div className="space-y-1.5">
                      {m.response.data.map((ord: any) => (
                        <div
                          key={ord.id}
                          className="p-2.5 bg-red-950/30 rounded-xl border border-red-800/80 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-white">
                              Наряд #{ord.number} — <span className="text-slate-300 font-normal">{ord.equipment}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Исполнитель: {ord.assignee}</div>
                          </div>
                          {onSelectOrder && (
                            <button
                              onClick={() => onSelectOrder(ord.id)}
                              className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 transition"
                            >
                              <span>Открыть</span>
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Рекомендации следующих вопросов */}
                {m.response?.suggestions && m.response.suggestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700">
                    <div className="text-[10px] text-slate-400 font-semibold mb-1.5">Возможные уточнения:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.response.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="text-[11px] px-2 py-0.5 bg-slate-900 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-700 rounded-md transition text-left"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Время отправки пользователем */}
                {m.sender === 'user' && (
                  <div className="text-[10px] text-emerald-200 mt-1 text-right font-medium">
                    {m.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 w-fit">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              <span>ИИ анализирует оперативные данные смены...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода вопроса + Голосовой ввод */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-700/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            {/* Кнопка микрофона для голосового ввода */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border transition flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-900/50'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title={isListening ? 'Идёт распознавание голоса... Нажмите для отмены' : 'Голосовой запрос (микрофон)'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isListening ? 'Говорите вопрос в микрофон...' : 'Задайте вопрос смены (текстом или голосом)...'}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Спросить</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
```

---

### Файл: `frontend/src/components/Navbar.tsx`

```tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, LogOut, Shield, Wrench, BarChart2, RefreshCw, 
  Wifi, WifiOff, Volume2, VolumeX, Globe 
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    user, quickSwitch, logout, notifications, unreadCount,
    soundEnabled, toggleSound, playAlertSound, isOnline, lang, setLang, t,
    offlineCount, syncOfflineNow
  } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const demoUsers = [
    { login: 'master1', name: 'Исмаилов М. (Мастер смены)', role: 'master', icon: Shield },
    { login: 'ahmetov', name: 'Ахметов Е. (Слесарь, свободен)', role: 'worker', icon: Wrench },
    { login: 'serikov', name: 'Сериков Д. (Слесарь, в работе)', role: 'worker', icon: Wrench },
    { login: 'boss', name: 'Сагинтаев Б. (Гл. механик)', role: 'manager', icon: BarChart2 },
  ];

  return (
    <>
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Логотип и слоган */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl font-black text-xl tracking-wider shadow-lg shadow-emerald-900/40">
              НAI
            </div>
            <div>
              <div className="font-bold text-lg text-white leading-tight flex items-center gap-2">
                {t('appName')}
                <span className="text-[10px] uppercase font-semibold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  {t('orgName')}
                </span>
              </div>
              <div className="text-xs text-slate-400 hidden sm:block">
                {t('slogan')}
              </div>
            </div>
          </div>

          {/* Навигационные табы (для мастера/руководителя) */}
          {user && user.role !== 'worker' && (
            <nav className="hidden md:flex space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setCurrentTab('master')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentTab === 'master' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('tabMaster')}
              </button>
              <button
                onClick={() => setCurrentTab('analytics')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentTab === 'analytics' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('tabAnalytics')}
              </button>
              <button
                onClick={() => setCurrentTab('rating')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentTab === 'rating' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('tabRating')}
              </button>
            </nav>
          )}

          {/* Правый блок: Индикатор сети, Звук, Язык, Демо-роль, Колокольчик */}
          {user && (
            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              
              {/* Индикатор онлайн/офлайн */}
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                  isOnline 
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                    : 'bg-red-950/60 border-red-700 text-red-300 animate-pulse'
                }`}
                title={isOnline ? t('online') : t('offline')}
              >
                {isOnline ? <Wifi size={13} className="text-emerald-400" /> : <WifiOff size={13} className="text-red-400" />}
                <span className="hidden xl:inline">{isOnline ? t('online') : t('offline')}</span>
              </div>

              {/* Очередь офлайн-действий */}
              {offlineCount > 0 && (
                <button
                  onClick={() => syncOfflineNow()}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950/80 border border-amber-500 text-amber-200 hover:bg-amber-900 transition shadow animate-pulse"
                  title="Есть сохранённые офлайн-действия. Нажмите для синхронизации с сервером"
                >
                  <RefreshCw size={12} className="text-amber-400" />
                  <span>{offlineCount} {lang === 'kz' ? 'офлайн' : 'офлайн'}</span>
                </button>
              )}

              {/* Переключатель звука + тест звука */}
              <div className="flex items-center bg-slate-700/60 rounded-lg border border-slate-600">
                <button
                  onClick={toggleSound}
                  className={`p-1.5 rounded-l-lg transition ${
                    soundEnabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={soundEnabled ? t('soundOn') : t('soundMuted')}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => playAlertSound(true, true)}
                  className="px-1.5 py-1 text-[10px] text-slate-400 hover:text-white border-l border-slate-600 font-semibold"
                  title="Тест звукового оповещения"
                >
                  Тест
                </button>
              </div>

              {/* Переключатель языка RU / KZ */}
              <button
                onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
                className="flex items-center space-x-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-2 py-1.5 rounded-lg border border-slate-600 font-bold transition"
                title="Тілді ауыстыру / Сменить язык"
              >
                <Globe size={13} className="text-emerald-400" />
                <span>{lang.toUpperCase()}</span>
              </button>

              {/* Кнопка быстрого переключения роли для Демо */}
              <div className="relative">
                <button
                  onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                  className="flex items-center space-x-1 text-xs bg-slate-700/80 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-600 transition"
                  title="Переключить роль для демонстрации"
                >
                  <RefreshCw size={13} className="text-emerald-400" />
                  <span className="hidden sm:inline">Роль:</span>
                  <span className="font-semibold text-emerald-400">{user.short_name}</span>
                </button>

                {showSwitchMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 z-50">
                    <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700/60 mb-1">
                      Быстрое переключение (Demo Day)
                    </div>
                    {demoUsers.map((u) => (
                      <button
                        key={u.login}
                        onClick={() => {
                          quickSwitch(u.login);
                          setShowSwitchMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 transition ${
                          user.login === u.login ? 'bg-emerald-950/60 text-emerald-300 font-semibold' : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <u.icon size={15} className={user.login === u.login ? 'text-emerald-400' : 'text-slate-400'} />
                        <span>{u.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Колокольчик уведомлений */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg relative transition"
                  title="Уведомления"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                      <span className="font-semibold text-sm text-slate-200">Уведомления ИИ</span>
                      <span className="text-xs text-slate-400">{notifications.length} событий</span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Уведомлений нет</div>
                    ) : (
                      <div className="divide-y divide-slate-700/50">
                        {notifications.map((n) => (
                          <div key={n.id} className={`p-3 text-xs ${n.urgent ? 'bg-red-950/20' : ''}`}>
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span className={n.urgent ? 'text-red-400' : 'text-emerald-400'}>
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Кнопка выхода */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 bg-slate-700/60 hover:bg-slate-700 rounded-lg transition"
                title="Выйти"
              >
                <LogOut size={17} />
              </button>

            </div>
          )}

        </div>
      </header>

      {/* Мобильная панель переключения вкладок (для мастера и руководителя) */}
      {user && user.role !== 'worker' && (
        <div className="md:hidden bg-slate-900 border-b border-slate-700/80 px-3 py-2 flex space-x-1.5 overflow-x-auto shadow-inner">
          <button
            onClick={() => setCurrentTab('master')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center whitespace-nowrap transition btn-touch ${
              currentTab === 'master' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {t('tabMaster')}
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center whitespace-nowrap transition btn-touch ${
              currentTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {t('tabAnalytics')}
          </button>
          <button
            onClick={() => setCurrentTab('rating')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center whitespace-nowrap transition btn-touch ${
              currentTab === 'rating' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {t('tabRating')}
          </button>
        </div>
      )}

      {/* Оповещение об отключении от сети (офлайн-индикатор) */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center shadow flex items-center justify-center space-x-2">
          <WifiOff size={14} />
          <span>Связь с сервером прервана. НарядAI работает в автономном режиме кэширования.</span>
        </div>
      )}
    </>
  );
};

```

---

### Файл: `frontend/src/components/NewOrderModal.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Section, Equipment, User, Priority, WorkType } from '../types';
import { X, Sparkles, AlertTriangle, Clock, Camera, Check, ShieldAlert, Mic, MicOff, QrCode, Search } from 'lucide-react';
import { useVoiceInput } from '../utils/useVoice';

interface NewOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ onClose, onSuccess }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);

  const [sectionId, setSectionId] = useState<number | ''>('');
  const [equipmentId, setEquipmentId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('emergency');
  const [workType, setWorkType] = useState<WorkType>('unplanned');
  const [assigneeId, setAssigneeId] = useState<number | ''>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [suggestedFault, setSuggestedFault] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [deadlineMinutes, setDeadlineMinutes] = useState<number>(priority === 'emergency' ? 120 : 480);
  const [masterComment, setMasterComment] = useState('');

  const handleSelectByQr = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    const found = allEquipment.find(e => 
      (e.qr_code && e.qr_code.toUpperCase() === code) ||
      (e.inv_no && e.inv_no.toUpperCase() === code) ||
      (e.qr_code && e.qr_code.toUpperCase().includes(code)) ||
      (e.inv_no && e.inv_no.toUpperCase().includes(code)) ||
      (e.name && e.name.toUpperCase().includes(code))
    );
    if (found) {
      setSectionId(found.section_id);
      setEquipmentId(found.id);
      setShowQrModal(false);
      setQrInput('');
      setError(null);
    } else {
      setError(`Оборудование с кодом "${rawCode}" не найдено в базе данных`);
    }
  };

  const { isListening, toggleListening } = useVoiceInput((transcript) => {
    setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
  });

  useEffect(() => {
    async function loadData() {
      try {
        const dicts = await api.getDictionaries();
        setSections(dicts.sections);
        setAllEquipment(dicts.equipment);
        const wList = await api.getWorkers();
        setWorkers(wList);

        // По умолчанию для демо выбираем Обогатительную фабрику и Насос ГрАТ-1400 №1
        if (dicts.sections.length > 1) {
          const enrichSec = dicts.sections.find(s => s.name.includes('Обогатительная')) || dicts.sections[0];
          setSectionId(enrichSec.id);
          const pump = dicts.equipment.find((e: any) => e.section_id === enrichSec.id && e.name.includes('ГрАТ'));
          if (pump) {
            setEquipmentId(pump.id);
            setDescription('Течь масла на насосе из-под уплотнения вала');
          }
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadData();
  }, []);

  // ИИ-подбор исполнителя при выборе оборудования или описания
  useEffect(() => {
    if (!equipmentId) return;
    async function fetchAiCandidates() {
      setLoadingAi(true);
      try {
        const candidates = await api.suggestAssignee(Number(equipmentId), description);
        setAiSuggestions(candidates);
        if (candidates.length > 0 && !assigneeId) {
          setAssigneeId(candidates[0].id); // автоматически выбираем лучшего кандидата!
        }
      } catch {
        // ignore
      } finally {
        setLoadingAi(false);
      }
    }
    const timer = setTimeout(fetchAiCandidates, 300);
    return () => clearTimeout(timer);
  }, [equipmentId, description]);

  // ИИ-подсказка шифра неисправности и норматива времени по описанию (раздел 5.1 п.4)
  useEffect(() => {
    if (!description || description.trim().length < 4) {
      setSuggestedFault(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.suggestFaultCode(description);
        if (res && res.code) {
          setSuggestedFault(res);
        } else {
          setSuggestedFault(null);
        }
      } catch {
        setSuggestedFault(null);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [description]);

  const filteredEquipment = allEquipment.filter(e => !sectionId || e.section_id === Number(sectionId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId) {
      setError('Выберите оборудование');
      return;
    }
    if (!description.trim()) {
      setError('Укажите описание проблемы');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const deadlineDate = new Date(Date.now() + Number(deadlineMinutes) * 60000).toISOString();
      const order = await api.createOrder({
        work_type: workType,
        description,
        equipment_id: Number(equipmentId),
        assignee_id: assigneeId ? Number(assigneeId) : null,
        priority,
        deadline: deadlineDate,
        comment: masterComment.trim() || undefined,
      });

      if (photoFile && order.id) {
        await api.uploadPhoto(order.id, 'before', photoFile);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка создания наряда');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Заголовок */}
        <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Выдача наряда (быстро в ≤ 6 нажатий)</h3>
              <p className="text-xs text-slate-400">Мастер смены • мобильный ввод</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          
          {/* Приоритет (Крупные кнопки) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Приоритет наряда</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setPriority('emergency'); setWorkType('unplanned'); }}
                className={`p-2.5 rounded-xl font-bold flex flex-col items-center justify-center border transition btn-touch ${
                  priority === 'emergency' 
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🚨 Аварийный</span>
                <span className="text-[10px] opacity-80">срочно в работу</span>
              </button>

              <button
                type="button"
                onClick={() => { setPriority('high'); setWorkType('unplanned'); }}
                className={`p-2.5 rounded-xl font-bold flex flex-col items-center justify-center border transition btn-touch ${
                  priority === 'high' 
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-950' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>⚠️ Высокий</span>
                <span className="text-[10px] opacity-80">в течение 4ч</span>
              </button>

              <button
                type="button"
                onClick={() => { setPriority('normal'); }}
                className={`p-2.5 rounded-xl font-bold flex flex-col items-center justify-center border transition btn-touch ${
                  priority === 'normal' 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📋 Обычный</span>
                <span className="text-[10px] opacity-80">по очереди</span>
              </button>
            </div>
          </div>

          {/* Быстрый выбор по QR-коду (Бонус Section 10) */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
            <span className="text-slate-400 text-xs font-medium">Агрегат / Цех:</span>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-600 rounded-lg text-xs font-bold transition btn-touch"
            >
              <QrCode size={14} />
              <span>📷 Сканировать QR-код</span>
            </button>
          </div>

          {/* Участок и оборудование */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Участок</label>
              <select
                value={sectionId}
                onChange={(e) => {
                  setSectionId(Number(e.target.value));
                  setEquipmentId('');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Выберите участок...</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Оборудование *</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                required
              >
                <option value="">Выберите оборудование...</option>
                {filteredEquipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.inv_no})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Описание проблемы */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">Описание неисправности</label>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold transition ${
                    isListening
                      ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-md shadow-red-950'
                      : 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-emerald-400'
                  }`}
                  title="Голосовой ввод (распознавание речи)"
                >
                  {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                  <span>{isListening ? 'Слушаю...' : 'Голос'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDescription('Течь масла на насосе из-под уплотнения')}
                  className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300"
                >
                  Пресет: Течь масла
                </button>
                <button
                  type="button"
                  onClick={() => setDescription('Сильный нагрев и шум подшипникового узла')}
                  className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300"
                >
                  Пресет: Подшипник
                </button>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Опишите видимый дефект или симптомы поломки (или надиктуйте голосом)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
            {suggestedFault && (
              <div className="mt-1.5 p-2 bg-emerald-950/40 border border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
                <div className="flex items-center space-x-1.5 truncate">
                  <Sparkles size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">
                    ИИ-подсказка шифра: <strong>[{suggestedFault.code}] {suggestedFault.name}</strong> (норматив: ~{suggestedFault.norm_hours}ч)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-300 font-bold ml-2 shrink-0 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                  {suggestedFault.confidence}% совпадение
                </span>
              </div>
            )}
          </div>

          {/* ИИ-подбор исполнителя */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <Sparkles size={16} className="text-emerald-400" />
                <span>ИИ-подбор исполнителя (раздел 5.1 п.3)</span>
              </label>
              {loadingAi && <span className="text-[11px] text-emerald-400 animate-pulse">ИИ подбирает...</span>}
            </div>

            {aiSuggestions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {aiSuggestions.slice(0, 2).map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => setAssigneeId(cand.id)}
                    className={`p-2 rounded-xl border cursor-pointer transition ${
                      assigneeId === cand.id
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950'
                        : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{cand.short_name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300">
                        {cand.live?.state === 'free' ? '🟢 Свободен' : '🟡 В работе'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{cand.specialty}, {cand.grade} разряд</div>
                    <div className="text-[10px] text-emerald-400 mt-1 italic leading-tight">
                      ★ {cand.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Выпадающий список всех исполнителей */}
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">Назначить позже / свободный пул</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.short_name} ({w.specialty}) — {w.live?.label}
                </option>
              ))}
            </select>
          </div>

          {/* Нормативный срок / Дедлайн (с пресетом Демо: 1 мин для Шага 4) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold text-xs flex items-center space-x-1.5">
                <span>Срок выполнения наряда (дедлайн)</span>
              </label>
              <span className={`text-[11px] font-bold ${deadlineMinutes === 1 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {deadlineMinutes === 1 ? '⚡ ДЕМО: 1 минута (просрочка вживую)' : `+${deadlineMinutes >= 60 ? (deadlineMinutes/60) + ' ч' : deadlineMinutes + ' мин'}`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: '⚡ Демо 1м', val: 1 },
                { label: '30 мин', val: 30 },
                { label: '2 часа', val: 120 },
                { label: '4 часа', val: 240 },
                { label: '8 часов', val: 480 },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setDeadlineMinutes(opt.val)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition text-center ${
                    deadlineMinutes === opt.val
                      ? opt.val === 1 
                        ? 'bg-red-950 border-red-500 text-red-200 shadow-md shadow-red-950' 
                        : 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Комментарий мастера */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-xs">Указания мастера смены (опционально)</label>
            <input
              type="text"
              value={masterComment}
              onChange={(e) => setMasterComment(e.target.value)}
              placeholder="Особые условия: выставить ограждение, проверить давление..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Фото дефекта (Камера/галерея) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Фото неисправности (до 5 фото)</label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer flex items-center space-x-2 bg-slate-900 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition">
                <Camera size={18} className="text-emerald-400" />
                <span className="text-xs">{photoFile ? 'Фото выбрано' : 'Сделать фото / Галерея'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPhotoFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
              {photoFile && (
                <span className="text-xs text-emerald-400 font-medium truncate max-w-xs">
                  ✓ {photoFile.name} (будет сжато ≤ 1600px)
                </span>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white bg-slate-700/60 rounded-xl transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center space-x-2 btn-touch disabled:opacity-50"
            >
              {submitting ? (
                <span>Выдаётся...</span>
              ) : (
                <>
                  <Check size={18} />
                  <span>Выдать наряд</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* Модальное окно быстрого сканирования QR-кода оборудования */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-850 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                  <QrCode size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Сканер QR-кода оборудования</h4>
                  <p className="text-[11px] text-slate-400">Мгновенный выбор агрегата в 1 тап (Бонус Section 10)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Визуальная рамка сканера с анимацией лазера */}
              <div className="relative w-full h-32 bg-slate-900 rounded-xl border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse top-1/2 -translate-y-1/2"></div>
                <QrCode size={40} className="text-slate-700 mb-1" />
                <span className="text-xs text-emerald-300 font-medium z-10 bg-slate-900/80 px-2 py-0.5 rounded">
                  Камера готова • Наведите на QR-шильдик агрегата
                </span>
              </div>

              {/* Ручной ввод / быстрый поиск по коду */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Или введите инв. номер / QR вручную:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Например: НС-001, ДР-001, СБ-001..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSelectByQr(qrInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectByQr(qrInput)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Search size={14} />
                    <span>Найти</span>
                  </button>
                </div>
              </div>

              {/* Быстрые пресеты оборудования комбината для Demo */}
              <div className="space-y-2 pt-2 border-t border-slate-700/80">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Шильдики на агрегатах комбината (клик для быстрого выбора):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {allEquipment.slice(0, 10).map((eq) => (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => handleSelectByQr(eq.inv_no || eq.qr_code || eq.name)}
                      className="p-2 bg-slate-900 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-700 rounded-xl text-left transition flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-xs text-white truncate">{eq.name}</div>
                        <div className="text-[10px] text-slate-400">{eq.section}</div>
                      </div>
                      <span className="font-mono text-[10px] font-black bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
                        {eq.inv_no}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### Файл: `frontend/src/components/OrderDetailsModal.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { WorkOrder, User, Priority } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  X, CheckCircle, AlertOctagon, Clock, Wrench, Shield, Sparkles, 
  Image as ImageIcon, ArrowRight, MessageSquare, Printer,
  UserPlus, Flag, Ban 
} from 'lucide-react';

interface OrderDetailsModalProps {
  orderId: number;
  onClose: () => void;
  onRefresh: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, onClose, onRefresh }) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [masterScoreInput, setMasterScoreInput] = useState<number | ''>('');
  const [masterComment, setMasterComment] = useState('');
  const [reworkReason, setReworkReason] = useState('');
  const [showReworkInput, setShowReworkInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Управление нарядом мастером (раздел 5.1 п.5)
  const [workersList, setWorkersList] = useState<User[]>([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignWorkerId, setReassignWorkerId] = useState<number | ''>('');
  const [reassignComment, setReassignComment] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrder = async () => {
    try {
      const data = await api.getOrder(orderId);
      setOrder(data);
      if (data.assessment) {
        setMasterScoreInput(data.assessment.master_score ?? data.assessment.score);
        setMasterComment(data.assessment.master_comment || '');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="text-emerald-400 font-semibold text-sm animate-pulse">Загрузка данных наряда...</div>
      </div>
    );
  }

  const isMaster = user?.role === 'master' || user?.role === 'admin';
  const photosBefore = order.photos?.filter(p => p.kind === 'before') || [];
  const photosAfter = order.photos?.filter(p => p.kind === 'after') || [];

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.applyAction(order.id, 'approve');
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const handleReturnRework = async () => {
    if (!reworkReason.trim()) {
      setError('Укажите причину возврата на доработку');
      return;
    }
    setActionLoading(true);
    try {
      await api.applyAction(order.id, 'return_rework', reworkReason);
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  const handleSaveScore = async () => {
    if (masterScoreInput === '') return;
    try {
      await api.setMasterScore(order.id, Number(masterScoreInput), masterComment);
      await fetchOrder();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user?.role === 'master' || user?.role === 'admin') {
      api.getWorkers().then(setWorkersList).catch(() => {});
    }
  }, [user]);

  const handleReassign = async () => {
    if (!reassignWorkerId) {
      setError('Выберите нового исполнителя');
      return;
    }
    setActionLoading(true);
    try {
      await api.reassignOrder(order.id, Number(reassignWorkerId), reassignComment);
      setShowReassignModal(false);
      setReassignComment('');
      await fetchOrder();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка переназначения исполнителя');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePriority = async (p: Priority) => {
    setActionLoading(true);
    try {
      await api.changeOrderPriority(order.id, p);
      setShowPriorityModal(false);
      await fetchOrder();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка изменения приоритета');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setError('Укажите причину отмены наряда');
      return;
    }
    setActionLoading(true);
    try {
      await api.cancelOrder(order.id, cancelReason);
      setShowCancelModal(false);
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка отмены наряда');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Шапка модалки */}
        <div className="px-5 py-4 bg-slate-900/80 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-lg font-black text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
              #{order.number}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">{order.equipment.name}</h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  order.priority === 'emergency' ? 'bg-red-500/20 text-red-400 border border-red-800' :
                  order.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-800' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {order.priority_label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                  {order.status_label}
                </span>
              </div>
              <p className="text-xs text-slate-400">{order.section.name} • Инв. № {order.equipment.inv_no}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.open(api.getOrderPrintUrl(order.id), '_blank')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-600 text-xs font-semibold transition"
              title="Печать или экспорт наряда в PDF"
            >
              <Printer size={15} className="text-emerald-400" />
              <span className="hidden sm:inline">Печать / PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Тело карточки со скроллом */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* Основные детали */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
            <div>
              <span className="text-slate-400 text-xs block">Описание проблемы (мастер):</span>
              <p className="font-medium text-slate-200 mt-0.5">{order.description}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Исполнитель:</span>
              <p className="font-medium text-slate-200 mt-0.5">
                {order.assignee ? `${order.assignee.full_name} (${order.assignee.specialty})` : 'Не назначен'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Срок исполнения:</span>
              <p className={`font-medium mt-0.5 ${order.overdue ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                {new Date(order.deadline).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                {order.overdue && ` (Просрочен на ${order.overdue_minutes} мин)`}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Мастер смены:</span>
              <p className="font-medium text-slate-200 mt-0.5">{order.master.full_name}</p>
            </div>
          </div>

          {/* Панель оперативного управления мастера (раздел 5.1 п.5: переназначение, приоритет, отмена) */}
          {isMaster && order.status !== 'closed' && order.status !== 'cancelled' && (
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Shield size={14} className="text-emerald-400" />
                <span>Мастер смены (раздел 5.1 п.5):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setReassignWorkerId(order.assignee?.id || ''); setShowReassignModal(true); }}
                  className="px-2.5 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1 btn-touch"
                  title="Переназначить исполнителя"
                >
                  <UserPlus size={13} />
                  <span>Переназначить</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPriorityModal(true)}
                  className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1 btn-touch"
                  title="Изменить приоритет наряда"
                >
                  <Flag size={13} />
                  <span>Приоритет: {order.priority_label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1 btn-touch"
                  title="Отменить наряд с фиксацией причины"
                >
                  <Ban size={13} />
                  <span>Отменить...</span>
                </button>
              </div>
            </div>
          )}

          {/* Результаты выполнения (если закрыто или на проверке) */}
          {(order.work_done || order.fault_code) && (
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-sm text-white mb-2 flex items-center space-x-2">
                <Wrench size={16} className="text-emerald-400" />
                <span>Отчёт о выполненной работе</span>
              </h4>
              <div className="space-y-2">
                {order.fault_code && (
                  <div>
                    <span className="text-slate-400 text-xs">Шифр неисправности: </span>
                    <span className="font-bold text-emerald-400">[{order.fault_code.code}] {order.fault_code.name}</span>
                    <span className="text-xs text-slate-500 ml-2">(норма: {order.fault_code.norm_hours} ч)</span>
                  </div>
                )}
                {order.work_done && (
                  <div>
                    <span className="text-slate-400 text-xs block">Выполненные операции:</span>
                    <p className="text-slate-200 mt-0.5">{order.work_done}</p>
                  </div>
                )}
                {order.materials && order.materials.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-xs block mb-1">Списанные материалы:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {order.materials.map(m => (
                        <span key={m.id} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">
                          {m.name}: <strong className="text-white">{m.qty} {m.unit}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Фотографии До и После (сравнение) */}
          {(photosBefore.length > 0 || photosAfter.length > 0) && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
              <h4 className="font-bold text-sm text-white mb-3 flex items-center space-x-2">
                <ImageIcon size={16} className="text-emerald-400" />
                <span>Фотофиксация: «До» и «После» (раздел 6.3)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Фото ДО */}
                <div>
                  <span className="text-xs text-slate-400 font-semibold block mb-1.5">Фото ДО (Неисправность):</span>
                  {photosBefore.length === 0 ? (
                    <div className="h-36 bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 border border-slate-700">
                      Нет фото дефекта
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {photosBefore.map(p => (
                        <div key={p.id} className="relative group overflow-hidden rounded-xl border border-slate-700">
                          <img src={p.url} alt="До ремонта" className="w-full h-36 object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded">
                            {new Date(p.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Фото ПОСЛЕ */}
                <div>
                  <span className="text-xs text-slate-400 font-semibold block mb-1.5">Фото ПОСЛЕ (Устранение):</span>
                  {photosAfter.length === 0 ? (
                    <div className="h-36 bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 border border-slate-700">
                      Фото после ремонта отсутствует
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {photosAfter.map(p => (
                        <div key={p.id} className="relative group overflow-hidden rounded-xl border border-emerald-800/80">
                          <img src={p.url} alt="После ремонта" className="w-full h-36 object-cover" />
                          <span className="absolute bottom-1 right-1 bg-emerald-950/80 text-[10px] text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                            Проверено ИИ
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ИИ-Заключение и Оценка качества */}
          {order.assessment && (
            <div className={`p-4 rounded-xl border ${
              order.assessment.verdict === 'needs_rework' 
                ? 'bg-red-950/30 border-red-800' 
                : order.assessment.verdict === 'accepted_with_remarks'
                ? 'bg-amber-950/30 border-amber-800'
                : 'bg-emerald-950/30 border-emerald-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">ИИ-Проверка качества наряда</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Оценка ИИ:</span>
                  <span className="font-black text-lg text-emerald-400">{order.assessment.score}/100</span>
                  {order.assessment.master_score !== null && (
                    <span className="text-xs font-bold text-amber-300">
                      (Мастер изменил на {order.assessment.master_score})
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  order.assessment.verdict === 'needs_rework'
                    ? 'bg-red-900/60 text-red-200 border border-red-700'
                    : order.assessment.verdict === 'accepted_with_remarks'
                    ? 'bg-amber-900/60 text-amber-200 border border-amber-700'
                    : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700'
                }`}>
                  {order.assessment.verdict_label}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed mb-3">
                {order.assessment.explanation}
              </p>

              {/* Корректировка оценки мастером (раздел 6.4 кейса) */}
              {isMaster && (
                <div className="pt-3 border-t border-slate-700/60 flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Финальное слово за мастером:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={masterScoreInput}
                    onChange={(e) => setMasterScoreInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-bold text-white"
                  />
                  <input
                    type="text"
                    placeholder="Комментарий мастера..."
                    value={masterComment}
                    onChange={(e) => setMasterComment(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleSaveScore}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg transition"
                  >
                    Сохранить
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Журнал событий и хронология (раздел 5.5) */}
          <div>
            <h4 className="font-bold text-sm text-slate-300 mb-2">Хронология выполнения наряда</h4>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-2 max-h-40 overflow-y-auto">
              {order.events?.map(ev => (
                <div key={ev.id} className="text-xs flex items-center justify-between text-slate-300 py-1 border-b border-slate-800 last:border-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-200">{ev.action_label}</span>
                    <span className="text-slate-500">({ev.actor?.short_name || 'ИИ / система'})</span>
                    {ev.reason && <span className="text-amber-400 italic">«{ev.reason}»</span>}
                    {ev.comment && <span className="text-slate-400">({ev.comment})</span>}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Футер с кнопками принятия мастером */}
        {isMaster && order.status === 'ai_review' && (
          <div className="p-4 bg-slate-900/90 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Наряд ожидает решения мастера после проверки ИИ
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {showReworkInput ? (
                <div className="flex items-center space-x-2 w-full">
                  <input
                    type="text"
                    placeholder="Причина возврата на доработку..."
                    value={reworkReason}
                    onChange={(e) => setReworkReason(e.target.value)}
                    className="bg-slate-800 border border-red-800 rounded-xl px-3 py-2 text-xs text-white flex-1"
                  />
                  <button
                    onClick={handleReturnRework}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
                  >
                    Вернуть
                  </button>
                  <button
                    onClick={() => setShowReworkInput(false)}
                    className="text-slate-400 hover:text-white text-xs px-2"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowReworkInput(true)}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs rounded-xl transition"
                  >
                    На доработку
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition flex items-center space-x-1"
                  >
                    <CheckCircle size={16} />
                    <span>Подтвердить и закрыть наряд</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Модалка переназначения */}
        {showReassignModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 w-full max-w-md space-y-3 shadow-2xl">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                  <UserPlus size={16} className="text-blue-400" />
                  <span>Переназначение исполнителя</span>
                </h4>
                <button onClick={() => setShowReassignModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Выберите исполнителя смены:</label>
                <select
                  value={reassignWorkerId}
                  onChange={(e) => setReassignWorkerId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="">Выберите сотрудника...</option>
                  {workersList.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.short_name} ({w.specialty}) — {w.live?.label || (w.on_shift ? 'На смене' : 'Не на смене')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Причина переназначения (комментарий):</label>
                <input
                  type="text"
                  placeholder="Например: Срочный аварийный вызов на другой участок"
                  value={reassignComment}
                  onChange={(e) => setReassignComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleReassign}
                  disabled={actionLoading || !reassignWorkerId}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                >
                  Переназначить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модалка изменения приоритета */}
        {showPriorityModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-2xl">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Flag size={16} className="text-amber-400" />
                  <span>Изменение приоритета наряда</span>
                </h4>
                <button onClick={() => setShowPriorityModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['emergency', 'high', 'normal', 'planned'] as Priority[]).map((p) => {
                  const label = p === 'emergency' ? '🚨 Аварийный' : p === 'high' ? '⚠️ Высокий' : p === 'normal' ? '📋 Обычный' : '📅 Плановый';
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleChangePriority(p)}
                      disabled={actionLoading}
                      className={`p-2.5 rounded-xl font-bold text-xs border text-left transition ${
                        order.priority === p 
                          ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300' 
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Модалка отмены наряда */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-red-800 rounded-2xl p-4 w-full max-w-md space-y-3 shadow-2xl">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-red-300 flex items-center space-x-2">
                  <Ban size={16} className="text-red-400" />
                  <span>Отмена наряда мастером</span>
                </h4>
                <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Причина отмены (обязательно):</label>
                <input
                  type="text"
                  placeholder="Например: Ложное срабатывание датчика / дубликат наряда"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-900 border border-red-900/80 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={actionLoading || !cancelReason.trim()}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                >
                  Подтвердить отмену
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
```

---

### Файл: `frontend/src/context/AuthContext.tsx`

```tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, NotificationItem } from '../types';
import { api, getToken, setToken, getWsBaseUrl } from '../api';
import { Lang, translations } from '../utils/i18n';
import { getOfflineQueue, subscribeOfflineQueue, syncOfflineQueue, OfflineAction } from '../utils/offlineQueue';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (login: string, pin: string) => Promise<void>;
  quickSwitch: (login: string) => Promise<void>;
  logout: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshUser: () => Promise<void>;
  playAlertSound: (urgent?: boolean, force?: boolean) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isOnline: boolean;
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof translations['ru']) => string;
  lastEvent: any;
  offlineCount: number;
  offlineQueue: OfflineAction[];
  syncOfflineNow: () => Promise<{ synced: number; failed: number }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('naryad_sound') !== 'false';
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => getOfflineQueue());
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('naryad_lang') as Lang) || 'ru';
  });
  const wsRef = useRef<WebSocket | null>(null);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('naryad_lang', newLang);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('naryad_sound', String(next));
      return next;
    });
  }, []);

  const t = useCallback((key: keyof typeof translations['ru']): string => {
    const dict = translations[lang] || translations['ru'];
    return (dict as any)[key] || (translations['ru'] as any)[key] || key;
  }, [lang]);

  // Офлайн-очередь подписка
  useEffect(() => {
    return subscribeOfflineQueue((q) => {
      setOfflineQueue(q);
    });
  }, []);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Разблокировка Web Audio по первому клику/тачу пользователя (Autoplay Policy)
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
    };
  }, []);

  const playAlertSound = useCallback((urgent = false, force = false) => {
    if (!soundEnabled && !force) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (urgent) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // AudioContext may be restricted by browser policy before first gesture
    }
  }, [soundEnabled]);

  const loadNotifications = useCallback(async () => {
    if (!getToken()) return;
    try {
      const items = await api.getNotifications();
      setNotifications(items);
    } catch (err) {
      console.warn('Failed to load notifications', err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
      await loadNotifications();
    } catch (err) {
      console.error('Auth error', err);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadNotifications]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const syncOfflineNow = useCallback(async () => {
    const res = await syncOfflineQueue(api.applyActionDirect);
    if (res.synced > 0) {
      await refreshUser();
    }
    return res;
  }, [refreshUser]);

  // Фоновая синхронизация при возвращении сети online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineNow();
    }
  }, [isOnline, offlineQueue.length, syncOfflineNow]);

  // WebSocket Connection
  useEffect(() => {
    const token = getToken();
    if (!token || !user) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const wsBase = getWsBaseUrl();
    const wsUrl = `${wsBase}/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastEvent(data);
        if (data.type === 'notification') {
          playAlertSound(data.notification?.urgent);
          setNotifications(prev => [data.notification, ...prev]);
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 15000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [user, playAlertSound]);

  const login = async (loginName: string, pin: string) => {
    const res = await api.login(loginName, pin);
    setToken(res.token);
    setUser(res.user);
    await loadNotifications();
  };

  const quickSwitch = async (loginName: string) => {
    await login(loginName, '1234');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      quickSwitch,
      logout,
      notifications,
      unreadCount,
      refreshUser,
      playAlertSound,
      soundEnabled,
      toggleSound,
      isOnline,
      lang,
      setLang,
      t,
      lastEvent,
      offlineCount: offlineQueue.length,
      offlineQueue,
      syncOfflineNow,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

### Файл: `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}

/* Крупные кнопки для работы в перчатках (требование кейса 9.4) */
.btn-touch {
  min-height: 48px;
  min-width: 48px;
}
```

---

### Файл: `frontend/src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </React.StrictMode>
);
```

---

### Файл: `frontend/src/pages/ManagerDashboard.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Sparkles, AlertOctagon, TrendingUp, Award, Clock, 
  BarChart3, ShieldAlert, CheckCircle, FileText, FileSpreadsheet, Download, Package 
} from 'lucide-react';

interface ManagerDashboardProps {
  viewMode?: 'analytics' | 'rating';
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ viewMode = 'analytics' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'anomalies' | 'rating' | 'shift' | 'materials'>(
    viewMode === 'rating' ? 'rating' : 'anomalies'
  );
  
  const [anomaliesData, setAnomaliesData] = useState<any>(null);
  const [ratingData, setRatingData] = useState<any>(null);
  const [shiftData, setShiftData] = useState<any>(null);
  const [materialsData, setMaterialsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const [anom, rate, sh, mat] = await Promise.all([
          api.getAnomalies(90),
          api.getRating(),
          api.getShiftReport(),
          api.getMaterialsReport(90),
        ]);
        setAnomaliesData(anom);
        setRatingData(rate);
        setShiftData(sh);
        setMaterialsData(mat);
      } catch (err) {
        console.error('Error loading dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleDownloadShift = async () => {
    setExporting('shift');
    try {
      await api.downloadShiftExcel();
    } catch (err: any) {
      alert(err.message || 'Ошибка выгрузки отчёта');
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadRating = async () => {
    setExporting('rating');
    try {
      await api.downloadRatingExcel(90);
    } catch (err: any) {
      alert(err.message || 'Ошибка выгрузки рейтинга');
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadMaterials = async () => {
    setExporting('materials');
    try {
      await api.downloadMaterialsExcel(90);
    } catch (err: any) {
      alert(err.message || 'Ошибка выгрузки ТМЦ');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-emerald-400 font-bold animate-pulse">Анализ данных ИИ...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Шапка дашборда */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Аналитический центр и отчёты</span>
            <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
              ИИ-модуль 6.5
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Сводка по сменам, лидерборд качества и поиск аномалий в истории за 3 месяца
          </p>
        </div>

        {/* Переключатель вкладок */}
        <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSubTab('anomalies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'anomalies' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Аномалии и ИИ-выводы (Шаг 9)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'rating' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award size={14} />
            <span>Рейтинг рабочих (Шаг 8)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('shift')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'shift' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Отчёт за смену</span>
          </button>
          <button
            onClick={() => setActiveSubTab('materials')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'materials' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Списание ТМЦ (раздел 7)</span>
          </button>
        </div>
      </div>

      {/* Вкладка 1: ИИ-Аналитика и аномалии (Шаг 9 демо) */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-5">
          
          {/* Сводка за 90 дней */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Всего нарядов (90 дней)</div>
              <div className="text-2xl font-black text-white mt-1">{anomaliesData?.total_orders}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Внеплановых поломок</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{anomaliesData?.unplanned_orders}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Плановых ППР</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{anomaliesData?.planned_orders}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Найдено аномалий ИИ</div>
              <div className="text-2xl font-black text-red-400 mt-1">{anomaliesData?.insights?.length || 0}</div>
            </div>
          </div>

          {/* Карточки найденных закономерностей с выводами ИИ */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <Sparkles size={16} className="text-emerald-400" />
              <span>Ключевые закономерности и рекомендации ИИ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anomaliesData?.insights?.map((ins: any, idx: number) => {
                const isCrit = ins.severity === 'critical';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border shadow-md space-y-2.5 transition ${
                      isCrit 
                        ? 'bg-red-950/20 border-red-800' 
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        <h4 className="font-bold text-sm text-white">{ins.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        isCrit ? 'bg-red-900 text-red-200' : 'bg-amber-900 text-amber-200'
                      }`}>
                        {ins.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ins.text}
                    </p>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-emerald-300 leading-relaxed">
                      <strong className="block text-emerald-400 mb-0.5 font-bold">💡 Рекомендация ИИ:</strong>
                      {ins.recommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Топ проблемного оборудования */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3">
            <h3 className="font-bold text-sm text-slate-200">
              Топ-10 оборудования по количеству внеплановых остановок
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Оборудование</th>
                    <th className="py-2.5 px-3">Участок</th>
                    <th className="py-2.5 px-3 text-center">Остановок</th>
                    <th className="py-2.5 px-3 text-center">Превышение ср.</th>
                    <th className="py-2.5 px-3">Частый шифр</th>
                    <th className="py-2.5 px-3 text-right">Простой (ч)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {anomaliesData?.top_problematic?.map((row: any) => (
                    <tr key={row.equipment_id} className={row.ratio_to_avg >= 2.0 ? 'bg-red-950/20' : ''}>
                      <td className="py-2.5 px-3 font-bold text-white">{row.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{row.section}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-400">{row.unplanned_count}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.ratio_to_avg >= 2.0 ? 'bg-red-900 text-red-200' : 'bg-slate-700 text-slate-300'
                        }`}>
                          ×{row.ratio_to_avg}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">{row.top_fault || '—'} ({row.top_fault_count})</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200">{row.downtime_hours} ч</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Вкладка 2: Рейтинг исполнителей и бригад (Шаг 8 демо) */}
      {activeSubTab === 'rating' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-200 mb-1">
                  Рейтинг исполнителей смены и бригад (раздел 6.6)
                </h3>
                <p className="text-xs text-slate-400">
                  Формула: <strong>0.35·Качество + 0.25·Сроки + 0.20·(100 - Повторы) + 0.15·Объём + 0.05·(100 - Отказы)</strong>
                </p>
              </div>
              <button
                onClick={handleDownloadRating}
                disabled={exporting === 'rating'}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
              >
                <FileSpreadsheet size={14} />
                <span>{exporting === 'rating' ? 'Экспорт...' : 'Выгрузить в Excel'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Место</th>
                    <th className="py-2.5 px-3">Сотрудник</th>
                    <th className="py-2.5 px-3">Специальность</th>
                    <th className="py-2.5 px-3 text-center">Итоговый балл</th>
                    <th className="py-2.5 px-3 text-center">Качество</th>
                    <th className="py-2.5 px-3 text-center">В срок</th>
                    <th className="py-2.5 px-3 text-center">Повторные отказы</th>
                    <th className="py-2.5 px-3 text-center">Нарядов</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {ratingData?.rows?.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-700/30">
                      <td className="py-2.5 px-3 text-center font-black text-sm text-slate-400">
                        {row.place === 1 ? '🥇 1' : row.place === 2 ? '🥈 2' : row.place === 3 ? '🥉 3' : `#${row.place}`}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{row.full_name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{row.specialty}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-black text-sm">
                          {row.rating}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-200">{row.components?.quality}</td>
                      <td className="py-2.5 px-3 text-center text-slate-200">{row.components?.on_time}%</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-400">{row.repeat_failures}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-300">{row.orders_closed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Вкладка 3: Отчёт за смену */}
      {activeSubTab === 'shift' && shiftData && (
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-white">Итоговая сводка за смену</h3>
              <span className="text-xs text-slate-400">
                Суммарный простой оборудования: <strong className="text-amber-400 font-bold">{shiftData.downtime_hours} ч</strong>
              </span>
            </div>
            <button
              onClick={handleDownloadShift}
              disabled={exporting === 'shift'}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
            >
              <FileSpreadsheet size={14} />
              <span>{exporting === 'shift' ? 'Экспорт...' : 'Выгрузить в Excel'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed">
            <strong className="block text-emerald-400 font-bold mb-1">ИИ-Резюме смены:</strong>
            {shiftData.summary}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Загрузка ремонтного персонала:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {shiftData.load?.map((item: any) => (
                <div key={item.worker_id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="text-slate-400">{item.orders} нарядов • {Math.round(item.minutes / 60)} ч работы</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Вкладка 4: Списание ТМЦ и отклонения от норм */}
      {activeSubTab === 'materials' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-white mb-1">
                  Контроль списания ТМЦ и отклонений от норм (Раздел 7)
                </h3>
                <p className="text-xs text-slate-400">
                  Анализ фактического списания запчастей и материалов в сравнении с технологическими нормативами
                </p>
              </div>
              <button
                onClick={handleDownloadMaterials}
                disabled={exporting === 'materials'}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
              >
                <FileSpreadsheet size={14} />
                <span>{exporting === 'materials' ? 'Экспорт...' : 'Выгрузить в Excel'}</span>
              </button>
            </div>

            {/* Сводка KPI по материалам */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-semibold">Номенклатурных позиций</div>
                <div className="text-xl font-black text-white mt-0.5">{materialsData?.items?.length || 0}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-semibold">Всего актов списания</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{materialsData?.total_writeoffs || 0}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] text-slate-400 font-semibold">Аномалий перерасхода (&gt;40%)</div>
                <div className={`text-xl font-black mt-0.5 ${(materialsData?.anomalies_count || 0) > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  {materialsData?.anomalies_count || 0}
                </div>
              </div>
            </div>

            {/* Таблица списаний */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Материал / ТМЦ</th>
                    <th className="py-2.5 px-3 text-center">Ед. изм.</th>
                    <th className="py-2.5 px-3 text-right">Факт списано</th>
                    <th className="py-2.5 px-3 text-right">По норме</th>
                    <th className="py-2.5 px-3 text-center">Отклонение</th>
                    <th className="py-2.5 px-3 text-center">Нарядов</th>
                    <th className="py-2.5 px-3 text-center">Перерасходов</th>
                    <th className="py-2.5 px-3">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {materialsData?.items?.map((item: any) => (
                    <tr key={item.material_id} className={item.is_anomaly ? 'bg-red-950/20' : 'hover:bg-slate-700/30'}>
                      <td className="py-2.5 px-3 font-bold text-white">{item.name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">{item.total_qty}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{item.norm_qty}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.diff_pct > 20
                            ? 'bg-red-900/80 text-red-200 border border-red-700'
                            : item.diff_pct < -10
                            ? 'bg-emerald-900/60 text-emerald-200'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {item.diff_pct > 0 ? `+${item.diff_pct}%` : `${item.diff_pct}%`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{item.orders_count}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-400">{item.overuse_count}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.is_anomaly
                            ? 'bg-red-900 text-red-200 border border-red-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {item.status_label}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!materialsData?.items || materialsData.items.length === 0) && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500">
                        Данные о списаниях ТМЦ за выбранный период отсутствуют
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
```

---

### Файл: `frontend/src/types.ts`

```typescript
export type Role = 'master' | 'worker' | 'manager' | 'admin';
export type WorkType = 'planned' | 'unplanned';
export type Priority = 'emergency' | 'high' | 'normal' | 'planned';
export type Status = 
  | 'issued' 
  | 'queued' 
  | 'accepted' 
  | 'rejected' 
  | 'in_progress' 
  | 'paused' 
  | 'done' 
  | 'ai_review' 
  | 'rework' 
  | 'closed' 
  | 'cancelled';

export interface User {
  id: number;
  full_name: string;
  short_name: string;
  specialty: string;
  grade: number;
  role: Role;
  shift: string;
  on_shift: boolean;
  login: string;
  brigade?: { id: number; name: string } | null;
  live?: {
    state: 'free' | 'busy' | 'queue' | 'off';
    label: string;
    current_order?: { id: number; number: number } | null;
    queue_count: number;
  };
}

export interface Equipment {
  id: number;
  name: string;
  inv_no: string;
  type: string;
  criticality: number;
  section_id: number;
  section?: string | null;
  qr_code?: string | null;
}

export interface Section {
  id: number;
  name: string;
}

export interface FaultCode {
  id: number;
  code: string;
  category: string;
  name: string;
  norm_hours: number;
}

export interface Material {
  id: number;
  name: string;
  unit: string;
}

export interface Photo {
  id: number;
  kind: 'before' | 'after';
  url: string;
  taken_at?: string | null;
  uploaded_at: string;
  author_id?: number | null;
}

export interface OrderEvent {
  id: number;
  action: string;
  action_label: string;
  from_status?: string | null;
  to_status?: string | null;
  comment?: string | null;
  reason?: string | null;
  created_at: string;
  actor?: { id: number | null; short_name: string };
}

export interface AIAssessment {
  id: number;
  verdict: 'accepted' | 'accepted_with_remarks' | 'needs_rework';
  verdict_label: string;
  score: number;
  final_score: number;
  photo_score?: number | null;
  explanation: string;
  worker_report?: string | null;
  details: any;
  needs_master_check: boolean;
  master_score?: number | null;
  master_comment?: string | null;
  created_at: string;
}

export interface WorkOrder {
  id: number;
  number: number;
  work_type: WorkType;
  priority: Priority;
  priority_label: string;
  status: Status;
  status_label: string;
  description: string;
  section: { id: number; name: string };
  equipment: { id: number; name: string; inv_no: string };
  assignee?: { id: number; full_name: string; short_name: string; specialty: string } | null;
  master: { id: number; full_name: string; short_name: string };
  deadline: string;
  created_at: string;
  started_at?: string | null;
  done_at?: string | null;
  closed_at?: string | null;
  overdue: boolean;
  overdue_minutes: number;
  has_photo_before: boolean;
  score?: number | null;
  verdict?: string | null;
  
  // full fields
  comment?: string | null;
  work_done?: string | null;
  close_comment?: string | null;
  fault_code?: { id: number; code: string; name: string; norm_hours: number } | null;
  materials?: Array<{ id: number; material_id: number; name: string; unit: string; qty: number }>;
  photos?: Photo[];
  events?: OrderEvent[];
  assessment?: AIAssessment | null;
  work_minutes?: number | null;
  paused_minutes?: number | null;
  downtime_minutes?: number | null;
}

export interface NotificationItem {
  id: number;
  kind: string;
  title: string;
  text: string;
  order_id?: number | null;
  urgent: boolean;
  read: boolean;
  created_at: string;
}

export interface AssistantResponse {
  intent: string;
  query: string;
  answer: string;
  data?: any;
  suggestions: string[];
}
```

---

### Файл: `frontend/src/utils/useVoice.ts`

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ru-RU';

      recognition.onresult = (event: any) => {
        const text = event.results[0]?.[0]?.transcript;
        if (text) {
          onTranscript(text);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert('Голосовой ввод не поддерживается вашим браузером. Доступен в Google Chrome, Microsoft Edge и Android WebView.');
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('SpeechRecognition start error', err);
        setIsListening(false);
      }
    }
  }, [isListening]);

  return { isListening, isSupported, toggleListening };
}
```

---

### Файл: `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        steel: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
```

---

### Файл: `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

---

### Файл: `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
```

---

### Файл: `run.sh`

```bash
#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "=== Запуск системы «НарядAI» (АО «Костанайские Минералы») ==="

# 1. Проверяем наличие виртуального окружения
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo "Создание виртуального окружения Python..."
    python3 -m venv "$BACKEND_DIR/.venv"
    "$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

# 2. Если база данных не сгенерирована — генерируем 500+ нарядов
if [ ! -f "$BACKEND_DIR/naryad.db" ]; then
    echo "Генерация 3-месячной истории нарядов (600+ записей с заложенными закономерностями)..."
    cd "$BACKEND_DIR"
    "$BACKEND_DIR/.venv/bin/python" -m seed.generate --days 92 --seed 42
fi

# 3. Если сборка фронтенда отсутствует — собираем
if [ ! -d "$FRONTEND_DIR/dist" ]; then
    echo "Сборка PWA фронтенда..."
    cd "$FRONTEND_DIR"
    npm install
    npm run build
fi

echo ""
echo "------------------------------------------------------------------"
echo "🚀 «НарядAI» запущен и готов к работе!"
echo "👉 Веб-панель и мобильный PWA: http://localhost:8000"
echo "👉 Документация API (Swagger): http://localhost:8000/docs"
echo ""
echo "Учётные записи для демо (ПИН у всех: 1234):"
echo "  • Мастер смены: master1 (Исмаилов М.К.)"
echo "  • Слесарь: ahmetov (Ахметов Е.С. - свободен)"
echo "  • Слесарь: serikov (Сериков Д.К. - в работе)"
echo "  • Главный механик: boss (Сагинтаев Б.А.)"
echo "------------------------------------------------------------------"
echo ""

cd "$BACKEND_DIR"
exec "$BACKEND_DIR/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000
```

---

### Файл: `run_windows.bat`

```bat
@echo off
chcp 65001 > nul
title НарядAI — АО «Костанайские Минералы»
color 0B

echo ======================================================================
echo    «НарядAI» — Интеллектуальная система контроля нарядов
echo              АО «Костанайские Минералы» (Windows 11)
echo ======================================================================
echo.

:: 1. Проверка Python
python --version >nul 2>&1
if errorlevel 1 (
    py -3 --version >nul 2>&1
    if errorlevel 1 (
        color 0C
        echo [ОШИБКА] Python не обнаружен в системе!
        echo Пожалуйста, установите Python 3.11 или 3.12 с официального сайта:
        echo https://www.python.org/downloads/
        echo ВНИМАНИЕ: При установке обязательно включите галочку:
        echo    [v] Add Python to PATH (Добавить Python в переменные среды)
        echo.
        pause
        exit /b 1
    ) else (
        set PY_CMD=py -3
    )
) else (
    set PY_CMD=python
)

:: 2. Создание виртуального окружения (если ещё не создано)
if not exist "backend\.venv\Scripts\python.exe" (
    echo [1/4] Создание виртуального окружения Python...
    %PY_CMD% -m venv backend\.venv
    echo [1/4] Установка зависимостей бэкенда (FastAPI, SQLAlchemy, uvicorn)...
    call backend\.venv\Scripts\python.exe -m pip install --upgrade pip
    call backend\.venv\Scripts\pip install -r backend\requirements.txt
) else (
    echo [1/4] Виртуальное окружение Python готово.
)

:: 3. Проверка базы данных и генерация 3-месячной истории
if not exist "backend\naryad.db" (
    echo [2/4] Генерация демонстрационной БД (92 дня, 600+ нарядов, аномалии)...
    cd backend
    call .venv\Scripts\python.exe -m seed.generate --days 92 --seed 42
    cd ..
) else (
    echo [2/4] База данных нарядов обнаружена (backend\naryad.db).
)

:: 4. Проверка собранного веб-интерфейса
if not exist "frontend\dist\index.html" (
    echo [3/4] Сборка интерфейса React + Tailwind...
    where npm >nul 2>&1
    if errorlevel 1 (
        echo [ПРЕДУПРЕЖДЕНИЕ] Node.js / npm не найден.
        echo Если сборка отсутствует, установите Node.js LTS с https://nodejs.org/
    ) else (
        cd frontend
        call npm install
        call npm run build
        cd ..
    )
) else (
    echo [3/4] Веб-интерфейс (PWA) собран и готов к раздаче.
)

echo.
echo ======================================================================
echo  🚀 Сервер «НарядAI» успешно запускается!
echo.
echo  👉 Веб-панель и мобильный PWA: http://localhost:8000
echo  👉 Документация API (Swagger):  http://localhost:8000/docs
echo.
echo  Учётные записи для демо (ПИН у всех: 1234):
echo    • Мастер смены:    master1   (Исмаилов М.К.)
echo    • Слесарь:         ahmetov   (Ахметов Е.С. — свободен)
echo    • Слесарь:         serikov   (Сериков Д.К. — повторные дефекты)
echo    • Главный механик: boss      (Сагинтаев Б.А.)
echo ======================================================================
echo.

:: Автоматическое открытие браузера
start http://localhost:8000

:: Запуск веб-сервера
cd backend
call .venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000
cd ..
pause
```

---

### Файл: `run_windows.ps1`

```powershell
# PowerShell скрипт запуска «НарядAI» для Windows 11
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   «НарядAI» — Интеллектуальная система контроля нарядов" -ForegroundColor Yellow
Write-Host "             АО «Костанайские Минералы» (PowerShell Windows 11)" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Проверка Python
$pyCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pyCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pyCmd = "py -3"
} else {
    Write-Host "[ОШИБКА] Python не обнаружен в системе!" -ForegroundColor Red
    Write-Host "Установите Python 3.11 или 3.12 с официального сайта: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "Обязательно отметьте галочку: 'Add Python to PATH'." -ForegroundColor Yellow
    Exit 1
}

# 2. Создание окружения
$venvPath = Join-Path $PSScriptRoot "backend\.venv"
$venvPy = Join-Path $venvPath "Scripts\python.exe"

if (-not (Test-Path $venvPy)) {
    Write-Host "[1/4] Создание виртуального окружения Python..." -ForegroundColor Green
    & $pyCmd -m venv $venvPath
    Write-Host "[1/4] Установка зависимостей бэкенда..." -ForegroundColor Green
    & $venvPy -m pip install --upgrade pip
    & (Join-Path $venvPath "Scripts\pip.exe") install -r (Join-Path $PSScriptRoot "backend\requirements.txt")
} else {
    Write-Host "[1/4] Окружение Python готово." -ForegroundColor Gray
}

# 3. База данных
$dbPath = Join-Path $PSScriptRoot "backend\naryad.db"
if (-not (Test-Path $dbPath)) {
    Write-Host "[2/4] Генерация демонстрационной БД (92 дня, 600+ нарядов)..." -ForegroundColor Green
    Push-Location (Join-Path $PSScriptRoot "backend")
    & $venvPy -m seed.generate --days 92 --seed 42
    Pop-Location
} else {
    Write-Host "[2/4] База данных нарядов обнаружена ($dbPath)." -ForegroundColor Gray
}

# 4. Фронтенд
$distPath = Join-Path $PSScriptRoot "frontend\dist\index.html"
if (-not (Test-Path $distPath)) {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "[3/4] Сборка интерфейса React + Tailwind..." -ForegroundColor Green
        Push-Location (Join-Path $PSScriptRoot "frontend")
        & npm install
        & npm run build
        Pop-Location
    } else {
        Write-Host "[ПРЕДУПРЕЖДЕНИЕ] Node.js/npm не найден для сборки фронтенда." -ForegroundColor Yellow
    }
} else {
    Write-Host "[3/4] Веб-интерфейс готов к раздаче." -ForegroundColor Gray
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host " 🚀 Сервер «НарядAI» запущен!" -ForegroundColor Green
Write-Host " 👉 Веб-интерфейс: http://localhost:8000" -ForegroundColor White
Write-Host " 👉 Swagger API:   http://localhost:8000/docs" -ForegroundColor White
Write-Host " Демо-аккаунты (ПИН: 1234): master1, ahmetov, serikov, boss" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""

Start-Process "http://localhost:8000"

Push-Location (Join-Path $PSScriptRoot "backend")
& (Join-Path $venvPath "Scripts\uvicorn.exe") app.main:app --host 0.0.0.0 --port 8000
Pop-Location
```

---

### Файл: `scripts/export_for_ai_studio.py`

```python
#!/usr/bin/env python3
"""
Скрипт экспорта кодовой базы «НарядAI» для Google AI Studio (Gemini 1.5 Pro / 2.0 Flash).

Собирает чистый, структурированный контекст проекта без бинарников, .git, .venv и node_modules.
Размер результирующего контекста: ~35 000 - 45 000 токенов (всего ~3-4% от контекстного окна Gemini в 1M-2M токенов).
"""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "export"
OUTPUT_FILE = OUTPUT_DIR / "naryad_ai_full_context.md"

# Включаемые расширения файлов
INCLUDE_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".json", ".sql", ".md", ".txt",
    ".bat", ".sh", ".ps1", ".yml", ".yaml", ".xml", ".css", ".html"
}

# Игнорируемые каталоги и файлы
IGNORE_DIRS = {
    ".git", ".venv", "venv", "node_modules", "__pycache__", "dist",
    "build", ".gradle", "assets", "media", ".idea", ".vscode",
    ".system_generated", "coverage"
}

IGNORE_FILES = {
    "package-lock.json", "naryad.db", "naryad-ai.apk", "app-debug.apk",
    "yarn.lock", "pnpm-lock.yaml"
}

# Приоритетный порядок файлов для начала контекста
CORE_FILES = [
    "case_requirements.txt",
    "README.md",
    "backend/app/models.py",
    "backend/app/schemas.py",
    "backend/app/main.py",
    "backend/app/routers/orders.py",
    "backend/app/routers/core.py",
    "backend/app/services/orders.py",
    "backend/app/services/analytics.py",
    "backend/app/services/deadlines.py",
    "backend/app/services/ai_review.py",
    "backend/app/services/reports.py",
    "backend/app/services/nlp.py",
    "frontend/src/App.tsx",
    "frontend/src/api.ts",
    "frontend/src/pages/MasterView.tsx",
    "frontend/src/pages/WorkerView.tsx",
    "frontend/src/pages/ChiefView.tsx",
    "frontend/src/pages/LoginPage.tsx",
    "frontend/src/utils/offlineQueue.ts",
    "frontend/src/utils/i18n.ts",
]


def should_include_file(path: Path) -> bool:
    if path.name in IGNORE_FILES:
        return False
    if any(part in IGNORE_DIRS for part in path.parts):
        return False
    if path.suffix.lower() not in INCLUDE_EXTENSIONS:
        return False
    # Игнорировать слишком большие сгенерированные файлы (> 500 KB)
    if path.stat().st_size > 500_000:
        return False
    return True


def collect_project_files():
    all_files = []
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Модифицируем dirs in-place для пропуска игнорируемых папок
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            p = Path(root) / f
            if should_include_file(p):
                rel_path = p.relative_to(PROJECT_ROOT).as_posix()
                all_files.append((rel_path, p))
    return all_files


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    all_files = collect_project_files()

    # Сортировка: сначала ключевые файлы, затем остальные по алфавиту
    def sort_key(item):
        rel_path = item[0]
        if rel_path in CORE_FILES:
            return (0, CORE_FILES.index(rel_path))
        return (1, rel_path)

    all_files.sort(key=sort_key)

    total_chars = 0
    total_files = len(all_files)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write("# Полный контекст кодовой базы проекта «НарядAI»\n\n")
        out.write("> **Проект:** «НарядAI» (АО «Костанайские Минералы», Qostanai Industry Hackathon 2026)\n")
        out.write("> **Стек:** FastAPI, SQLAlchemy, SQLite/PostgreSQL, React 18, TypeScript, Tailwind CSS, Capacitor Android\n")
        out.write("> **Назначение файла:** Экспорт полного контекста кодовой базы для загрузки в **Google AI Studio** (Gemini 1.5 Pro / 2.0 Flash / Pro).\n\n")

        out.write("## 🗂 Структура включенных файлов проекта\n\n")
        for rel_path, _ in all_files:
            out.write(f"- `{rel_path}`\n")
        out.write("\n---\n\n")

        for rel_path, abs_path in all_files:
            try:
                content = abs_path.read_text(encoding="utf-8", errors="replace")
                total_chars += len(content)
                ext = abs_path.suffix.lstrip(".")
                lang_map = {
                    "py": "python",
                    "ts": "typescript",
                    "tsx": "tsx",
                    "js": "javascript",
                    "json": "json",
                    "css": "css",
                    "html": "html",
                    "sh": "bash",
                    "bat": "bat",
                    "ps1": "powershell",
                    "yml": "yaml",
                    "yaml": "yaml",
                    "xml": "xml",
                    "md": "markdown",
                    "txt": "text",
                }
                code_lang = lang_map.get(ext, "")

                out.write(f"### Файл: `{rel_path}`\n\n")
                out.write(f"```{code_lang}\n")
                out.write(content)
                if not content.endswith("\n"):
                    out.write("\n")
                out.write("```\n\n---\n\n")
            except Exception as e:
                print(f"Ошибка чтения {rel_path}: {e}", file=sys.stderr)

    approx_tokens = total_chars // 4
    print(f"✅ Экспорт успешно завершён!")
    print(f"📁 Файл: {OUTPUT_FILE}")
    print(f"📊 Статистика:")
    print(f"   • Файлов объединено: {total_files}")
    print(f"   • Общий объём текста: {total_chars:,} символов ({total_chars / 1024 / 1024:.2f} МБ)")
    print(f"   • Примерно токенов: ~{approx_tokens:,} токенов")
    print(f"   • Доля в окне Gemini 1.5 Pro / 2.0 (1M токенов): ~{(approx_tokens / 1_000_000) * 100:.1f}%")


if __name__ == "__main__":
    main()
```

---

