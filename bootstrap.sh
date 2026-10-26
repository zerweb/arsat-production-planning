#!/usr/bin/env bash
set -Eeuo pipefail

# Однокомандная загрузка из своего Git-репозитория. URL передаётся явно,
# чтобы установщик никогда не скачивал чужой примерный проект.
REPOSITORY_URL="${1:-${AVT_REPOSITORY_URL:-}}"
INSTALL_DIR="${AVT_INSTALL_DIR:-/opt/avt}"

if [[ "$EUID" -ne 0 ]]; then
    echo 'Запустите установку через sudo.' >&2
    exit 1
fi
if [[ ! "$REPOSITORY_URL" =~ ^https://[^[:space:]]+\.git$ ]]; then
    echo 'Укажите HTTPS URL своего Git-репозитория: sudo bash bootstrap.sh https://host/group/avt.git' >&2
    exit 1
fi
if [[ -e "$INSTALL_DIR" ]]; then
    echo "Каталог $INSTALL_DIR уже существует. Установка не перезаписывает данные." >&2
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
