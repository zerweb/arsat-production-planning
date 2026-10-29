"""Run Waitress and apply administrator approved DB changes between workers."""

import argparse
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from pg_tools import postgres_bin


ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / ".runtime"
BACKUPS = ROOT / ".backups"
ENV_FILE = ROOT / ".env"


def env_values():
    values = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                key, value = line.split("=", 1)
                values[key.strip()] = value.strip()
    return values


def worker_env():
    values = env_values()
    environment = os.environ.copy()
    for key in ("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD"):
        if key in values:
            environment[key] = values[key]
    environment["DJANGO_DEBUG"] = "0"
    return environment


def pg_bin(name):
    return postgres_bin(name, env_values().get("PG_BIN_DIR"))


def status(state, message, backup=""):
    RUNTIME.mkdir(exist_ok=True)
    (RUNTIME / "restore-status.json").write_text(json.dumps({"state": state, "message": message,
        "backup": backup}, ensure_ascii=False), encoding="utf-8")


def run_db_tool(name, options, values, timeout=600):
    environment = os.environ.copy()
    environment["PGPASSWORD"] = values["PGPASSWORD"]
    args = [pg_bin(name), "--host", values["PGHOST"], "--port", values["PGPORT"],
            "--username", values["PGUSER"], "--dbname", values["PGDATABASE"], *options]
    return subprocess.run(args, cwd=ROOT, env=environment, capture_output=True, text=True, timeout=timeout)


def apply_restore(request_file):
    try:
        file_name = json.loads(request_file.read_text(encoding="utf-8")).get("file", "")
    except (OSError, ValueError):
        status("failed", "Не удалось прочитать заявку на восстановление")
        request_file.unlink(missing_ok=True)
        return
    if not re.fullmatch(r"restore-[a-f0-9]{16}\.dump", file_name):
        status("failed", "Неверное имя файла восстановления")
        request_file.unlink(missing_ok=True)
        return
    source = RUNTIME / file_name
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_name = f"pre-restore-{stamp}-{os.urandom(4).hex()}.dump"
    BACKUPS.mkdir(exist_ok=True)
    safety_copy = BACKUPS / backup_name
    values = env_values()
    try:
        if not source.is_file():
            raise RuntimeError("Файл резервной копии недоступен")
        with source.open("rb") as file:
            if file.read(5) != b"PGDMP":
                raise RuntimeError("Файл резервной копии недоступен")
        status("running", "Создаётся страховочная копия текущей базы")
        dump = run_db_tool("pg_dump.exe" if os.name == "nt" else "pg_dump",
            ["--format=custom", "--no-owner", "--no-privileges", "--file", str(safety_copy)], values)
        if dump.returncode or not safety_copy.is_file() or safety_copy.stat().st_size < 5:
            raise RuntimeError(dump.stderr.strip()[:500] or "Не удалось создать страховочную копию")
        status("running", "Восстанавливается база данных", backup_name)
        restored = run_db_tool("pg_restore.exe" if os.name == "nt" else "pg_restore",
            ["--single-transaction", "--exit-on-error", "--clean", "--if-exists",
             "--no-owner", "--no-privileges", str(source)], values)
        if restored.returncode:
            raise RuntimeError(restored.stderr.strip()[:500] or "Ошибка восстановления PostgreSQL")
        status("done", "База данных восстановлена", backup_name)
    except (OSError, KeyError, RuntimeError, subprocess.SubprocessError) as exc:
        status("failed", str(exc), backup_name if safety_copy.is_file() else "")
    finally:
        source.unlink(missing_ok=True)
        request_file.unlink(missing_ok=True)


def stop_worker(worker):
    if worker.poll() is not None:
        return
    worker.terminate()
    try:
        worker.wait(timeout=15)
    except subprocess.TimeoutExpired:
        worker.kill()
        worker.wait(timeout=5)


def launch(port):
    return subprocess.Popen([sys.executable, "-m", "waitress", f"--listen=127.0.0.1:{port}",
                             "--threads=4", "config.wsgi:application"], cwd=ROOT, env=worker_env())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    RUNTIME.mkdir(exist_ok=True)
    worker = launch(args.port)
    modified = ENV_FILE.stat().st_mtime_ns if ENV_FILE.exists() else 0
    try:
        while True:
            (RUNTIME / "supervisor.json").write_text(json.dumps({"time": time.time(),
                "database": env_values().get("PGDATABASE", ""), "supervisor_pid": os.getpid(),
                "worker_pid": worker.pid}), encoding="utf-8")
            time.sleep(1)
            pending = RUNTIME / "restore-request.json"
            current = ENV_FILE.stat().st_mtime_ns if ENV_FILE.exists() else 0
            if pending.exists() or current != modified:
                time.sleep(1)
                stop_worker(worker)
                if pending.exists():
                    apply_restore(pending)
                modified = ENV_FILE.stat().st_mtime_ns if ENV_FILE.exists() else 0
                worker = launch(args.port)
            elif worker.poll() is not None:
                print(f"Waitress exited with code {worker.returncode}; restarting", flush=True)
                time.sleep(2)
                worker = launch(args.port)
    except KeyboardInterrupt:
        stop_worker(worker)
    finally:
        (RUNTIME / "supervisor.json").unlink(missing_ok=True)


if __name__ == "__main__":
    main()
