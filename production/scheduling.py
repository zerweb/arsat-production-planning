"""Deterministic assignment of an unassigned job to a qualified worker."""

from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Employee, Job, TimesheetEntry


def _months_between(start, end):
    cursor = start.replace(day=1)
    while cursor <= end:
        yield cursor
        cursor = (cursor.replace(day=28) + timedelta(days=4)).replace(day=1)


@transaction.atomic
def assign_worker(job_id):
    job = Job.objects.select_for_update().get(pk=job_id)
    if job.employee_id:
        return job.employee
    if job.status in ("done", "accepted"):
        raise ValidationError("Завершенное задание нельзя назначить автоматически.")
    required_grade = job.operation.definition.min_grade if job.operation.definition_id else 1
    candidates = Employee.objects.select_for_update().filter(
        department_id=job.operation.work_center.department_id, archived=False,
        grade__gte=required_grade, personnel_status="Работает").order_by("pk")
    working_days = sum((job.planned_start + timedelta(days=offset)).weekday() < 5
                       for offset in range((job.planned_end - job.planned_start).days + 1))
    if working_days <= 0:
        raise ValidationError("В сроке задания нет рабочих дней.")
    selected = None
    best = None
    for employee in candidates:
        capacity = employee.hours_per_day * working_days
        absent = TimesheetEntry.objects.filter(employee=employee, month__in=list(
            _months_between(job.planned_start, job.planned_end))).values_list("absent_hours", flat=True)
        capacity = max(capacity - sum(absent, Decimal("0")), Decimal("0"))
        load = sum((other.planned_hours for other in Job.objects.filter(
            employee=employee, planned_start__lte=job.planned_end,
            planned_end__gte=job.planned_start).exclude(status__in=("done", "accepted")) if other.pk != job.pk), Decimal("0"))
        if capacity < load + job.planned_hours:
            continue
        score = (load / capacity if capacity else Decimal("1"), load, employee.pk)
        if best is None or score < best:
            best, selected = score, employee
    if selected is None:
        raise ValidationError("Нет сотрудника нужного разряда со свободной мощностью на срок задания.")
    job.employee = selected
    job.full_clean()
    job.save(update_fields=["employee"])
    return selected
