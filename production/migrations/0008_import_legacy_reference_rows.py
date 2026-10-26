from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from django.db import migrations


def import_saved_rows(apps, schema_editor):
    db = schema_editor.connection.alias
    LegacyTable = apps.get_model("production", "LegacyTable")
    Department = apps.get_model("production", "Department")
    Employee = apps.get_model("production", "Employee")
    Equipment = apps.get_model("production", "Equipment")
    OperationDefinition = apps.get_model("production", "OperationDefinition")
    TimesheetEntry = apps.get_model("production", "TimesheetEntry")
    RouteOperation = apps.get_model("production", "RouteOperation")

    saved = {table.key: table.rows for table in LegacyTable.objects.using(db).filter(
        key__in=("personnel", "operations", "timesheet"))}
    for row in saved.get("personnel", []):
        if len(row) < 8 or not row[0] or not row[1] or not row[2] or not row[3]:
            continue
        number = str(row[0]).strip()
        department, _ = Department.objects.using(db).get_or_create(name=str(row[2]).strip())
        employee = Employee.objects.using(db).filter(personnel_number=number).first()
        if not employee and number.isdecimal():
            employee = Employee.objects.using(db).filter(pk=int(number), personnel_number__isnull=True).first()
        if not employee:
            employee = Employee(personnel_number=number)
        try:
            employee.grade = int(row[4])
            employee.shift = int(row[5])
            employee.hired_on = datetime.strptime(str(row[6]), "%d.%m.%Y").date() if row[6] else None
        except (ValueError, TypeError):
            continue
        employee.personnel_number = number
        employee.name = str(row[1]).strip()
        employee.department = department
        employee.profession = str(row[3]).strip()
        employee.personnel_status = str(row[7]).strip() or "Работает"
        employee.archived = False
        employee.save(using=db)

    for row in saved.get("operations", []):
        if len(row) < 8 or not all(str(value).strip() for value in row[:3]):
            continue
        try:
            grade = int(row[4])
        except (ValueError, TypeError):
            continue
        code = str(row[0]).strip()
        equipment_name = str(row[3]).strip()
        equipment = Equipment.objects.using(db).filter(name=equipment_name).first()
        definition, _ = OperationDefinition.objects.using(db).update_or_create(code=code, defaults={
            "name": str(row[1]).strip(), "kind": str(row[2]).strip(),
            "equipment": equipment, "equipment_name": equipment_name,
            "min_grade": grade, "norm_unit": str(row[5]).strip() or "нормо-час",
            "estd_code": str(row[6]).strip(), "active": str(row[7]).strip().casefold() == "да",
        })
        if code.isdecimal():
            for route in RouteOperation.objects.using(db).filter(number=int(code), definition__isnull=True):
                if route.name.casefold().startswith(definition.name.casefold()):
                    route.definition = definition
                    route.save(using=db, update_fields=["definition"])

    month = date.today().replace(day=1)
    for row in saved.get("timesheet", []):
        if len(row) < 9:
            continue
        employee = Employee.objects.using(db).filter(personnel_number=str(row[0]).strip()).first()
        if not employee:
            continue
        try:
            hours = [Decimal(str(value or 0).replace(",", ".")) for value in row[4:9]]
        except InvalidOperation:
            continue
        TimesheetEntry.objects.using(db).update_or_create(employee=employee, month=month, defaults=dict(zip(
            ("planned_hours", "actual_hours", "absent_hours", "overtime_hours", "output_hours"), hours)))


class Migration(migrations.Migration):
    dependencies = [("production", "0007_employee_hired_on_employee_personnel_number_and_more")]
    operations = [migrations.RunPython(import_saved_rows, migrations.RunPython.noop)]
