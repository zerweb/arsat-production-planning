# Планирование и диспетчеризация заказов

Django-приложение с PostgreSQL. Исходный интерфейс находится в `templates/production/legacy/` и `static/production/legacy/`; данные сохраняются через Django ORM. Пункты прямого обмена с 1С, NX CAM и ЧПУ скрыты до готовности интеграций.

## Установка на сервер

Поддерживается сервер Debian, Ubuntu или Astra Linux с APT и systemd. Нужны права `sudo` и доступ к репозиторию [zerweb/arsat-production-planning](https://github.com/zerweb/arsat-production-planning). Для загрузки и установки выполните на сервере одну команду:

```bash
git clone https://github.com/zerweb/arsat-production-planning.git /opt/avt && sudo bash /opt/avt/install.sh
```

Вариант с загрузчиком `bootstrap.sh`, как в [примере](https://github.com/zerweb/printer-accounting-system):

```bash
curl -fsSL https://raw.githubusercontent.com/zerweb/arsat-production-planning/main/bootstrap.sh | sudo bash
```

Обе команды используют один и тот же репозиторий. Загрузчик создаёт `/opt/avt` только если каталога ещё нет; установщик не очищает существующую базу.

Установщик спросит порт, адрес сайта и режим PostgreSQL: создать локальную базу либо подключить существующую. Затем он создаст Python-окружение, установит закреплённые зависимости, применит миграции, соберёт статику и настроит службы `avt` и Nginx. Для доступа по сети требуется готовый TLS-сертификат и ключ; без них сайт слушает только `127.0.0.1`. Путь к первому паролю администратора выводится в конце установки; пароль создаётся случайно и не хранится в репозитории.

При установке можно выбрать импорт тестовых данных из `database_import/`. Это **отдельные фикстуры**, выгруженные из текущей PostgreSQL без журнала аудита, действующих паролей и конфигурации БД. Импорт выполняется только в пустую базу и не удаляет существующие записи. После установки его можно вызвать отдельно:

```bash
cd /opt/avt && sudo -u www-data bash database_import/import.sh
```

Фикстуры содержат отключённых тестовых пользователей. Установщик активирует первого администратора с новым случайным паролем. Остальные учётные записи создаются или активируются администратором через интерфейс.

## Эксплуатация

```bash
sudo systemctl status avt
sudo journalctl -u avt -f
sudo systemctl restart avt
curl -H 'X-Forwarded-Proto: https' http://127.0.0.1:8001/health/ready/
```

Изменение параметров подключения в администрировании перезапускает веб-процесс под контролем службы. Там же доступны проверка связи с PostgreSQL, SQL-копии и восстановление из архива `.dump`. Файлы `.env`, `.runtime/`, `.backups/` и локальный каталог данных PostgreSQL не добавляются в Git.

Подробности установки и обновления — [docs/release.md](docs/release.md); структура — [docs/architecture.md](docs/architecture.md); границы соответствия техническим заданиям — [docs/requirements-audit.md](docs/requirements-audit.md).
