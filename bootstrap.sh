#!/usr/bin/env bash
set -Eeuo pipefail

# Однокомандная загрузка из репозитория проекта. URL можно переопределить
# аргументом или переменной окружения при развёртывании зеркала.
REPOSITORY_URL="${1:-${AVT_REPOSITORY_URL:-https://github.com/zerweb/arsat-production-planning.git}}"
INSTALL_DIR="${AVT_INSTALL_DIR:-/opt/avt}"

if [[ "$EUID" -ne 0 ]]; then
    echo 'Запустите установку через sudo.' >&2
    exit 1
fi
if [[ ! "$REPOSITORY_URL" =~ ^https://[^[:space:]]+\.git$ ]]; then
    echo 'Нужен HTTPS URL Git-репозитория с суффиксом .git.' >&2
    exit 1
fi
if [[ -e "$INSTALL_DIR" ]]; then
    if [[ -f "$INSTALL_DIR/manage.py" && -f "$INSTALL_DIR/install.sh" ]]; then
        if ! command -v git >/dev/null || [[ "$(git -C "$INSTALL_DIR" remote get-url origin 2>/dev/null)" != "$REPOSITORY_URL" ]]; then
            echo 'Не удалось проверить Git-репозиторий установленного проекта.' >&2
            exit 1
        fi
        echo "Обновляю проект в $INSTALL_DIR и открываю меню обслуживания."
        git -C "$INSTALL_DIR" pull --ff-only
        exec bash "$INSTALL_DIR/install.sh"
    fi
    echo "Каталог $INSTALL_DIR уже существует и не является проектом АРСАТ." >&2
    exit 1
fi
if ! command -v apt-get >/dev/null || ! command -v systemctl >/dev/null; then
    echo 'Требуется Debian, Ubuntu или Astra Linux с APT и systemd.' >&2
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y git ca-certificates
git clone --depth 1 "$REPOSITORY_URL" "$INSTALL_DIR"
if [[ ! -f "$INSTALL_DIR/manage.py" || ! -f "$INSTALL_DIR/install.sh" ]]; then
    echo 'В репозитории нет Django-проекта или install.sh.' >&2
    exit 1
fi
exec bash "$INSTALL_DIR/install.sh"
