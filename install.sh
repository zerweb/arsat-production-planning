#!/usr/bin/env bash
set -Eeuo pipefail

# Установка и обслуживание АРСАТ на Debian/Ubuntu/Astra Linux с systemd.
# Пароли выводятся только в терминал и не записываются в отдельный файл.
PROJECT_ROOT="$(cd "${AVT_PROJECT_ROOT:-$(dirname "${BASH_SOURCE[0]}")}" && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
SERVICE_NAME=avt
APP_PORT=8001
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
NGINX_FILE="/etc/nginx/sites-available/$SERVICE_NAME.conf"
ACME_WEBROOT=/var/lib/letsencrypt/avt
PYTHON="$PROJECT_ROOT/.venv/bin/python"
CREDENTIAL_LINES=''
DB_PASSWORD_CREATED=0
RESUME_INCOMPLETE=0

fail() { printf 'Ошибка: %s\n' "$*" >&2; exit 1; }
ask() {
    local prompt="$1" default="$2" answer
    read -r -p "$prompt [$default]: " answer </dev/tty
    printf '%s' "${answer:-$default}"
}
secret() {
    local prompt="$1" answer
    read -r -s -p "$prompt: " answer </dev/tty
    printf '\n' >/dev/tty
    printf '%s' "$answer"
}
random_password() { python3 -c 'import secrets; print(secrets.token_urlsafe(32))'; }
valid_port() { [[ "$1" =~ ^[0-9]+$ ]] && (( 10#$1 >= 1 && 10#$1 <= 65535 )); }
valid_name() { [[ "$1" =~ ^[a-z_][a-z0-9_]{0,62}$ ]]; }
valid_host() { [[ "$1" =~ ^[A-Za-z0-9.:-]+$ ]]; }
valid_domain() {
    python3 - "$1" <<'PY'
import ipaddress
import re
import sys

value = sys.argv[1]
try:
    ipaddress.ip_address(value)
except ValueError:
    pass
else:
    sys.exit(1)
labels = value.split('.')
sys.exit(0 if len(value) <= 253 and len(labels) >= 2 and all(
    re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?', label)
    for label in labels
) and re.fullmatch(r'(?:[A-Za-z]{2,}|xn--[A-Za-z0-9-]{2,59})', labels[-1], re.IGNORECASE) else 1)
PY
}
env_value() {
    local wanted="$1" key value
    [[ -f "$ENV_FILE" ]] || return 0
    while IFS='=' read -r key value; do
        if [[ "$key" == "$wanted" ]]; then printf '%s' "$value"; return 0; fi
    done < "$ENV_FILE"
}
server_ip() {
    local found
    found="$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -n 1 || true)"
    printf '%s' "${found:-127.0.0.1}"
}

[[ "$EUID" -eq 0 ]] || fail 'Запустите sudo bash install.sh'
[[ -f "$PROJECT_ROOT/manage.py" ]] || fail 'Рядом с install.sh нет manage.py'
[[ "$PROJECT_ROOT" != *[[:space:]]* ]] || fail 'Путь проекта не должен содержать пробелы'
command -v apt-get >/dev/null && command -v systemctl >/dev/null || fail 'Нужны APT и systemd'
if ! command -v python3 >/dev/null; then
    echo 'Устанавливаю Python 3.'
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y python3
fi
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' ||
    fail 'Для Django 5.2 нужен Python 3.10 или новее. Обновите Python через совместимые репозитории системы.'
[[ -r /dev/tty ]] || fail 'Нужен интерактивный терминал'
umask 077
cd "$PROJECT_ROOT"

choose_site() {
    local default_ip current_host current_port current_mode current_email
    default_ip="$(server_ip)"
    current_host="$(env_value AVT_SITE_HOST)"
    current_port="$(env_value AVT_SITE_PORT)"
    current_mode="$(env_value AVT_ACCESS_MODE)"
    current_email="$(env_value AVT_ACME_EMAIL)"
    echo 'Доступ: 1 — HTTP в сети; 2 — HTTPS с готовым сертификатом; 3 — HTTP только на сервере; 4 — домен и автоматический сертификат Let’s Encrypt'
    ACCESS_MODE="$(ask 'Выберите режим' "${current_mode:-1}")"
    case "$ACCESS_MODE" in
        1) LISTEN_ADDRESS=0.0.0.0; USE_HTTPS=0; echo 'HTTP передаёт пароли без шифрования. Используйте только доверенную сеть.' ;;
        2) LISTEN_ADDRESS=0.0.0.0; USE_HTTPS=1 ;;
        3) LISTEN_ADDRESS=127.0.0.1; USE_HTTPS=0 ;;
        4) LISTEN_ADDRESS=0.0.0.0; USE_HTTPS=1 ;;
        *) fail 'Выберите 1, 2, 3 или 4' ;;
    esac
    if [[ "$ACCESS_MODE" == 4 ]]; then
        SITE_PORT="$(ask 'Порт HTTPS-сайта (например, 443 или 8880)' "${current_port:-443}")"
    else
        SITE_PORT="$(ask 'Порт веб-сайта' "${current_port:-8080}")"
    fi
    valid_port "$SITE_PORT" && [[ "$SITE_PORT" != "$APP_PORT" ]] || fail 'Недопустимый порт сайта'
    [[ "$ACCESS_MODE" != 4 || "$SITE_PORT" != 80 ]] || fail 'Порт 80 необходим для проверки сертификата; выберите другой порт HTTPS'
    if [[ "$ACCESS_MODE" == 3 ]]; then
        SITE_HOST=127.0.0.1
    else
        SITE_HOST="$(ask 'IP или домен, по которому откроют сайт' "${current_host:-$default_ip}")"
        valid_host "$SITE_HOST" && [[ "$SITE_HOST" != 127.0.0.1 && "$SITE_HOST" != localhost ]] ||
            fail 'Для сетевого доступа укажите IP сервера или домен'
    fi
    TLS_CERT=''; TLS_KEY=''; ACME_EMAIL=''
    if [[ "$ACCESS_MODE" == 2 ]]; then
        TLS_CERT="$(ask 'Абсолютный путь к TLS-сертификату' "$(env_value AVT_TLS_CERT)")"
        TLS_KEY="$(ask 'Абсолютный путь к TLS-ключу' "$(env_value AVT_TLS_KEY)")"
        [[ "$TLS_CERT" =~ ^/[A-Za-z0-9/_+.,-]+$ && -r "$TLS_CERT" ]] || fail 'TLS-сертификат недоступен'
        [[ "$TLS_KEY" =~ ^/[A-Za-z0-9/_+.,-]+$ && -r "$TLS_KEY" ]] || fail 'TLS-ключ недоступен'
    fi
    if [[ "$ACCESS_MODE" == 4 ]]; then
        valid_domain "$SITE_HOST" || fail 'Для Let’s Encrypt нужен обычный DNS-домен или поддомен, а не IP-адрес'
        ACME_EMAIL="$(ask 'Email для уведомлений Let’s Encrypt' "$current_email")"
        [[ "$ACME_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]] || fail 'Неверный email для Let’s Encrypt'
        TLS_CERT="/etc/letsencrypt/live/$SITE_HOST/fullchain.pem"
        TLS_KEY="/etc/letsencrypt/live/$SITE_HOST/privkey.pem"
        echo 'Для выпуска сертификата домен должен указывать на этот сервер, а входящий TCP/80 — быть доступен из интернета.'
    fi
    if [[ "$USE_HTTPS" == 1 && "$SITE_PORT" == 443 ]]; then CSRF_ORIGIN="https://$SITE_HOST"
    elif [[ "$USE_HTTPS" == 1 ]]; then CSRF_ORIGIN="https://$SITE_HOST:$SITE_PORT"
    elif [[ "$SITE_PORT" == 80 ]]; then CSRF_ORIGIN="http://$SITE_HOST"
    else CSRF_ORIGIN="http://$SITE_HOST:$SITE_PORT"; fi
}

load_current_site() {
    SITE_HOST="$(env_value AVT_SITE_HOST)"; SITE_HOST="${SITE_HOST:-127.0.0.1}"
    SITE_PORT="$(env_value AVT_SITE_PORT)"; SITE_PORT="${SITE_PORT:-8080}"
    ACCESS_MODE="$(env_value AVT_ACCESS_MODE)"; ACCESS_MODE="${ACCESS_MODE:-3}"
    TLS_CERT="$(env_value AVT_TLS_CERT)"; TLS_KEY="$(env_value AVT_TLS_KEY)"
    ACME_EMAIL="$(env_value AVT_ACME_EMAIL)"
    if [[ "$ACCESS_MODE" == 2 || "$ACCESS_MODE" == 4 ]]; then
        USE_HTTPS=1
        if [[ "$SITE_PORT" == 443 ]]; then CSRF_ORIGIN="https://$SITE_HOST"
        else CSRF_ORIGIN="https://$SITE_HOST:$SITE_PORT"; fi
    else
        USE_HTTPS=0
        if [[ "$SITE_PORT" == 80 ]]; then CSRF_ORIGIN="http://$SITE_HOST"
        else CSRF_ORIGIN="http://$SITE_HOST:$SITE_PORT"; fi
    fi
    if [[ "$ACCESS_MODE" == 3 ]]; then LISTEN_ADDRESS=127.0.0.1
    else LISTEN_ADDRESS=0.0.0.0; fi
}

load_current_database() {
    DB_HOST="$(env_value PGHOST)"
    DB_PORT="$(env_value PGPORT)"
    DB_NAME="$(env_value PGDATABASE)"
    DB_USER="$(env_value PGUSER)"
    DB_PASSWORD="$(env_value PGPASSWORD)"
    [[ -n "$DB_HOST" && -n "$DB_NAME" && -n "$DB_USER" && -n "$DB_PASSWORD" ]] ||
        fail 'В .env отсутствуют реквизиты PostgreSQL'
}

app_psql() {
    PGPASSWORD="$DB_PASSWORD" PGCONNECT_TIMEOUT=5 psql -X -w --host "$DB_HOST" --port "$DB_PORT" \
        --username "$DB_USER" --dbname "$DB_NAME" -v ON_ERROR_STOP=1 "$@"
}

ensure_postgres_client() {
    local server_version major selected client_version
    server_version="$(app_psql -Atqc 'SHOW server_version_num')"
    [[ "$server_version" =~ ^[0-9]+$ ]] || fail 'Не удалось определить версию сервера PostgreSQL'
    major=$((10#$server_version / 10000))
    selected="$(PG_BIN_DIR="$(env_value PG_BIN_DIR)" python3 -c 'from tools.pg_tools import postgres_bin; print(postgres_bin("pg_dump"))')"
    client_version="$("$selected" --version 2>/dev/null | sed -nE 's/.* ([0-9]+)(\.[0-9]+)?.*/\1/p' || true)"
    if [[ "$client_version" =~ ^[0-9]+$ ]] && (( 10#$client_version >= major )); then return 0; fi
    echo "Для резервных копий PostgreSQL $major требуется совместимый pg_dump. Ищу postgresql-client-$major в настроенных репозиториях."
    if apt-cache show "postgresql-client-$major" >/dev/null 2>&1 && apt-get install -y "postgresql-client-$major"; then
        if [[ -n "$(env_value PG_BIN_DIR)" ]]; then
            echo 'Проверьте PG_BIN_DIR в .env: заданный каталог имеет приоритет при выборе клиента.' >&2
        fi
    else
        echo "Внимание: установите postgresql-client-$major из совместимого репозитория; резервное копирование до этого недоступно." >&2
    fi
}
check_database_schema() {
    local status table_count django_migrations production_order
    status="$(app_psql -Atqc "SELECT (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'), to_regclass('public.django_migrations') IS NOT NULL, to_regclass('public.production_order') IS NOT NULL")"
    IFS='|' read -r table_count django_migrations production_order <<< "$status"
    if (( table_count > 0 )) && [[ "$django_migrations" != t || "$production_order" != t ]]; then
        fail 'В БД уже есть таблицы другого приложения без схемы АРСАТ. Укажите пустую или подготовленную базу АРСАТ.'
    fi
}
admin_psql() {
    PGPASSWORD="$DB_ADMIN_PASSWORD" PGCONNECT_TIMEOUT=5 psql -X -w --host "$DB_HOST" --port "$DB_PORT" \
        --username "$DB_ADMIN_USER" --dbname postgres -v ON_ERROR_STOP=1 "$@"
}
setup_local_postgres() {
    echo 'Устанавливаю PostgreSQL на этом сервере.'
    apt-get update
    apt-get install -y postgresql
    systemctl enable --now postgresql
    pg_isready -h 127.0.0.1 -p 5432 >/dev/null || fail 'Локальный PostgreSQL не слушает 127.0.0.1:5432'
    local role_exists database_exists
    role_exists="$(runuser -u postgres -- psql -X -Atqc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")"
    database_exists="$(runuser -u postgres -- psql -X -Atqc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")"
    [[ -z "$role_exists" && -z "$database_exists" ]] || fail 'Локальная роль или база уже существует; выберите подключение к готовой БД'
    DB_PASSWORD="$(random_password)"
    # Роль и база создаются через локальное системное подключение postgres.
    printf 'CREATE ROLE "%s" LOGIN PASSWORD '\''%s'\'';\n' "$DB_USER" "$DB_PASSWORD" |
        runuser -u postgres -- psql -X -v ON_ERROR_STOP=1 -q -f -
    if ! runuser -u postgres -- createdb --owner="$DB_USER" "$DB_NAME"; then
        printf 'DROP ROLE "%s";\n' "$DB_USER" | runuser -u postgres -- psql -X -v ON_ERROR_STOP=1 -q -f - || true
        fail 'Не удалось создать локальную базу PostgreSQL'
    fi
    DB_PASSWORD_CREATED=1
}
choose_database() {
    local default_host default_port default_name default_user default_mode role_exists database_exists
    default_host="$(env_value PGHOST)"; default_port="$(env_value PGPORT)"
    echo 'PostgreSQL: 1 — создать БД на готовом сервере; 2 — подключить готовую БД; 3 — установить PostgreSQL и создать БД на этом сервере'
    if [[ -f "$ENV_FILE" ]]; then default_mode=2; else default_mode=1; fi
    DB_MODE="$(ask 'Выберите режим' "$default_mode")"
    [[ "$DB_MODE" =~ ^[123]$ ]] || fail 'Выберите 1, 2 или 3'
    if [[ "$DB_MODE" == 1 || "$DB_MODE" == 3 ]]; then
        default_name=avt_production; default_user=avt_app
    else
        default_name="$(env_value PGDATABASE)"; default_name="${default_name:-avt_production}"
        default_user="$(env_value PGUSER)"; default_user="${default_user:-avt_app}"
        echo 'В квадратных скобках показаны текущие значения. Enter оставляет их без изменений.'
    fi
    if [[ "$DB_MODE" == 3 ]]; then
        DB_HOST=127.0.0.1; DB_PORT=5432
    else
        DB_HOST="$(ask 'Адрес работающего сервера PostgreSQL' "${default_host:-127.0.0.1}")"
        DB_PORT="$(ask 'Порт PostgreSQL' "${default_port:-5432}")"
    fi
    valid_host "$DB_HOST" && valid_port "$DB_PORT" || fail 'Неверный адрес или порт PostgreSQL'
    DB_NAME="$(ask 'Название базы' "$default_name")"
    DB_USER="$(ask 'Пользователь приложения в PostgreSQL' "$default_user")"
    valid_name "$DB_NAME" && valid_name "$DB_USER" || fail 'Имя БД и пользователя: строчные латинские буквы, цифры, _'
    if [[ "$DB_MODE" == 3 ]]; then
        setup_local_postgres
    elif [[ "$DB_MODE" == 1 ]]; then
        DB_ADMIN_USER="$(ask 'Администратор готового PostgreSQL-сервера' postgres)"
        valid_name "$DB_ADMIN_USER" || fail 'Неверное имя администратора PostgreSQL'
        DB_ADMIN_PASSWORD="$(secret 'Пароль администратора PostgreSQL')"
        [[ -n "$DB_ADMIN_PASSWORD" ]] || fail 'Нужен пароль администратора PostgreSQL'
        admin_psql -Atqc 'SELECT 1' | grep -qx 1 || fail 'Нет подключения с правами администратора PostgreSQL'
        role_exists="$(admin_psql -Atqc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")"
        database_exists="$(admin_psql -Atqc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")"
        [[ -z "$role_exists" && -z "$database_exists" ]] || fail 'Роль или база уже существуют; выберите подключение к готовой БД'
        DB_PASSWORD="$(random_password)"
        # Новый пароль передаётся PostgreSQL через stdin, а не через аргументы процесса.
        printf 'CREATE ROLE "%s" LOGIN PASSWORD '\''%s'\'';\n' "$DB_USER" "$DB_PASSWORD" | admin_psql -q -f -
        if ! PGPASSWORD="$DB_ADMIN_PASSWORD" PGCONNECT_TIMEOUT=5 createdb --host "$DB_HOST" --port "$DB_PORT" \
            --username "$DB_ADMIN_USER" --owner="$DB_USER" "$DB_NAME"; then
            printf 'DROP ROLE "%s";\n' "$DB_USER" | admin_psql -q -f - || true
            fail 'Не удалось создать базу данных на сервере PostgreSQL'
        fi
        DB_ADMIN_PASSWORD=''
        DB_PASSWORD_CREATED=1
    else
        DB_PASSWORD="$(secret 'Пароль пользователя приложения PostgreSQL (Enter — прежний)')"
        if [[ -z "$DB_PASSWORD" ]]; then DB_PASSWORD="$(env_value PGPASSWORD)"; fi
        [[ -n "$DB_PASSWORD" ]] || fail 'Нужен пароль пользователя PostgreSQL'
    fi
    [[ "$DB_PASSWORD" != *$'\n'* && "$DB_PASSWORD" != *$'\r'* ]] || fail 'Пароль БД содержит недопустимые символы'
    app_psql -Atqc 'SELECT 1' | grep -qx 1 || fail 'Приложение не может подключиться к выбранной БД'
    check_database_schema
}

write_env() {
    local temp key value
    temp="$(mktemp "$PROJECT_ROOT/.env-tmp.XXXXXX")"
    if [[ -f "$ENV_FILE" ]]; then
        while IFS='=' read -r key value; do
            case "$key" in
                PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD|DJANGO_SECRET_KEY|DJANGO_ALLOWED_HOSTS|DJANGO_CSRF_TRUSTED_ORIGINS|DJANGO_USE_HTTPS|DJANGO_DEBUG|AVT_SITE_HOST|AVT_SITE_PORT|AVT_ACCESS_MODE|AVT_TLS_CERT|AVT_TLS_KEY|AVT_ACME_EMAIL) ;;
                *) printf '%s=%s\n' "$key" "$value" >> "$temp" ;;
            esac
        done < "$ENV_FILE"
    fi
    SECRET_KEY="$(env_value DJANGO_SECRET_KEY)"
    SECRET_KEY="${SECRET_KEY:-$(python3 -c 'import secrets; print(secrets.token_urlsafe(64))')}"
    cat >> "$temp" <<ENV
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
AVT_SITE_HOST=$SITE_HOST
AVT_SITE_PORT=$SITE_PORT
AVT_ACCESS_MODE=$ACCESS_MODE
AVT_TLS_CERT=$TLS_CERT
AVT_TLS_KEY=$TLS_KEY
AVT_ACME_EMAIL=$ACME_EMAIL
ENV
    chown www-data:www-data "$temp"
    chmod 600 "$temp"
    mv -f "$temp" "$ENV_FILE"
}

write_service() {
    cat > "$SERVICE_FILE" <<SERVICE
[Unit]
Description=AVT Django production service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$PROJECT_ROOT
ExecStart=$PYTHON $PROJECT_ROOT/tools/serve.py --port $APP_PORT
Restart=always
RestartSec=3
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true

[Install]
WantedBy=multi-user.target
SERVICE
}

write_nginx() {
    local listen tls_lines temp https_authority
    temp="$(mktemp "/etc/nginx/sites-available/.avt-tmp.XXXXXX")"
    : > "$temp"
    if [[ "$ACCESS_MODE" == 4 ]]; then
        https_authority="$SITE_HOST"
        if [[ "$SITE_PORT" != 443 ]]; then https_authority="$SITE_HOST:$SITE_PORT"; fi
        # Порт 80 оставляем для проверки домена и перенаправления на HTTPS.
        cat >> "$temp" <<NGINX
server {
    listen 0.0.0.0:80;
    server_name $SITE_HOST;
    location ^~ /.well-known/acme-challenge/ {
        root $ACME_WEBROOT;
        try_files \$uri =404;
    }
    location / { return 308 https://$https_authority\$request_uri; }
}
NGINX
    fi
    if [[ "$USE_HTTPS" == 1 ]]; then
        listen="listen $LISTEN_ADDRESS:$SITE_PORT ssl;"
        tls_lines="    ssl_certificate $TLS_CERT;
    ssl_certificate_key $TLS_KEY;"
    else
        listen="listen $LISTEN_ADDRESS:$SITE_PORT;"
        tls_lines=''
    fi
    if [[ "$ACCESS_MODE" != 4 || ( -r "$TLS_CERT" && -r "$TLS_KEY" ) ]]; then
    cat >> "$temp" <<NGINX
server {
    $listen
$tls_lines
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
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 120s;
    }
}
NGINX
    fi
    chmod 644 "$temp"
    mv -f "$temp" "$NGINX_FILE"
    ln -sfn "$NGINX_FILE" "/etc/nginx/sites-enabled/$SERVICE_NAME.conf"
    nginx -t
}

issue_certificate() {
    [[ "$ACCESS_MODE" == 4 ]] || return 0
    install -d -m 755 "$ACME_WEBROOT/.well-known/acme-challenge"
    if ! certbot certonly --webroot --webroot-path "$ACME_WEBROOT" \
        --non-interactive --agree-tos --email "$ACME_EMAIL" \
        --cert-name "$SITE_HOST" -d "$SITE_HOST"; then
        echo 'Let’s Encrypt не смог подтвердить домен. Проверьте DNS и входящий TCP/80, затем повторите настройку.' >&2
        return 1
    fi
    if [[ ! -r "$TLS_CERT" || ! -r "$TLS_KEY" ]]; then
        echo 'Выданный сертификат не найден.' >&2
        return 1
    fi
    install -d -m 755 /etc/letsencrypt/renewal-hooks/deploy
    cat > /etc/letsencrypt/renewal-hooks/deploy/avt-reload-nginx <<'HOOK'
#!/bin/sh
systemctl reload nginx
HOOK
    chmod 755 /etc/letsencrypt/renewal-hooks/deploy/avt-reload-nginx
    if systemctl list-unit-files certbot.timer --no-legend 2>/dev/null | grep -q '^certbot.timer'; then
        systemctl enable --now certbot.timer
    else
        cat > /etc/systemd/system/avt-cert-renew.service <<'SERVICE'
[Unit]
Description=Renew Let's Encrypt certificates for ARSAT

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet
SERVICE
        cat > /etc/systemd/system/avt-cert-renew.timer <<'TIMER'
[Unit]
Description=Check ARSAT certificates twice daily

[Timer]
OnCalendar=*-*-* 03,15:00:00
RandomizedDelaySec=1h
Persistent=true

[Install]
WantedBy=timers.target
TIMER
        systemctl daemon-reload
        systemctl enable --now avt-cert-renew.timer
    fi
}

prepare_runtime() {
    mkdir -p "$PROJECT_ROOT/.runtime" "$PROJECT_ROOT/.backups" "$PROJECT_ROOT/staticfiles"
    chown -R www-data:www-data "$PROJECT_ROOT/.runtime" "$PROJECT_ROOT/.backups"
    chmod 700 "$PROJECT_ROOT/.runtime" "$PROJECT_ROOT/.backups"
}

prepare_python() {
    python3 -m venv "$PROJECT_ROOT/.venv"
    "$PYTHON" -m pip install --disable-pip-version-check -r "$PROJECT_ROOT/requirements.lock.txt"
    chmod -R a+rX "$PROJECT_ROOT/.venv"
}

apply_database() {
    "$PYTHON" manage.py migrate --noinput
    local sample_state
    sample_state="$("$PYTHON" manage.py sample_data_state)"
    if [[ "$IMPORT_SAMPLE" == y || "$IMPORT_SAMPLE" == Y ]]; then
        case "$sample_state" in
            empty) "$PYTHON" manage.py import_sample_data; sample_state=sample ;;
            sample) echo 'Тестовые данные уже загружены; завершаю настройку пользователей.' ;;
            *) fail 'В выбранной БД уже есть другие данные. Тестовый импорт отменён.' ;;
        esac
    fi
    if ! "$PYTHON" manage.py shell --no-imports --verbosity 0 -c 'from django.contrib.auth.models import User; import sys; sys.exit(0 if User.objects.filter(is_active=True,is_superuser=True).exists() else 1)' >/dev/null; then
        local admin_password
        admin_password="$(random_password)"
        AVT_ADMIN_PASSWORD="$admin_password" "$PYTHON" manage.py provision_admin
        CREDENTIAL_LINES+="  admin: $admin_password"$'\n'
    fi
    if [[ "$IMPORT_SAMPLE" == y || "$IMPORT_SAMPLE" == Y || ( "$RESUME_INCOMPLETE" == 1 && "$sample_state" == sample ) ]]; then
        local username password
        while IFS= read -r username; do
            [[ -n "$username" ]] || continue
            password="$(random_password)"
            AVT_NEW_PASSWORD="$password" "$PYTHON" manage.py reset_user_password "$username" --activate
            CREDENTIAL_LINES+="  $username: $password"$'\n'
        done < <("$PYTHON" manage.py sample_data_state --usernames)
    fi
    "$PYTHON" manage.py check --database default
    "$PYTHON" manage.py collectstatic --noinput --verbosity 0
    chown -R www-data:www-data "$PROJECT_ROOT/.runtime" "$PROJECT_ROOT/.backups"
    find "$PROJECT_ROOT/staticfiles" -type d -exec chmod 755 {} +
    chmod 755 "$PROJECT_ROOT/staticfiles"
    find "$PROJECT_ROOT/staticfiles" -type f -exec chmod 644 {} +
}

open_host_firewall() {
    [[ "$ACCESS_MODE" != 3 ]] || return 0
    if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
        ufw allow "$SITE_PORT/tcp"
        if [[ "$ACCESS_MODE" == 4 ]]; then ufw allow 80/tcp; fi
    elif command -v firewall-cmd >/dev/null && firewall-cmd --state >/dev/null 2>&1; then
        firewall-cmd --permanent --add-port="$SITE_PORT/tcp"
        if [[ "$ACCESS_MODE" == 4 ]]; then firewall-cmd --permanent --add-port=80/tcp; fi
        firewall-cmd --reload
    fi
}

health_check() {
    local attempt response status
    for attempt in {1..20}; do
        if [[ "$USE_HTTPS" == 1 ]]; then
            local -a tls_options=()
            if [[ "$ACCESS_MODE" != 4 ]]; then tls_options=(-k); fi
            response="$(curl "${tls_options[@]}" -fsS --noproxy '*' --max-time 5 --resolve "$SITE_HOST:$SITE_PORT:127.0.0.1" \
                "https://$SITE_HOST:$SITE_PORT/health/ready/" 2>/dev/null || true)"
        else
            response="$(curl -fsS --noproxy '*' --max-time 5 -H "Host: $SITE_HOST" \
                "http://127.0.0.1:$SITE_PORT/health/ready/" 2>/dev/null || true)"
        fi
        if [[ "$response" == *'"ok": true'* ]]; then return 0; fi
        sleep 1
    done
    echo 'Сайт не ответил на проверку /health/ready/. Посмотрите journalctl -u avt и nginx -t' >&2
    status="$(systemctl is-active "$SERVICE_NAME" 2>/dev/null || true)"
    echo "Состояние службы: ${status:-неизвестно}. Проверка приложения: curl -i http://127.0.0.1:$APP_PORT/health/ready/" >&2
    return 1
}

repair_code_access() {
    [[ -f "$PROJECT_ROOT/tools/ensure_code_access.sh" ]] || fail 'Сначала обновите проект через пункт 4 меню'
    bash "$PROJECT_ROOT/tools/ensure_code_access.sh"
}

repair_service() {
    [[ -f "$ENV_FILE" && -x "$PYTHON" ]] || fail 'Сначала выполните установку проекта'
    load_current_site
    repair_code_access
    "$PYTHON" manage.py check --database default
    "$PYTHON" manage.py collectstatic --noinput --verbosity 0
    find "$PROJECT_ROOT/staticfiles" -type d -exec chmod 755 {} +
    find "$PROJECT_ROOT/staticfiles" -type f -exec chmod 644 {} +
    systemctl start "$SERVICE_NAME"
    health_check
    echo 'Служба запущена и проверена. База данных не восстанавливалась и не изменялась этим действием.'
}

show_result() {
    if [[ "$ACCESS_MODE" == 4 && "$SITE_PORT" == 443 ]]; then printf 'Сайт: https://%s/\n' "$SITE_HOST"
    elif [[ "$USE_HTTPS" == 1 ]]; then printf 'Сайт: https://%s:%s/\n' "$SITE_HOST" "$SITE_PORT"
    else printf 'Сайт: http://%s:%s/\n' "$SITE_HOST" "$SITE_PORT"; fi
    if [[ "$ACCESS_MODE" != 3 ]]; then
        echo 'Если доступ с другого компьютера отсутствует, откройте этот порт также во внешнем сетевом экране (например, Azure NSG).'
    fi
    if [[ "$DB_PASSWORD_CREATED" == 1 ]]; then
        printf 'Новая БД: host=%s port=%s database=%s user=%s password=%s\n' \
            "$DB_HOST" "$DB_PORT" "$DB_NAME" "$DB_USER" "$DB_PASSWORD"
    fi
    if [[ -n "$CREDENTIAL_LINES" ]]; then
        printf 'Новые пароли приложения (показаны один раз):\n%s' "$CREDENTIAL_LINES"
    else
        echo 'Существующие пароли пользователей не изменены и не могут быть прочитаны из хешей.'
    fi
    echo 'Пользователи в выбранной базе:'
    "$PYTHON" manage.py shell --no-imports --verbosity 0 -c 'from django.contrib.auth.models import User; [print("  {}: {}".format(u.username, "активен" if u.is_active else "отключён")) for u in User.objects.order_by("username")]'
    echo 'Служба: sudo systemctl status avt; повторный запуск меню: sudo bash /opt/avt/install.sh'
}

installation_failed() {
    trap - ERR
    echo 'Установка прервана. После устранения ошибки повторите запуск sudo bash /opt/avt/install.sh.' >&2
    if [[ -f "$ENV_FILE" ]]; then echo 'Выберите изменение настроек, чтобы завершить установку.' >&2; fi
    if [[ "$DB_PASSWORD_CREATED" == 1 ]]; then
        printf 'Созданная БД: host=%s port=%s database=%s user=%s password=%s\n' \
            "$DB_HOST" "$DB_PORT" "$DB_NAME" "$DB_USER" "$DB_PASSWORD" >&2
    fi
    if [[ -n "$CREDENTIAL_LINES" ]]; then
        printf 'Созданные пароли приложения (сохраните их):\n%s' "$CREDENTIAL_LINES" >&2
    fi
    exit 1
}

install_new() {
    [[ ! -e "$ENV_FILE" ]] || fail 'Установка уже есть. Выберите изменение настроек.'
    choose_site
    trap installation_failed ERR
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y python3 python3-venv python3-dev libpq-dev postgresql-client nginx curl fonts-dejavu-core
    if [[ "$ACCESS_MODE" == 4 ]]; then apt-get install -y certbot; fi
    choose_database
    ensure_postgres_client
    IMPORT_SAMPLE="$(ask 'Импортировать тестовые данные? (y/n)' n)"
    [[ "$IMPORT_SAMPLE" =~ ^[yYnN]$ ]] || fail 'Ответьте y или n'
    prepare_python
    prepare_runtime
    write_env
    apply_database
    write_service
    write_nginx
    systemctl daemon-reload
    systemctl enable --now "$SERVICE_NAME"
    systemctl enable --now nginx
    systemctl reload nginx
    open_host_firewall
    if [[ "$ACCESS_MODE" == 4 ]]; then
        issue_certificate
        write_nginx
        systemctl reload nginx
    fi
    health_check
    trap - ERR
    show_result
}

rollback_settings() {
    trap - ERR
    echo 'Ошибка настройки; восстанавливаю прежние файлы конфигурации.' >&2
    cp -f "$BACKUP_ENV" "$ENV_FILE"
    chown www-data:www-data "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    if [[ -f "$BACKUP_NGINX" ]]; then
        cp -f "$BACKUP_NGINX" "$NGINX_FILE"
    else
        rm -f "$NGINX_FILE" "/etc/nginx/sites-enabled/$SERVICE_NAME.conf"
    fi
    nginx -t >/dev/null 2>&1 && systemctl reload nginx || true
    if [[ "$SERVICE_WAS_PRESENT" == 1 ]]; then
        systemctl restart "$SERVICE_NAME" || true
    else
        systemctl disable --now "$SERVICE_NAME" >/dev/null 2>&1 || true
        rm -f "$SERVICE_FILE"
        systemctl daemon-reload || true
    fi
    rm -f "$BACKUP_ENV" "$BACKUP_NGINX"
    exit 1
}

modify_settings() {
    [[ -f "$ENV_FILE" && -x "$PYTHON" ]] || fail 'Сначала выполните новую установку'
    if [[ ! -r /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf ]]; then
        apt-get update
        apt-get install -y fonts-dejavu-core
    fi
    load_current_site
    load_current_database
    SERVICE_WAS_PRESENT=0
    if [[ -f "$SERVICE_FILE" ]]; then SERVICE_WAS_PRESENT=1
    else
        RESUME_INCOMPLETE=1
        echo 'Найдена незавершённая установка: служба avt отсутствует. После проверки параметров она будет создана.'
    fi
    echo 'Изменить: 1 — IP/домен, порт и HTTP/HTTPS; 2 — PostgreSQL; 3 — всё вместе'
    local scope
    scope="$(ask 'Выберите настройки' 1)"
    [[ "$scope" =~ ^[123]$ ]] || fail 'Выберите 1, 2 или 3'
    if [[ "$scope" == 1 || "$scope" == 3 ]]; then
        choose_site
        if [[ "$ACCESS_MODE" == 4 ]]; then apt-get update; apt-get install -y certbot; fi
    fi
    IMPORT_SAMPLE=n
    if [[ "$scope" == 2 || "$scope" == 3 ]]; then
        choose_database
        IMPORT_SAMPLE="$(ask 'Импортировать тестовые данные, если новая база пуста? (y/n)' n)"
        [[ "$IMPORT_SAMPLE" =~ ^[yYnN]$ ]] || fail 'Ответьте y или n'
    fi
    ensure_postgres_client
    prepare_runtime
    BACKUP_ENV="$(mktemp "$PROJECT_ROOT/.runtime/.env-before.XXXXXX")"
    BACKUP_NGINX="$(mktemp "$PROJECT_ROOT/.runtime/.nginx-before.XXXXXX")"
    cp "$ENV_FILE" "$BACKUP_ENV"
    if [[ -f "$NGINX_FILE" ]]; then cp "$NGINX_FILE" "$BACKUP_NGINX"; else rm -f "$BACKUP_NGINX"; fi
    trap rollback_settings ERR
    if systemctl cat "$SERVICE_NAME.service" >/dev/null 2>&1; then
        systemctl stop "$SERVICE_NAME"
    fi
    write_env
    apply_database
    write_service
    write_nginx
    systemctl daemon-reload
    systemctl enable --now "$SERVICE_NAME"
    systemctl enable --now nginx
    systemctl reload nginx
    open_host_firewall
    if [[ "$ACCESS_MODE" == 4 && ( "$scope" != 2 || ! -r "$TLS_CERT" || ! -r "$TLS_KEY" ) ]]; then
        issue_certificate
        write_nginx
        systemctl reload nginx
    fi
    health_check || rollback_settings
    trap - ERR
    rm -f "$BACKUP_ENV" "$BACKUP_NGINX"
    show_result
}

reset_password() {
    [[ -f "$ENV_FILE" && -x "$PYTHON" ]] || fail 'Сначала выполните новую установку'
    local username password answer
    local -a activate=()
    read -r -p 'Логин существующего пользователя: ' username </dev/tty
    [[ -n "$username" ]] || fail 'Логин не указан'
    answer="$(ask 'Активировать учётную запись? (y/n)' y)"
    [[ "$answer" =~ ^[yYnN]$ ]] || fail 'Ответьте y или n'
    if [[ "$answer" == y || "$answer" == Y ]]; then activate=(--activate); fi
    password="$(random_password)"
    AVT_NEW_PASSWORD="$password" "$PYTHON" manage.py reset_user_password "$username" "${activate[@]}"
    printf 'Новый пароль пользователя %s: %s\n' "$username" "$password"
    echo 'Пароль выведен только в терминал. Сохраните его безопасным способом и смените после входа.'
}

update_failed() {
    trap - ERR
    set +e
    [[ -n "${UPDATE_STAGE:-}" ]] && rm -f "$UPDATE_STAGE/source/.env"
    echo 'Обновление прервано.' >&2
    if [[ -n "${UPDATE_BACKUP:-}" && -f "$UPDATE_BACKUP" ]]; then
        echo "Резервная копия базы сохранена: $UPDATE_BACKUP" >&2
    fi
    if [[ "${UPDATE_MIGRATIONS_STARTED:-0}" == 1 ]]; then
        echo 'Применение миграций уже началось. Проверьте состояние службы и журнал; база автоматически не восстанавливалась.' >&2
    else
        local rollback_ok=1
        if [[ "${UPDATE_CODE_SWITCHED:-0}" == 1 ]]; then
            if [[ "$(git rev-parse HEAD)" == "$UPDATE_TARGET" ]] && git reset --keep "$UPDATE_OLD"; then :
            else rollback_ok=0; fi
        fi
        if [[ "$rollback_ok" == 1 && "${UPDATE_VENV_MOVED:-0}" == 1 ]]; then
            if [[ -L "$PROJECT_ROOT/.venv" && "$(readlink "$PROJECT_ROOT/.venv")" == "$UPDATE_VENV_DIR" ]]; then
                rm -f "$PROJECT_ROOT/.venv"
            fi
            if [[ ! -e "$PROJECT_ROOT/.venv" && ! -L "$PROJECT_ROOT/.venv" ]]; then
                mv "$UPDATE_PREVIOUS_VENV" "$PROJECT_ROOT/.venv" || rollback_ok=0
            else rollback_ok=0; fi
        fi
        if [[ "$rollback_ok" == 1 ]]; then
            systemctl start "$SERVICE_NAME" || echo 'Не удалось запустить прежнюю службу; проверьте systemctl status avt.' >&2
            echo 'Прежняя версия сохранена; база данных не восстанавливалась и не очищалась.' >&2
        else
            echo 'Автоматическое возвращение к прежней версии не удалось; служба оставлена остановленной.' >&2
        fi
    fi
    exit 1
}

update_preflight_failed() {
    trap - ERR
    [[ -n "${UPDATE_STAGE:-}" ]] && rm -f "$UPDATE_STAGE/source/.env"
    echo 'Проверка обновления не прошла. Работающая версия и база данных не изменены.' >&2
    exit 1
}

update_project() {
    [[ -f "$ENV_FILE" && -x "$PYTHON" ]] || fail 'Сначала выполните установку проекта'
    [[ -d "$PROJECT_ROOT/.git" ]] || fail 'Каталог проекта не является Git-репозиторием'
    command -v flock >/dev/null || fail 'Для обновления нужна команда flock'
    prepare_runtime
    [[ ! -L "$PROJECT_ROOT/.venvs" ]] || fail 'Каталог окружений не может быть символической ссылкой'
    mkdir -p "$PROJECT_ROOT/.venvs"
    chown root:root "$PROJECT_ROOT/.venvs"
    chmod 755 "$PROJECT_ROOT/.venvs"
    [[ ! -L "$PROJECT_ROOT/.venvs/update.lock" ]] || fail 'Недопустимый файл блокировки обновления'
    exec 9>"$PROJECT_ROOT/.venvs/update.lock"
    flock -n 9 || fail 'Другое обновление уже выполняется'
    [[ "$(git branch --show-current)" == main ]] || fail 'Обновление поддерживается для ветки main'
    [[ -z "$(git status --porcelain --untracked-files=all -- . ':(exclude).venv' ':(exclude).venvs')" ]] || fail 'В проекте есть локальные изменения или неотслеживаемые файлы; сохраните их перед обновлением'
    git fetch --no-tags origin main
    UPDATE_OLD="$(git rev-parse HEAD)"
    UPDATE_TARGET="$(git rev-parse FETCH_HEAD)"
    if [[ "$UPDATE_OLD" == "$UPDATE_TARGET" ]]; then
        echo 'Установлена последняя версия проекта. Для проверки и восстановления службы выберите пункт 5 меню.'
        return 0
    fi
    git merge-base --is-ancestor "$UPDATE_OLD" "$UPDATE_TARGET" || fail 'Ветки разошлись; автоматическое обновление остановлено'
    printf 'Установлена версия %.12s, доступна версия %.12s.\n' "$UPDATE_OLD" "$UPDATE_TARGET"
    echo 'Могут быть добавлены таблицы, поля и индексы; удаление или изменение существующих данных автоматически не выполняется.'
    local answer
    answer="$(ask 'Обновить проект с сохранением данных? (y/n)' n)"
    [[ "$answer" =~ ^[yYnN]$ ]] || fail 'Ответьте y или n'
    if [[ "$answer" != y && "$answer" != Y ]]; then echo 'Обновление отменено.'; return 0; fi
    load_current_site
    load_current_database
    # Проверка, копия и миграции должны обращаться к одной настроенной базе.
    export PGHOST="$DB_HOST" PGPORT="$DB_PORT" PGDATABASE="$DB_NAME" PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD"
    app_psql -Atqc 'SELECT 1' | grep -qx 1 || fail 'Нет подключения к действующей базе PostgreSQL'

    UPDATE_STAGE="$(mktemp -d "$PROJECT_ROOT/.venvs/stage-XXXXXXXX")"
    trap update_preflight_failed ERR
    chmod 700 "$UPDATE_STAGE"
    UPDATE_VENV_DIR="$(mktemp -d "$PROJECT_ROOT/.venvs/release-XXXXXXXX")"
    chmod 755 "$UPDATE_VENV_DIR"
    UPDATE_PREVIOUS_VENV="$UPDATE_VENV_DIR.previous"
    mkdir "$UPDATE_STAGE/source"
    git archive "$UPDATE_TARGET" | tar -x -C "$UPDATE_STAGE/source"
    cp "$ENV_FILE" "$UPDATE_STAGE/source/.env"
    chmod 600 "$UPDATE_STAGE/source/.env"
    python3 -m venv "$UPDATE_VENV_DIR"
    "$UPDATE_VENV_DIR/bin/python" -m pip install --disable-pip-version-check -r "$UPDATE_STAGE/source/requirements.lock.txt"
    chmod -R a+rX "$UPDATE_VENV_DIR"
    (cd "$UPDATE_STAGE/source" && "$UPDATE_VENV_DIR/bin/python" manage.py check --database default &&
        "$UPDATE_VENV_DIR/bin/python" tools/check_update_migrations.py)
    rm -f "$UPDATE_STAGE/source/.env"
    trap - ERR

    local dump_bin server_version client_version backup_temp
    dump_bin="$(cd "$UPDATE_STAGE/source" && PG_BIN_DIR="$(env_value PG_BIN_DIR)" "$UPDATE_VENV_DIR/bin/python" -c 'from tools.pg_tools import postgres_bin; print(postgres_bin("pg_dump"))')"
    server_version="$(app_psql -Atqc 'SHOW server_version_num')"
    client_version="$("$dump_bin" --version 2>/dev/null | sed -nE 's/.* ([0-9]+)(\.[0-9]+)?.*/\1/p' || true)"
    [[ "$server_version" =~ ^[0-9]+$ ]] || fail 'Не удалось определить версию сервера PostgreSQL'
    if [[ ! "$client_version" =~ ^[0-9]+$ ]] || (( 10#$client_version < 10#$server_version / 10000 )); then
        local major=$((10#$server_version / 10000))
        echo "Устанавливаю клиент PostgreSQL $major для резервного копирования."
        export DEBIAN_FRONTEND=noninteractive
        if apt-get update && apt-cache show "postgresql-client-$major" >/dev/null 2>&1 && apt-get install -y "postgresql-client-$major"; then
            dump_bin="$(cd "$UPDATE_STAGE/source" && PG_BIN_DIR="$(env_value PG_BIN_DIR)" "$UPDATE_VENV_DIR/bin/python" -c 'from tools.pg_tools import postgres_bin; print(postgres_bin("pg_dump"))')"
            client_version="$("$dump_bin" --version 2>/dev/null | sed -nE 's/.* ([0-9]+)(\.[0-9]+)?.*/\1/p' || true)"
        fi
    fi
    [[ "$server_version" =~ ^[0-9]+$ && "$client_version" =~ ^[0-9]+$ ]] &&
        (( 10#$client_version >= 10#$server_version / 10000 )) ||
        fail 'Для резервной копии установите клиент PostgreSQL версии сервера или новее и проверьте PG_BIN_DIR в .env'
    [[ -z "$(git status --porcelain --untracked-files=all -- . ':(exclude).venv' ':(exclude).venvs')" ]] || fail 'Во время подготовки появились локальные изменения; обновление остановлено'
    UPDATE_MIGRATIONS_STARTED=0; UPDATE_CODE_SWITCHED=0; UPDATE_VENV_MOVED=0; UPDATE_BACKUP=''
    trap update_failed ERR
    systemctl stop "$SERVICE_NAME"
    cp "$ENV_FILE" "$UPDATE_STAGE/source/.env"
    chmod 600 "$UPDATE_STAGE/source/.env"
    (cd "$UPDATE_STAGE/source" && "$UPDATE_VENV_DIR/bin/python" tools/check_update_migrations.py)
    rm -f "$UPDATE_STAGE/source/.env"
    backup_temp="$(mktemp "$UPDATE_STAGE/backup-XXXXXXXX")"
    if ! PGPASSWORD="$DB_PASSWORD" PGCONNECT_TIMEOUT=5 "$dump_bin" --format=custom --no-owner --no-privileges \
        --host "$DB_HOST" --port "$DB_PORT" --username "$DB_USER" --dbname "$DB_NAME" --file "$backup_temp"; then
        rm -f "$backup_temp"
        echo 'Не удалось создать резервную копию перед обновлением.' >&2
        update_failed
    fi
    if [[ ! -s "$backup_temp" ]]; then
        rm -f "$backup_temp"
        echo 'Резервная копия пуста.' >&2
        update_failed
    fi
    UPDATE_BACKUP="$PROJECT_ROOT/.backups/backup-$(date +%Y%m%d-%H%M%S)-$(python3 -c 'import secrets; print(secrets.token_hex(4))').dump"
    chmod 600 "$backup_temp"
    chown www-data:www-data "$backup_temp"
    mv "$backup_temp" "$UPDATE_BACKUP"
    (umask 022; git merge --ff-only "$UPDATE_TARGET")
    UPDATE_CODE_SWITCHED=1
    repair_code_access
    mv "$PROJECT_ROOT/.venv" "$UPDATE_PREVIOUS_VENV"
    UPDATE_VENV_MOVED=1
    ln -s "$UPDATE_VENV_DIR" "$PROJECT_ROOT/.venv"
    UPDATE_MIGRATIONS_STARTED=1
    "$PYTHON" manage.py migrate --noinput
    "$PYTHON" manage.py check --database default
    "$PYTHON" manage.py collectstatic --noinput --verbosity 0
    systemctl start "$SERVICE_NAME"
    health_check
    trap - ERR
    rm -rf -- "$UPDATE_STAGE/source" || echo 'Не удалось убрать временную копию исходного кода.' >&2
    rmdir "$UPDATE_STAGE" 2>/dev/null || true
    printf 'Проект обновлён до %.12s. Данные и параметры подключения сохранены.\n' "$UPDATE_TARGET"
    printf 'Резервная копия до обновления: %s\n' "$UPDATE_BACKUP"
}

if [[ "${1:-}" == --update && "${AVT_UPDATE_REEXEC:-0}" == 1 ]]; then
    update_project
    exit $?
fi
echo 'АРСАТ — установка и обслуживание'
echo '1 — новая установка'
echo '2 — изменить настройки сайта или PostgreSQL'
echo '3 — сбросить пароль пользователя (включая admin)'
echo '4 — проверить и установить обновление проекта'
echo '5 — проверить и восстановить запуск службы'
if [[ -f "$ENV_FILE" ]]; then default_action=2; else default_action=1; fi
ACTION="$(ask 'Выберите действие' "$default_action")"
case "$ACTION" in
    1) install_new ;;
    2) modify_settings ;;
    3) reset_password ;;
    4)
        update_script="$(mktemp)"
        trap 'rm -f "$update_script"' EXIT
        cp "${BASH_SOURCE[0]}" "$update_script"
        AVT_UPDATE_REEXEC=1 AVT_PROJECT_ROOT="$PROJECT_ROOT" bash "$update_script" --update
        ;;
    5) repair_service ;;
    *) fail 'Выберите 1, 2, 3, 4 или 5' ;;
esac
