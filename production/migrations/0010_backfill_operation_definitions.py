from django.db import migrations


def backfill(apps, schema_editor):
    db = schema_editor.connection.alias
    RouteOperation = apps.get_model("production", "RouteOperation")
    OperationDefinition = apps.get_model("production", "OperationDefinition")
    for route in RouteOperation.objects.using(db).select_related("equipment", "definition"):
        if route.definition_id:
            continue
        definition, _ = OperationDefinition.objects.using(db).get_or_create(code=f"R{route.pk:05}", defaults={
            "name": route.name, "kind": route.kind,
            "equipment": route.equipment, "equipment_name": route.equipment.name if route.equipment else "",
            "min_grade": 1, "estd_code": str(route.number).zfill(3),
        })
        route.definition = definition
        route.save(using=db, update_fields=["definition"])


class Migration(migrations.Migration):
    dependencies = [("production", "0009_cuttingnorm")]
    operations = [migrations.RunPython(backfill, migrations.RunPython.noop)]
