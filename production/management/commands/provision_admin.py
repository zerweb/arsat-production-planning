"""Создание первого администратора без стандартного пароля."""

import os

from django.contrib.auth.models import Group, User
from django.core.management import BaseCommand, CommandError
from django.db import transaction


class Command(BaseCommand):
    help = "Активировать первого администратора с паролем из AVT_ADMIN_PASSWORD"

    def handle(self, *args, **options):
        if User.objects.filter(is_active=True, is_superuser=True).exists():
            self.stdout.write("Действующий администратор уже существует; пароль не изменён.")
            return
        password = os.environ.get("AVT_ADMIN_PASSWORD", "")
        if len(password) < 20:
            raise CommandError("Для первого администратора нужен случайный пароль длиной от 20 символов")
        with transaction.atomic():
            group, _ = Group.objects.get_or_create(name="admin")
            user, _ = User.objects.get_or_create(username="admin")
            user.is_active = True
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.save()
            user.groups.add(group)
        self.stdout.write(self.style.SUCCESS("Администратор создан или активирован."))
