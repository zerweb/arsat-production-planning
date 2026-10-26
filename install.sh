#!/usr/bin/env bash
set -Eeuo pipefail

# Установка для Debian/Ubuntu/Astra Linux. Проект остаётся в Git-каталоге;
# повторная установка не изменяет уже работающую базу и её реквизиты.
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="avt"
APP_PORT=8001
DEFAULT_SITE_PORT=8080
ENV_FILE="$PROJECT_ROOT/.env"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
NGINX_FILE="/etc/nginx/sites-available/$SERVICE_NAME.conf"

fail() { echo "Ошибка: $*" >&2; exit 1; }
ask() {
    local prompt="$1" default="$2" answer
    read -r -p "$prompt [$default]: " answer </dev/tty
    printf '%s' "${answer:-$default}"
}
valid_port() { [[ "$1" =~ ^[0-9]+$ ]] && (( "$1" >= 1 && "$1" <= 65535 )); }
valid_name() { [[ "$1" =~ ^[a-z_][a-z0-9_]{0,62}$ ]]; }

[[ "$EUID" -eq 0 ]] || fail 'Запустите sudo bash install.sh'
[[ -f "$PROJECT_ROOT/manage.py" ]] || fail 'Рядом с install.sh нет manage.py'
[[ ! -e "$ENV_FILE" ]] || fail '.env уже существует: повторная установка не перезаписывает конфигурацию'
command -v apt-get >/dev/null && command -v systemctl >/dev/null || fail 'Требуются APT и systemd'
command -v python3 >/dev/null || fail 'Для подготовки секретов нужен Python 3'
[[ -r /dev/tty ]] || fail 'Нужен интерактивный терминал для настройки PostgreSQL'

umask 077
SITE_PORT="$(ask 'Порт сайта' "$DEFAULT_SITE_PORT")"
valid_port "$SITE_PORT" || fail 'Некорректный порт сайта'
[[ "$SITE_PORT" != "$APP_PORT" ]] || fail 'Порт сайта занят внутренним приложением'
echo 'Доступ: 1 — только на этом сервере; 2 — по сети с готовым TLS-сертификатом'
ACCESS_MODE="$(ask 'Режим доступа' 1)"
SITE_HOST="$(ask 'Имя/IP сайта для Django' 127.0.0.1)"
[[ "$SITE_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || fail 'Некорректное имя сайта'
LISTEN_ADDRESS=127.0.0.1
USE_HTTPS=0
CSRF_ORIGIN=''
TLS_LINES=''
if [[ "$ACCESS_MODE" == 2 ]]; then
    [[ "$SITE_HOST" != 127.0.0.1 && "$SITE_HOST" != localhost ]] || fail 'Для сетевого доступа укажите домен или IP сервера'
    LISTEN_ADDRESS=0.0.0.0
    USE_HTTPS=1
    CSRF_ORIGIN="https://$SITE_HOST:$SITE_PORT"
    read -r -p 'Абсолютный путь к TLS-сертификату: ' TLS_CERT </dev/tty
    read -r -p 'Абсолютный путь к закрытому TLS-ключу: ' TLS_KEY </dev/tty
    [[ "$TLS_CERT" == /* && -r "$TLS_CERT" && "$TLS_KEY" == /* && -r "$TLS_KEY" ]] || fail 'TLS-файлы недоступны'
    [[ "$TLS_CERT" =~ ^/[A-Za-z0-9/_+.,-]+$ && "$TLS_KEY" =~ ^/[A-Za-z0-9/_+.,-]+$ ]] || fail 'Некорректный путь TLS'
    TLS_LINES="    ssl_certificate $TLS_CERT;
    ssl_certificate_key $TLS_KEY;"
elif [[ "$ACCESS_MODE" != 1 ]]; then
    fail 'Выберите 1 или 2'
fi

echo 'PostgreSQL: 1 — создать локальную базу; 2 — подключить существующую'
DB_MODE="$(ask 'Режим PostgreSQL' 1)"
if [[ "$DB_MODE" == 1 ]]; then
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_NAME="$(ask 'Название новой базы' avt_production)"
    DB_USER="$(ask 'Новый пользователь базы' avt_app)"
    DB_PASSWORD="$(python3 -c 'import secrets; print(secrets.token_urlsafe(36))')"
elif [[ "$DB_MODE" == 2 ]]; then
    DB_HOST="$(ask 'Адрес PostgreSQL' 127.0.0.1)"
    DB_PORT="$(ask 'Порт PostgreSQL' 5432)"
    DB_NAME="$(ask 'Название существующей базы' avt_production)"
    DB_USER="$(ask 'Пользователь базы' avt_app)"
    read -r -s -p 'Пароль пользователя базы: ' DB_PASSWORD </dev/tty
    echo
else
    fail 'Выберите режим PostgreSQL 1 или 2'
fi
valid_name "$DB_NAME" && valid_name "$DB_USER" && valid_port "$DB_PORT" || fail 'Некорректные реквизиты базы'
[[ "$DB_HOST" =~ ^[A-Za-z0-9.:-]+$ && -n "$DB_PASSWORD" && "$DB_PASSWORD" != *$'\n'* ]] || fail 'Некорректный адрес или пароль PostgreSQL'

IMPORT_SAMPLE="$(ask 'Импортировать тестовые данные из текущей PostgreSQL? (y/n)' n)"
[[ "$IMPORT_SAMPLE" =~ ^[yYnN]$ ]] || fail 'Ответьте y или n'

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y python3 python3-venv python3-dev libpq-dev postgresql-client nginx curl
if [[ "$DB_MODE" == 1 ]]; then
    apt-get install -y postgresql
    systemctl enable --now postgresql
    # Имена базы и роли проверены регулярным выражением; пароль создан генератором.
    if runuser -u postgres -- psql -d postgres -Atqc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -qx 1; then
        fail "Роль PostgreSQL $DB_USER уже существует; выберите подключение к существующей базе"
    fi
    if runuser -u postgres -- psql -d postgres -Atqc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -qx 1; then
        fail "База $DB_NAME уже существует; выберите подключение к существующей базе"
    fi
    # Пароль идёт через stdin psql и не появляется в аргументах процесса.
    printf 'CREATE ROLE "%s" LOGIN PASSWORD '\''%s'\'';\n' "$DB_USER" "$DB_PASSWORD" |
        runuser -u postgres -- psql -d postgres -v ON_ERROR_STOP=1
    runuser -u postgres -- createdb --owner="$DB_USER" "$DB_NAME"
fi
PGPASSWORD="$DB_PASSWORD" psql -w --host "$DB_HOST" --port "$DB_PORT" --username "$DB_USER" --dbname "$DB_NAME" -Atqc 'SELECT 1' | grep -qx 1 || fail 'Не удалось подключиться к PostgreSQL'

python3 -m venv "$PROJECT_ROOT/.venv"
"$PROJECT_ROOT/.venv/bin/python" -m pip install --disable-pip-version-check -r "$PROJECT_ROOT/requirements.lock.txt"
chmod -R a+rX "$PROJECT_ROOT/.venv"
SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')"
cat > "$ENV_FILE" <<ENV
PGHOST=$DB_HOST
PGPORT=$DB_PORT
PGDATABASE=$DB_NAME
PGUSER=$DB_USER
PGPASSWORD=$DB_PASSWORD
DJANGO_SECRET_KEY=$SECRET_KEY
DJANGO_ALLOWED_HOSTS=$SITE_HOST,127.0.0.1,localhost
DJANGO_CSRF_TRUSTED_ORIGINS=$CSRF_ORIGIN
DJANGO_USE_HTTPS=$USE_HTTPS
DJANGO_DEBUG=0
ENV
chown www-data:www-data "$ENV_FILE"
chmod 600 "$ENV_FILE"
mkdir -p "$PROJECT_ROOT/.runtime" "$PROJECT_ROOT/.backups" "$PROJECT_ROOT/staticfiles"
chown www-data:www-data "$PROJECT_ROOT/.runtime" "$PROJECT_ROOT/.backups"
chmod 700 "$PROJECT_ROOT/.runtime" "$PROJECT_ROOT/.backups"
cd "$PROJECT_ROOT"
"$PROJECT_ROOT/.venv/bin/python" manage.py migrate --noinput
if [[ "$IMPORT_SAMPLE" =~ ^[yY]$ ]]; then
    bash "$PROJECT_ROOT/database_import/import.sh"
fi
ADMIN_CREATED=0
if ! "$PROJECT_ROOT/.venv/bin/python" manage.py shell -c 'from django.contrib.auth.models import User; import sys; sys.exit(0 if User.objects.filter(is_active=True,is_superuser=True).exists() else 1)' >/dev/null; then
    ADMIN_PASSWORD="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
    AVT_ADMIN_PASSWORD="$ADMIN_PASSWORD" "$PROJECT_ROOT/.venv/bin/python" manage.py provision_admin
    ADMIN_CREATED=1
fi
"$PROJECT_ROOT/.venv/bin/python" manage.py check --deploy
"$PROJECT_ROOT/.venv/bin/python" manage.py collectstatic --noinput --verbosity 0
# Команды миграции выполнялись от root и могли создать app.log с правами 600.
# Перед запуском службы передаём служебные файлы её отдельному пользователю.
chown -R www-data:www-data "$PROJECT_ROOT/.runtime" "$PROJECT_ROOT/.backups"
find "$PROJECT_ROOT/staticfiles" -type d -exec chmod 755 {} +
find "$PROJECT_ROOT/staticfiles" -type f -exec chmod 644 {} +

cat > "$SERVICE_FILE" <<SERVICE
[Unit]
Description=AVT Django production service
After=network-online.target postgresql.service
Wants=network-online.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$PROJECT_ROOT
ExecStart=$PROJECT_ROOT/.venv/bin/python $PROJECT_ROOT/tools/serve.py --port $APP_PORT
Restart=always
RestartSec=3
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true

[Install]
WantedBy=multi-user.target
SERVICE

if [[ "$USE_HTTPS" == 1 ]]; then
    NGINX_LISTEN="listen $LISTEN_ADDRESS:$SITE_PORT ssl;"
else
    NGINX_LISTEN="listen $LISTEN_ADDRESS:$SITE_PORT;"
fi
cat > "$NGINX_FILE" <<NGINX
server {
    $NGINX_LISTEN
$TLS_LINES
    server_name $SITE_HOST;
    client_max_body_size 50m;
    add_header X-Content-Type-Options nosniff always;

    location /static/ {
        alias $PROJECT_ROOT/staticfiles/;
        access_log off;
        expires 7d;
    }
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 120s;
    }
}
NGINX
ln -sfn "$NGINX_FILE" "/etc/nginx/sites-enabled/$SERVICE_NAME.conf"
nginx -t
systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"
systemctl enable --now nginx
systemctl reload nginx
systemctl is-active --quiet "$SERVICE_NAME" || fail 'Служба Django не запустилась'

if [[ "$ADMIN_CREATED" == 1 ]]; then
    CREDENTIALS_FILE='/root/avt-initial-admin.txt'
    printf 'Логин: admin\nПервый пароль: %s\nСмените пароль после входа.\n' "$ADMIN_PASSWORD" > "$CREDENTIALS_FILE"
    chmod 600 "$CREDENTIALS_FILE"
    echo "Первый пароль администратора сохранён только для root: $CREDENTIALS_FILE"
else
    echo 'Существующий пароль администратора не изменён.'
fi
if [[ "$USE_HTTPS" == 1 ]]; then
    echo "Сайт установлен: https://$SITE_HOST:$SITE_PORT/"
else
    echo "Сайт установлен локально: http://$SITE_HOST:$SITE_PORT/"
fi
echo "Служба: systemctl status $SERVICE_NAME; журнал: journalctl -u $SERVICE_NAME -f"
