"""Безопасный однократный импорт обезличенных данных из текущей БД."""

from pathlib import Path

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management import BaseCommand, CommandError, call_command
from django.db import transaction

from production.models import Customer, Product, Order


class Command(BaseCommand):
    help = "Загрузить тестовые фикстуры только в пустую базу"

    def handle(self, *args, **options):
        # Не перезаписываем реальные учётные записи или производственные данные.
        if User.objects.exists() or any(model.objects.exists() for model in (Customer, Product, Order)):
            raise CommandError("Импорт допустим только в пустую базу после миграций")
        directory = Path(settings.BASE_DIR) / "database_import"
        files = [directory / "01_roles_users.json", directory / "02_sample_data.json"]
        if any(not file.is_file() for file in files):
            raise CommandError("Файлы тестовых данных отсутствуют")
        with transaction.atomic():
            for file in files:
                call_command("loaddata", str(file), verbosity=0)
        self.stdout.write(self.style.SUCCESS("Тестовые данные загружены. Пароли пользователей отключены."))
