"""Сброс пароля существующего пользователя из серверного установщика."""

import os

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management import BaseCommand, CommandError
from django.db import transaction


class Command(BaseCommand):
    help = "Задать новый пароль из AVT_NEW_PASSWORD; исходный пароль не выводится"

    def add_arguments(self, parser):
        parser.add_argument("username")
        parser.add_argument("--activate", action="store_true")

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username=options["username"])
        except User.DoesNotExist as exc:
            raise CommandError("Пользователь не найден") from exc
        password = os.environ.get("AVT_NEW_PASSWORD", "")
        if len(password) < 20:
            raise CommandError("Новый пароль должен содержать не менее 20 символов")
        try:
            validate_password(password, user)
        except ValidationError as exc:
            raise CommandError("Новый пароль не прошёл проверку сложности") from exc
        with transaction.atomic():
            user.set_password(password)
            if options["activate"]:
                user.is_active = True
            user.save(update_fields=["password", "is_active"])
        self.stdout.write(self.style.SUCCESS(f"Пароль пользователя {user.username} изменён."))
