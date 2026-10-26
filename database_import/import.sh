#!/usr/bin/env bash
set -Eeuo pipefail

# Скрипт загрузки фикстур. Команда Django проверяет пустоту базы и
# выполняет оба файла одной транзакцией.
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON="$PROJECT_ROOT/.venv/bin/python"
if [[ ! -x "$PYTHON" ]]; then
    echo 'Сначала выполните install.sh: виртуальное окружение не найдено.' >&2
    exit 1
fi
cd "$PROJECT_ROOT"
"$PYTHON" manage.py import_sample_data
