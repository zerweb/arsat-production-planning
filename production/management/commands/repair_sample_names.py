from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from production.models import AuditLog


class Command(BaseCommand):
    help = "Исправляет точно известные повреждённые подписи двух тестовых нормировщиков."

    def handle(self, *args, **options):
        updated = 0
        with transaction.atomic():
            for suffix in ("01", "02"):
                user = User.objects.select_for_update().filter(
                    username=f"normalizer_{suffix}", first_name="??????? ?? ????????????",
                    last_name=suffix, groups__name="normalizer",
                ).first()
                if user:
                    user.first_name = "Инженер по нормированию труда"
                    user.save(update_fields=["first_name"])
                    AuditLog.objects.create(user=None, model_name="User", object_id=user.pk,
                        action="update", reason="Исправлена повреждённая подпись тестовой учётной записи")
                    updated += 1
        self.stdout.write(f"Исправлено тестовых подписей нормировщиков: {updated}")
