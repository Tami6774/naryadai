# Промпт: Создание нативного Android-приложения на Kotlin + Jetpack Compose

На основе предоставленной кодовой базы «НарядAI» напиши нативное Android-приложение на **Kotlin** с использованием **Jetpack Compose** и **Clean Architecture**.

## Стек и архитектура:
1. **UI:** Jetpack Compose + Material 3 (Dark Industrial Theme).
2. **База данных:** Room Database (локальный кэш нарядов, оборудования, ТМЦ и таблица `pending_actions` для оффлайн-работы).
3. **Фоновая работа:** `WorkManager` (периодическая и сетевая синхронизация мутаций при восстановлении подключения).
4. **Сеть:** Retrofit 2 + OkHttp + Kotlinx Serialization.
5. **Камера:** CameraX с предварительным сжатием фото и проверкой качества.
6. **Аудио и вибро:** `Vibrator` и `SoundPool` при срыве дедлайна или получении критического наряда.

## Экраны и компоненты:
1. `LoginRoute`: экран входа по ПИН-коду.
2. `WorkerRoute`: крупный интерфейс слесаря (адаптирован под перчатки).
3. `PhotoCaptureRoute`: съемка узла оборудования с подсказками (сетка, уровень).
4. `MasterKanbanRoute`: мобильный Канбан с перетаскиванием карточек и быстрым переназначением отклонённых нарядов.

Перед каждым файлом укажи маркер вида:
// FILE: app/build.gradle.kts
// FILE: app/src/main/java/kz/kostanai/naryad/data/local/AppDatabase.kt
// FILE: app/src/main/java/kz/kostanai/naryad/data/remote/NaryadApi.kt
// FILE: app/src/main/java/kz/kostanai/naryad/data/sync/SyncWorker.kt
// FILE: app/src/main/java/kz/kostanai/naryad/ui/worker/WorkerScreen.kt
// FILE: app/src/main/java/kz/kostanai/naryad/ui/master/MasterScreen.kt
