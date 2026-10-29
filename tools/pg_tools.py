"""Поиск установленных клиентских программ PostgreSQL."""
import os
import re
import shutil
import subprocess
from pathlib import Path


def postgres_bin(name):
    configured = os.getenv("PG_BIN_DIR")
    if configured:
        candidate = Path(configured) / name
        if candidate.is_file():
            return str(candidate)
    candidates = list(Path("/usr/lib/postgresql").glob(f"*/bin/{name}"))
    if os.name == "nt":
        candidates.append(Path(r"C:\OSPanel\modules\database\PostgreSQL-14-Win10\bin") / name)
    found = shutil.which(name)
    if found:
        candidates.append(Path(found))
    versions = []
    for candidate in candidates:
        if not candidate.is_file():
            continue
        try:
            result = subprocess.run([str(candidate), "--version"], capture_output=True, text=True, timeout=5)
            match = re.search(r"\b(\d+)(?:\.\d+)?(?:\s|$)", result.stdout)
            if result.returncode == 0 and match:
                versions.append((int(match.group(1)), str(candidate)))
        except (OSError, subprocess.SubprocessError):
            continue
    return max(versions)[1] if versions else name
