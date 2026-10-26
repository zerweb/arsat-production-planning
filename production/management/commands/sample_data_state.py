"""Определить, пуста ли БД или содержит ровно учебные фикстуры."""

import json
from collections import defaultdict

from django.apps import apps
from django.conf import settings
from django.contrib.auth.models import User
from django.core.management import BaseCommand, CommandError

from production.models import Customer, Order, Product


class Command(BaseCommand):
    help = "Вернуть empty, sample или populated для безопасного повтора установки"

    def add_arguments(self, parser):
        parser.add_argument("--usernames", action="store_true")

    def handle(self, *args, **options):
        paths = [settings.BASE_DIR / "database_import" / name for name in
                 ("01_roles_users.json", "02_sample_data.json")]
        if any(not path.is_file() for path in paths):
            raise CommandError("Файлы тестовых данных отсутствуют")
        records = [record for path in paths for record in json.loads(path.read_text(encoding="utf-8"))]
        expected = defaultdict(set)
        usernames = []
        for record in records:
            expected[record["model"]].add(record["pk"])
            if record["model"] == "auth.user" and record["fields"]["username"] != "admin":
                usernames.append(record["fields"]["username"])

        if not User.objects.exists() and not any(model.objects.exists() for model in (Customer, Product, Order)):
            state = "empty"
        else:
            state = "sample"
            for label, primary_keys in expected.items():
                model = apps.get_model(label)
                if set(model.objects.values_list("pk", flat=True)) != primary_keys:
                    state = "populated"
                    break

        if options["usernames"]:
            if state != "sample":
                raise CommandError("Тестовые пользователи отсутствуют или БД содержит другие данные")
            for username in usernames:
                self.stdout.write(username)
        else:
            self.stdout.write(state)
