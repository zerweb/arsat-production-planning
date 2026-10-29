#!/usr/bin/env python3
"""Не допускает автоматического обновления с потенциально опасными миграциями."""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.db.migrations import operations


SAFE_OPERATIONS = (
    operations.CreateModel,
    operations.AddField,
    operations.AddIndex,
    operations.AddConstraint,
    operations.AlterModelOptions,
    operations.AlterModelManagers,
)


def unsupported_operations(plan):
    result = []
    for migration, backwards in plan:
        if backwards:
            result.append(f"{migration.app_label}.{migration.name}: откат миграции")
            continue
        for operation in migration.operations:
            if type(operation) not in SAFE_OPERATIONS:
                result.append(f"{migration.app_label}.{migration.name}: {operation.__class__.__name__}")
    return result


def main():
    executor = MigrationExecutor(connection)
    plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
    blocked = unsupported_operations(plan)
    if blocked:
        print("Автоматическое обновление остановлено: миграции требуют отдельной проверки:", file=sys.stderr)
        for item in blocked:
            print(f"  {item}", file=sys.stderr)
        return 1
    print(f"Проверка миграций пройдена: {len(plan)} ожидают применения.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
