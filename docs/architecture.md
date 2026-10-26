# Архитектура проекта

Структура соответствует обычному Django-проекту с одним приложением. Имена `config` и `production` выполняют роли `mysite` и `main` на предоставленной схеме.

```text
avt/
├── manage.py                       # команды Django
├── config/                         # настройки проекта
│   ├── __init__.py
│   ├── settings.py                  # PostgreSQL, безопасность, шаблоны, статика
│   ├── urls.py                      # корневые маршруты
│   ├── asgi.py                      # ASGI
│   └── wsgi.py                      # Waitress / WSGI
├── production/                     # приложение производства
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                    # ORM и ограничения БД
│   ├── forms.py
│   ├── views.py                    # рабочие формы и отчеты
│   ├── legacy_ui.py                # API для сохраненного интерфейса
│   ├── legacy_tables.py            # синхронизация старых вкладок с ORM
│   ├── scheduling.py               # назначение исполнителя
│   ├── db_admin.py                 # PostgreSQL и резервные копии
│   ├── urls.py
│   ├── tests.py
│   ├── migrations/
│   └── management/commands/       # импорт фикстур и первый администратор
├── templates/
│   └── production/
│       ├── base.html и формы Django
│       └── legacy/                  # 22 HTML-страницы исходного дизайна
├── static/
│   └── production/
│       ├── legacy/                  # исходные CSS, JS и изображения
│       ├── bridge/                  # связь интерфейса с Django API
│       ├── app.css
│       └── app.js
├── database_import/                # обезличенные фикстуры и Bash-импорт
├── tools/                          # управляющий процесс и обслуживание
├── docs/                           # описание архитектуры и релиза
├── deploy/                         # пример обратного прокси
├── bootstrap.sh                     # загрузка через Git
└── install.sh                       # установка PostgreSQL и службы
```

Браузер получает HTML из `templates/production/legacy`, оформление и скрипты из `/static/production/`. `server-bridge.js` вызывает маршруты `production/urls.py`. Представления проверяют роль пользователя и записывают бизнес-объекты через Django ORM в PostgreSQL. Миграции управляют схемой базы. Исходные HTML/CSS/JS сохранены; окно списка изделий и окно резервных копий оформлены в `static/production/bridge/server-bridge.css`.

Пункты ЧПУ, прямого обмена с 1С и импорта NX CAM скрыты адаптером интерфейса. Связанные данные не удалены. Страница NX CAM по прямому адресу содержит сообщение о разработке; сохранение импорта выключено.

Вкладки `operations`, `personnel` и `timesheet` читают и изменяют нормализованные `OperationDefinition`, `Employee` и `TimesheetEntry` через `legacy_tables.py`. Снимки строк остаются в `LegacyTable` для совместимости старого формата; миграция `0008` переносит ранее сохранённые строки. Настройки `settings-*` по-прежнему хранятся в JSONField. Настройки видимости столбцов применяются к таблицам заказов и изделий. Числовые параметры плана сохраняются, но пока не меняют алгоритм планирования: формула их применения не задана в ТЗ. Результаты проверки и ограничения приведены в `docs/functional-audit.md`.
