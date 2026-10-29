"""Administrative PostgreSQL connection and backup operations."""

import os
import re
import csv
import subprocess
import tempfile
import uuid
from datetime import datetime
from pathlib import Path

import psycopg
from django.conf import settings
from django.db import connection
from tools.pg_tools import postgres_bin


DB_KEYS = {"host": "PGHOST", "port": "PGPORT", "database": "PGDATABASE",
           "username": "PGUSER", "password": "PGPASSWORD"}
RUNTIME_DIR = settings.BASE_DIR / ".runtime"
BACKUP_DIR = settings.BASE_DIR / ".backups"
MAX_RESTORE_BYTES = 50 * 1024 * 1024  # Совпадает с client_max_body_size 50m в Nginx.


def active_config():
    db = connection.settings_dict
    return {"host": str(db["HOST"]), "port": str(db["PORT"]),
            "database": str(db["NAME"]), "username": str(db["USER"]),
            "password": str(db["PASSWORD"])}


def checked_config(payload):
    current = active_config()
    candidate = {key: str(payload.get(key, "")).strip() for key in DB_KEYS}
    if not candidate["password"]:
        candidate["password"] = current["password"]
    for key, value in candidate.items():
        if not value or len(value) > 255 or any(char in value for char in "\x00\r\n"):
            raise ValueError("Заполните корректные параметры PostgreSQL")
    try:
        port = int(candidate["port"])
    except ValueError as exc:
        raise ValueError("Порт PostgreSQL должен быть числом") from exc
    if not 1 <= port <= 65535:
        raise ValueError("Порт PostgreSQL должен быть от 1 до 65535")
    candidate["port"] = str(port)
    with psycopg.connect(host=candidate["host"], port=port, dbname=candidate["database"],
                         user=candidate["username"], password=candidate["password"],
                         connect_timeout=5) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT current_database(), to_regclass('public.django_migrations'), to_regclass('public.auth_user')")
            database, migrations, users = cursor.fetchone()
            if database != candidate["database"] or not migrations or not users:
                raise ValueError("В выбранной БД нет подготовленной схемы Django")
    return candidate


def save_config(candidate):
    env_path = settings.BASE_DIR / ".env"
    lines = env_path.read_text(encoding="utf-8").splitlines() if env_path.exists() else []
    updates = {DB_KEYS[key]: value for key, value in candidate.items()}
    output = []
    for line in lines:
        key = line.split("=", 1)[0].strip() if "=" in line else ""
        if key in updates:
            output.append(f"{key}={updates.pop(key)}")
        else:
            output.append(line)
    output.extend(f"{key}={value}" for key, value in updates.items())
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=env_path.parent,
                                     prefix=".env-", delete=False) as file:
        temporary = Path(file.name)
        file.write("\n".join(output) + "\n")
        file.flush()
        os.fsync(file.fileno())
    try:
        os.replace(temporary, env_path)
        if os.name == "nt":
            # На Windows ограничиваем ACL напрямую, без внешнего PS1-сценария.
            identity = subprocess.run(["whoami", "/user", "/fo", "csv", "/nh"],
                capture_output=True, text=True, timeout=10, check=True)
            sid = next(csv.reader(identity.stdout.splitlines()))[-1]
            result = subprocess.run(["icacls", str(env_path), "/inheritance:r", "/grant:r",
                f"*{sid}:(F)", "*S-1-5-18:(F)", "*S-1-5-32-544:(F)"],
                capture_output=True, text=True, timeout=30)
            if result.returncode:
                raise OSError("Не удалось ограничить доступ к файлу конфигурации")
        else:
            os.chmod(env_path, 0o600)
    finally:
        temporary.unlink(missing_ok=True)


def dump_database(destination, config=None):
    config = config or active_config()
    destination = Path(destination)
    if destination.suffix not in {".sql", ".dump"}:
        raise ValueError("Формат резервной копии должен быть .sql или .dump")
    dump_format = "plain" if destination.suffix == ".sql" else "custom"
    env = os.environ.copy()
    env["PGPASSWORD"] = config["password"]
    args = [postgres_bin("pg_dump.exe" if os.name == "nt" else "pg_dump"),
            f"--format={dump_format}", "--no-owner", "--no-privileges", "--file", str(destination),
            "--host", config["host"], "--port", config["port"], "--username", config["username"],
            "--dbname", config["database"]]
    result = subprocess.run(args, env=env, capture_output=True, text=True, timeout=300)
    if result.returncode:
        Path(destination).unlink(missing_ok=True)
        error = result.stderr.strip()[:500]
        match = re.search(r"(?:server version|версия сервера):\s*(\d+)", error, re.IGNORECASE)
        if match:
            error += (f" Установите на сервере приложения клиент PostgreSQL {match.group(1)} "
                      f"(пакет postgresql-client-{match.group(1)}) или более новую совместимую версию.")
        raise RuntimeError(error or "Не удалось создать резервную копию")
    if not Path(destination).is_file() or Path(destination).stat().st_size < 5:
        raise RuntimeError("Резервная копия не создана")


def validate_dump(path):
    if path.stat().st_size < 5 or path.stat().st_size > MAX_RESTORE_BYTES:
        raise ValueError("Размер файла резервной копии должен быть от 5 байт до 50 МБ")
    with path.open("rb") as file:
        if file.read(5) != b"PGDMP":
            raise ValueError("Нужен файл резервной копии PostgreSQL в формате .dump")
    result = subprocess.run([postgres_bin("pg_restore.exe" if os.name == "nt" else "pg_restore"),
                             "--list", str(path)], capture_output=True, text=True, timeout=30)
    required = ("TABLE DATA public django_migrations ", "TABLE DATA public auth_user ",
                "TABLE DATA public production_order ")
    if result.returncode or any(entry not in result.stdout for entry in required):
        raise ValueError("Файл резервной копии повреждён или не содержит таблиц")


def backup_name(prefix="backup", extension="sql"):
    if extension not in {"sql", "dump"}:
        raise ValueError("Неверный формат резервной копии")
    return f"{prefix}-{datetime.now():%Y%m%d-%H%M%S}-{uuid.uuid4().hex[:8]}.{extension}"


def safe_backup_name(name):
    if not re.fullmatch(r"(?:pre-restore|backup)-\d{8}-\d{6}-[a-f0-9]{8}\.(?:sql|dump)", name):
        raise ValueError("Неверное имя файла резервной копии")
    return name


def safe_backup_path(name):
    path = BACKUP_DIR / safe_backup_name(name)
    if path.is_symlink() or path.resolve().parent != BACKUP_DIR.resolve():
        raise ValueError("Недопустимый путь резервной копии")
    return path
