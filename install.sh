#!/usr/bin/env bash
set -Eeuo pipefail

# Установка и обслуживание АРСАТ на Debian/Ubuntu/Astra Linux с systemd.
# Пароли выводятся только в терминал и не записываются в отдельный файл.
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
SERVICE_NAME=avt
APP_PORT=8001
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
NGINX_FILE="/etc/nginx/sites-available/$SERVICE_NAME.conf"
PYTHON="$PROJECT_ROOT/.venv/bin/python"
CREDENTIAL_LINES=''
DB_PASSWORD_CREATED=0

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
command -v python3 >/dev/null || fail 'Нужен Python 3'
[[ -r /dev/tty ]] || fail 'Нужен интерактивный терминал'
umask 077
cd "$PROJECT_ROOT"

choose_site() {
    local default_ip current_host current_port current_mode
    default_ip="$(server_ip)"
    current_host="$(env_value AVT_SITE_HOST)"
    current_port="$(env_value AVT_SITE_PORT)"
    current_mode="$(env_value AVT_ACCESS_MODE)"
    SITE_PORT="$(ask 'Порт веб-сайта' "${current_port:-8080}")"
    valid_port "$SITE_PORT" && [[ "$SITE_PORT" != "$APP_PORT" ]] || fail 'Недопустимый порт сайта'
    echo 'Доступ: 1 — HTTP по IP в сети; 2 — HTTPS по сети; 3 — HTTP только на сервере'
    ACCESS_MODE="$(ask 'Выберите режим' "${current_mode:-1}")"
    case "$ACCESS_MODE" in
        1) LISTEN_ADDRESS=0.0.0.0; USE_HTTPS=0; echo 'HTTP передаёт пароли без шифрования. Используйте только доверенную сеть.' ;;
        2) LISTEN_ADDRESS=0.0.0.0; USE_HTTPS=1 ;;
        3) LISTEN_ADDRESS=127.0.0.1; USE_HTTPS=0 ;;
        *) fail 'Выберите 1, 2 или 3' ;;
    esac
    if [[ "$ACCESS_MODE" == 3 ]]; then
        SITE_HOST=127.0.0.1
    else
        SITE_HOST="$(ask 'IP или домен, по которому откроют сайт' "${current_host:-$default_ip}")"
        valid_host "$SITE_HOST" && [[ "$SITE_HOST" != 127.0.0.1 && "$SITE_HOST" != localhost ]] ||
            fail 'Для сетевого доступа укажите IP сервера или домен'
    fi
    TLS_CERT=''; TLS_KEY=''
    if [[ "$ACCESS_MODE" == 2 ]]; then
        TLS_CERT="$(ask 'Абсолютный путь к TLS-сертификату' "$(env_value AVT_TLS_CERT)")"
        TLS_KEY="$(ask 'Абсолютный путь к TLS-ключу' "$(env_value AVT_TLS_KEY)")"
        [[ "$TLS_CERT" =~ ^/[A-Za-z0-9/_+.,-]+$ && -r "$TLS_CERT" ]] || fail 'TLS-сертификат недоступен'
        [[ "$TLS_KEY" =~ ^/[A-Za-z0-9/_+.,-]+$ && -r "$TLS_KEY" ]] || fail 'TLS-ключ недоступен'
    fi
    if [[ "$USE_HTTPS" == 1 ]]; then CSRF_ORIGIN="https://$SITE_HOST:$SITE_PORT"
    else CSRF_ORIGIN="http://$SITE_HOST:$SITE_PORT"; fi
}

load_current_site() {
    SITE_HOST="$(env_value AVT_SITE_HOST)"; SITE_HOST="${SITE_HOST:-127.0.0.1}"
    SITE_PORT="$(env_value AVT_SITE_PORT)"; SITE_PORT="${SITE_PORT:-8080}"
    ACCESS_MODE="$(env_value AVT_ACCESS_MODE)"; ACCESS_MODE="${ACCESS_MODE:-3}"
    TLS_CERT="$(env_value AVT_TLS_CERT)"; TLS_KEY="$(env_value AVT_TLS_KEY)"
    if [[ "$ACCESS_MODE" == 2 ]]; then USE_HTTPS=1; CSRF_ORIGIN="https://$SITE_HOST:$SITE_PORT"
    else USE_HTTPS=0; CSRF_ORIGIN="http://$SITE_HOST:$SITE_PORT"; fi
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
admin_psql() {
    PGPASSWORD="$DB_ADMIN_PASSWORD" PGCONNECT_TIMEOUT=5 psql -X -w --host "$DB_HOST" --port "$DB_PORT" \
        --username "$DB_ADMIN_USER" --dbname postgres -v ON_ERROR_STOP=1 "$@"
}
choose_database() {
    local default_host default_port role_exists database_exists
    default_host="$(env_value PGHOST)"; default_port="$(env_value PGPORT)"
    echo 'PostgreSQL: 1 — создать БД на готовом сервере; 2 — подключить готовую БД'
    DB_MODE="$(ask 'Выберите режим' 1)"
    [[ "$DB_MODE" == 1 || "$DB_MODE" == 2 ]] || fail 'Выберите 1 или 2'
    DB_HOST="$(ask 'Адрес работающего сервера PostgreSQL' "${default_host:-127.0.0.1}")"
    DB_PORT="$(ask 'Порт PostgreSQL' "${default_port:-5432}")"
    valid_host "$DB_HOST" && valid_port "$DB_PORT" || fail 'Неверный адрес или порт PostgreSQL'
    DB_NAME="$(ask 'Название базы' "$(env_value PGDATABASE | tr -d '\r')")"
    DB_NAME="${DB_NAME:-avt_production}"
    DB_USER="$(ask 'Пользователь приложения в PostgreSQL' "$(env_value PGUSER | tr -d '\r')")"
    DB_USER="${DB_USER:-avt_app}"
    valid_name "$DB_NAME" && valid_name "$DB_USER" || fail 'Имя БД и пользователя: строчные латинские буквы, цифры, _'
    if [[ "$DB_MODE" == 1 ]]; then
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
}

write_env() {
    local temp key value
    temp="$(mktemp "$PROJECT_ROOT/.env-tmp.XXXXXX")"
    if [[ -f "$ENV_FILE" ]]; then
        while IFS='=' read -r key value; do
            case "$key" in
                PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD|DJANGO_SECRET_KEY|DJANGO_ALLOWED_HOSTS|DJANGO_CSRF_TRUSTED_ORIGINS|DJANGO_USE_HTTPS|DJANGO_DEBUG|AVT_SITE_HOST|AVT_SITE_PORT|AVT_ACCESS_MODE|AVT_TLS_CERT|AVT_TLS_KEY) ;;
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
    local listen tls_lines temp
    temp="$(mktemp "/etc/nginx/sites-available/.avt-tmp.XXXXXX")"
    if [[ "$USE_HTTPS" == 1 ]]; then
        listen="listen $LISTEN_ADDRESS:$SITE_PORT ssl;"
        tls_lines="    ssl_certificate $TLS_CERT;
    ssl_certificate_key $TLS_KEY;"
    else
        listen="listen $LISTEN_ADDRESS:$SITE_PORT;"
        tls_lines=''
    fi
    cat > "$temp" <<NGINX
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
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 120s;
    }
}
NGINX
    chmod 644 "$temp"
    mv -f "$temp" "$NGINX_FILE"
    ln -sfn "$NGINX_FILE" "/etc/nginx/sites-enabled/$SERVICE_NAME.conf"
    nginx -t
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
    if [[ "$IMPORT_SAMPLE" == y || "$IMPORT_SAMPLE" == Y ]]; then
        "$PYTHON" manage.py import_sample_data
    fi
    if ! "$PYTHON" manage.py shell -c 'from django.contrib.auth.models import User; import sys; sys.exit(0 if User.objects.filter(is_active=True,is_superuser=True).exists() else 1)' >/dev/null; then
        local admin_password
        admin_password="$(random_password)"
        AVT_ADMIN_PASSWORD="$admin_password" "$PYTHON" manage.py provision_admin
        CREDENTIAL_LINES+="  admin: $admin_password"$'\n'
    fi
    if [[ "$IMPORT_SAMPLE" == y || "$IMPORT_SAMPLE" == Y ]]; then
        local username password
        while IFS= read -r username; do
            [[ -n "$username" ]] || continue
            password="$(random_password)"
            AVT_NEW_PASSWORD="$password" "$PYTHON" manage.py reset_user_password "$username" --activate
            CREDENTIAL_LINES+="  $username: $password"$'\n'
        done < <("$PYTHON" manage.py shell -c 'from django.contrib.auth.models import User; print("\n".join(User.objects.exclude(username="admin").order_by("username").values_list("username", flat=True)))')
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
    elif command -v firewall-cmd >/dev/null && firewall-cmd --state >/dev/null 2>&1; then
        firewall-cmd --permanent --add-port="$SITE_PORT/tcp"
        firewall-cmd --reload
    fi
}

health_check() {
    local attempt response
    for attempt in {1..20}; do
        if [[ "$USE_HTTPS" == 1 ]]; then
            response="$(curl -kfsS --noproxy '*' --max-time 5 --resolve "$SITE_HOST:$SITE_PORT:127.0.0.1" \
                "https://$SITE_HOST:$SITE_PORT/health/ready/" 2>/dev/null || true)"
        else
            response="$(curl -fsS --noproxy '*' --max-time 5 -H "Host: $SITE_HOST" \
                "http://127.0.0.1:$SITE_PORT/health/ready/" 2>/dev/null || true)"
        fi
        if [[ "$response" == *'"ok": true'* ]]; then return 0; fi
        sleep 1
    done
    echo 'Сайт не ответил на проверку /health/ready/. Посмотрите journalctl -u avt и nginx -t' >&2
    return 1
}

show_result() {
    if [[ "$USE_HTTPS" == 1 ]]; then printf 'Сайт: https://%s:%s/\n' "$SITE_HOST" "$SITE_PORT"
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
    "$PYTHON" manage.py shell -c 'from django.contrib.auth.models import User; [print("  {}: {}".format(u.username, "активен" if u.is_active else "отключён")) for u in User.objects.order_by("username")]'
    echo 'Служба: sudo systemctl status avt; повторный запуск меню: sudo bash /opt/avt/install.sh'
}

install_new() {
    [[ ! -e "$ENV_FILE" ]] || fail 'Установка уже есть. Выберите изменение настроек.'
    choose_site
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y python3 python3-venv python3-dev libpq-dev postgresql-client nginx curl
    choose_database
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
    health_check
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
    systemctl restart "$SERVICE_NAME" || true
    rm -f "$BACKUP_ENV" "$BACKUP_NGINX"
    exit 1
}

modify_settings() {
    [[ -f "$ENV_FILE" && -x "$PYTHON" ]] || fail 'Сначала выполните новую установку'
    load_current_site
    load_current_database
    echo 'Изменить: 1 — IP/домен, порт и HTTP/HTTPS; 2 — PostgreSQL; 3 — всё вместе'
    local scope
    scope="$(ask 'Выберите настройки' 1)"
    [[ "$scope" =~ ^[123]$ ]] || fail 'Выберите 1, 2 или 3'
    if [[ "$scope" == 1 || "$scope" == 3 ]]; then choose_site; fi
    IMPORT_SAMPLE=n
    if [[ "$scope" == 2 || "$scope" == 3 ]]; then
        choose_database
        IMPORT_SAMPLE="$(ask 'Импортировать тестовые данные, если новая база пуста? (y/n)' n)"
        [[ "$IMPORT_SAMPLE" =~ ^[yYnN]$ ]] || fail 'Ответьте y или n'
    fi
    prepare_runtime
    BACKUP_ENV="$(mktemp "$PROJECT_ROOT/.runtime/.env-before.XXXXXX")"
    BACKUP_NGINX="$(mktemp "$PROJECT_ROOT/.runtime/.nginx-before.XXXXXX")"
    cp "$ENV_FILE" "$BACKUP_ENV"
    if [[ -f "$NGINX_FILE" ]]; then cp "$NGINX_FILE" "$BACKUP_NGINX"; else rm -f "$BACKUP_NGINX"; fi
    trap rollback_settings ERR
    systemctl stop "$SERVICE_NAME"
    write_env
    apply_database
    write_nginx
    systemctl restart "$SERVICE_NAME"
    systemctl reload nginx
    open_host_firewall
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

echo 'АРСАТ — установка и обслуживание'
echo '1 — новая установка'
echo '2 — изменить настройки сайта или PostgreSQL'
echo '3 — сбросить пароль пользователя (включая admin)'
if [[ -f "$ENV_FILE" ]]; then default_action=2; else default_action=1; fi
ACTION="$(ask 'Выберите действие' "$default_action")"
case "$ACTION" in
    1) install_new ;;
    2) modify_settings ;;
    3) reset_password ;;
    *) fail 'Выберите 1, 2 или 3' ;;
esac
