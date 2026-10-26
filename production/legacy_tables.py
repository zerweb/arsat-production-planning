"""Typed ORM storage for the three editable tables in the original interface."""

from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from django.core.exceptions import ValidationError

from .models import Department, Employee, Equipment, OperationDefinition, RouteOperation, TimesheetEntry


def month_from_text(value):
    text = str(value or date.today().strftime("%Y-%m"))
    try:
        return date.fromisoformat(text + "-01")
    except ValueError as exc:
        raise ValueError("Неверный месяц табеля") from exc


def _number(value, label):
    try:
        number = Decimal(str(value or 0).replace(",", ".").strip())
    except InvalidOperation as exc:
        raise ValueError(f"Неверное значение: {label}") from exc
    if not number.is_finite() or number < 0 or number > Decimal("999999.99"):
        raise ValueError(f"{label} должно быть от 0 до 999999,99")
    return number


def _text(value, label, limit):
    result = str(value).strip()
    if len(result) > limit:
        raise ValueError(f"{label}: слишком длинное значение")
    return result


def _grade(value):
    try:
        grade = int(value)
    except (ValueError, TypeError) as exc:
        raise ValueError("Разряд должен быть целым числом") from exc
    if grade < 1 or grade > 8:
        raise ValueError("Разряд должен быть от 1 до 8")
    return grade


def _employee_by_number(number):
    employee = Employee.objects.filter(personnel_number=number).first()
    if employee:
        return employee
    return Employee.objects.filter(pk=int(number), personnel_number__isnull=True).first() if number.isdecimal() else None


def save_operations(rows):
    codes = set()
    for row in rows:
        if len(row) < 8:
            raise ValueError("Заполните восемь столбцов операции")
        code = _text(row[0], "Код", 30)
        name = _text(row[1], "Операция", 200)
        kind = _text(row[2], "Вид работ", 100)
        if not code or not name or not kind or code in codes:
            raise ValueError("Код, название и вид операции обязательны; коды не должны повторяться")
        codes.add(code)
        equipment_name = _text(row[3], "Оборудование", 200)
        definition = OperationDefinition.objects.filter(code=code).first() or OperationDefinition(code=code)
        definition.name = name
        definition.kind = kind
        definition.equipment = Equipment.objects.filter(name=equipment_name, archived=False).first()
        definition.equipment_name = equipment_name
        definition.min_grade = _grade(row[4])
        definition.norm_unit = _text(row[5], "Единица нормирования", 40) or "нормо-час"
        definition.estd_code = _text(row[6], "Обозначение ЕСТД", 80)
        definition.active = str(row[7]).strip().casefold() in ("да", "yes", "true", "1")
        definition.full_clean()
        definition.save()
        if code.isdecimal():
            for route in RouteOperation.objects.filter(number=int(code)):
                if route.name.casefold().startswith(name.casefold()):
                    route.definition = definition
                    route.save(update_fields=["definition"])
        # Изменение справочника не должно оставлять прежнее утверждение маршрута.
        RouteOperation.objects.filter(definition=definition).exclude(name=name).update(name=name, approved=False)
    OperationDefinition.objects.exclude(code__in=codes).update(active=False)


def operations_rows(include_inactive=False):
    kind_labels = dict(RouteOperation.KINDS)
    definitions = OperationDefinition.objects.select_related("equipment")
    if not include_inactive:
        definitions = definitions.filter(active=True)
    return [[item.code, item.name, kind_labels.get(item.kind, item.kind),
             item.equipment.name if item.equipment else item.equipment_name,
             str(item.min_grade), item.norm_unit, item.estd_code, "Да" if item.active else "Нет"]
            for item in definitions.order_by("code")]


def save_personnel(rows):
    numbers = set()
    for row in rows:
        if len(row) < 8:
            raise ValueError("Заполните восемь столбцов сотрудника")
        number = _text(row[0], "Табельный номер", 30)
        name = _text(row[1], "ФИО", 200)
        department_name = _text(row[2], "Подразделение", 200)
        profession = _text(row[3], "Профессия", 100)
        if not all((number, name, department_name, profession)) or number in numbers:
            raise ValueError("Табельный номер, ФИО, подразделение и профессия обязательны; номера не должны повторяться")
        numbers.add(number)
        try:
            shift = int(row[5])
        except (ValueError, TypeError) as exc:
            raise ValueError("Смена должна быть целым числом") from exc
        if shift < 1 or shift > 4:
            raise ValueError("Смена должна быть от 1 до 4")
        try:
            hired_on = datetime.strptime(str(row[6]).strip(), "%d.%m.%Y").date() if str(row[6]).strip() else None
        except ValueError as exc:
            raise ValueError("Дата приема должна быть в формате ДД.ММ.ГГГГ") from exc
        department, _ = Department.objects.get_or_create(name=department_name)
        employee = _employee_by_number(number) or Employee(personnel_number=number)
        employee.personnel_number = number
        employee.name = name
        employee.department = department
        employee.profession = profession
        employee.grade = _grade(row[4])
        employee.shift = shift
        employee.hired_on = hired_on
        employee.personnel_status = _text(row[7], "Состояние", 60) or "Работает"
        employee.archived = False
        employee.full_clean()
        employee.save()
    Employee.objects.exclude(personnel_number__in=numbers).update(archived=True)


def personnel_rows():
    return [[item.personnel_number or str(item.pk).zfill(3), item.name, item.department.name,
             item.profession, str(item.grade), str(item.shift), item.hired_on.strftime("%d.%m.%Y") if item.hired_on else "",
             item.personnel_status]
            for item in Employee.objects.select_related("department").filter(archived=False).order_by("personnel_number", "pk")]


def save_timesheet(rows, month):
    employee_ids = set()
    for row in rows:
        if len(row) < 9:
            raise ValueError("Заполните столбцы табеля")
        number = str(row[0]).strip()
        employee = _employee_by_number(number)
        if not employee or employee.archived:
            raise ValueError(f"Сотрудник {number} не найден в справочнике персонала")
        if employee.pk in employee_ids:
            raise ValueError("Сотрудник повторяется в табеле за месяц")
        employee_ids.add(employee.pk)
        entry = TimesheetEntry.objects.filter(employee=employee, month=month).first() or TimesheetEntry(employee=employee, month=month)
        for field, value, label in zip(
            ("planned_hours", "actual_hours", "absent_hours", "overtime_hours", "output_hours"), row[4:9],
            ("План", "Факт", "Неявка", "Сверхурочно", "Выработка")):
            setattr(entry, field, _number(value, label))
        entry.full_clean()
        entry.save()
    TimesheetEntry.objects.filter(month=month).exclude(employee_id__in=employee_ids).delete()


def timesheet_rows(month):
    result = []
    for item in TimesheetEntry.objects.filter(month=month).select_related("employee").order_by("employee__personnel_number"):
        employee = item.employee
        result.append([employee.personnel_number or str(employee.pk).zfill(3), employee.name, employee.profession,
                       str(employee.grade), *[format(getattr(item, field).normalize(), "f") for field in
                       ("planned_hours", "actual_hours", "absent_hours", "overtime_hours", "output_hours")],
                       f"{item.output_ratio:.2f}".replace(".", ","), f"{item.load_ratio * 100:.1f}%".replace(".", ",")])
    return result
