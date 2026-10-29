import json
import io
import zipfile
import os
import time
import tempfile
import subprocess
import hashlib
from functools import lru_cache
from copy import copy
import psycopg
from decimal import Decimal, InvalidOperation
from datetime import date, datetime, timedelta
from pathlib import Path
from django.conf import settings
from django.contrib.auth.models import Group, User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import DatabaseError, IntegrityError, connection, transaction
from django.db.models.deletion import ProtectedError
from django.db.models import Sum
from django.http import Http404, HttpResponse, JsonResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.utils.html import escape
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods
from .models import AuditLog, Customer, Department, Downtime, Employee, Equipment, Job, LegacyTable, Material, NormingApproval, Order, OrderItem, Product, Program, ProgramLine, RouteOperation, WorkCenter
from . import legacy_tables
from .views import role, snapshot
from . import db_admin
from .export_security import spreadsheet_value
from openpyxl import Workbook


PAGES = {"index", "admin", "annual-plan", "cam", "entry", "form2", "help", "materials-1c", "materials", "operations", "orders", "personnel", "plan-a", "plan-b", "processes", "production", "products", "reports", "settings", "standards", "timesheet"}
PAGE_ROLES = {
    "admin": {"admin"},
    "annual-plan": {"admin", "manager", "planner"},
    "plan-a": {"admin", "manager", "planner"},
    "plan-b": {"admin", "manager", "planner"},
    "entry": {"admin", "technologist"},
    "materials": {"admin", "technologist"},
    "settings": {"admin", "technologist"},
    "cam": {"admin", "technologist"},
    "standards": {"admin", "normalizer", "economist"},
    "form2": {"admin", "manager", "planner", "supervisor", "normalizer", "economist"},
    "production": {"admin", "manager", "planner", "supervisor"},
    "reports": {"admin", "manager", "planner", "supervisor", "normalizer", "economist"},
    "processes": {"admin", "manager", "planner", "supervisor", "technologist"},
    "personnel": {"admin", "manager", "planner", "supervisor"},
    "operations": {"admin", "technologist"},
    "timesheet": {"admin", "manager", "planner", "supervisor", "normalizer", "economist"},
    "materials-1c": {"admin", "technologist"},
}
TABLES = {"operations", "personnel", "timesheet", "materials1c", "settings-groups", "settings-staff", "settings-periods", "settings-columns", "settings-plan-inputs"}
TABLE_ROLES = {
    "operations": {"admin", "technologist"},
    "personnel": {"admin", "manager", "supervisor"},
    "timesheet": {"admin", "manager", "planner", "supervisor", "normalizer", "economist"},
    "materials1c": {"admin", "technologist"},
    "settings-groups": {"admin", "technologist"},
    "settings-staff": {"admin"},
    "settings-periods": {"admin"},
    "settings-columns": {"admin", "technologist"},
    "settings-plan-inputs": {"admin"},
}
ADMIN_ROLES = {"admin", "manager", "technologist", "normalizer", "planner", "supervisor", "economist"}


def require_admin(request):
    if role(request.user) != "admin" and not request.user.is_superuser:
        raise PermissionDenied


def require_page_access(request, page_name):
    if not request.user.is_superuser and role(request.user) not in PAGE_ROLES[page_name]:
        raise PermissionDenied


@login_required
@require_http_methods(["GET"])
def database_status(request):
    require_admin(request)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT current_database(), current_user, inet_server_port(), 1")
            database, username, port, check = cursor.fetchone()
        return JsonResponse({"ok": check == 1, "host": connection.settings_dict["HOST"],
            "port": port or connection.settings_dict["PORT"], "database": database,
            "username": username, "engine": "PostgreSQL"})
    except DatabaseError:
        return JsonResponse({"ok": False, "error": "Нет подключения к PostgreSQL"}, status=503)


@login_required
@require_http_methods(["POST"])
def database_config(request):
    require_admin(request)
    try:
        candidate = db_admin.checked_config(json.loads(request.body))
        changed = candidate != db_admin.active_config()
        if changed:
            db_admin.save_config(candidate)
            AuditLog.objects.create(user=request.user, model_name="DatabaseConfig", object_id=0,
                action="update", reason=f"Подключение к {candidate['host']}:{candidate['port']}/{candidate['database']}")
        heartbeat = db_admin.RUNTIME_DIR / "supervisor.json"
        try:
            supervised = time.time() - json.loads(heartbeat.read_text(encoding="utf-8")).get("time", 0) <= 5
        except (OSError, ValueError):
            supervised = False
        return JsonResponse({"ok": True, "restart": changed,
            "message": ("Параметры сохранены; рабочий процесс переподключается" if supervised else
                "Параметры сохранены; перезапустите сервер") if changed else "Подключение проверено"})
    except (ValueError, TypeError, OSError, psycopg.Error) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


@login_required
@require_http_methods(["POST"])
def backup_export(request):
    require_admin(request)
    db_admin.RUNTIME_DIR.mkdir(exist_ok=True)
    extension = "dump" if request.GET.get("format") == "dump" else "sql"
    name = db_admin.backup_name(extension=extension)
    path = db_admin.RUNTIME_DIR / name
    try:
        db_admin.dump_database(path)
    except (OSError, RuntimeError, subprocess.SubprocessError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=500)
    AuditLog.objects.create(user=request.user, model_name="DatabaseBackup", object_id=0,
        action="export", reason=name)

    def stream():
        try:
            with path.open("rb") as file:
                while chunk := file.read(1024 * 1024):
                    yield chunk
        finally:
            path.unlink(missing_ok=True)

    response = StreamingHttpResponse(stream(), content_type="application/sql" if extension == "sql" else "application/octet-stream")
    response["Content-Disposition"] = f'attachment; filename="{name}"'
    response["Content-Length"] = str(path.stat().st_size)
    response["Cache-Control"] = "no-store"
    return response


@login_required
@require_http_methods(["GET", "POST"])
def backups_api(request):
    require_admin(request)
    db_admin.BACKUP_DIR.mkdir(exist_ok=True)
    if request.method == "POST":
        name = db_admin.backup_name()
        path = db_admin.BACKUP_DIR / name
        try:
            db_admin.dump_database(path)
        except (OSError, RuntimeError, subprocess.SubprocessError) as exc:
            return JsonResponse({"ok": False, "error": str(exc)}, status=500)
        AuditLog.objects.create(user=request.user, model_name="DatabaseBackup", object_id=0,
            action="create", reason=name)
    items = []
    for item in db_admin.BACKUP_DIR.iterdir():
        try:
            db_admin.safe_backup_path(item.name)
        except ValueError:
            continue
        if item.is_file():
            items.append(item)
    items.sort(key=lambda item: item.stat().st_mtime, reverse=True)
    items = items[:50]
    return JsonResponse({"backups": [{"name": item.name, "bytes": item.stat().st_size,
        "created": datetime.fromtimestamp(item.stat().st_mtime).isoformat(timespec="seconds")}
        for item in items]})


@login_required
@require_http_methods(["GET", "DELETE"])
def backup_download(request, name):
    require_admin(request)
    try:
        path = db_admin.safe_backup_path(name)
    except ValueError:
        raise Http404
    if not path.is_file():
        raise Http404
    if request.method == "DELETE":
        try:
            path.unlink()
        except OSError as exc:
            return JsonResponse({"ok": False, "error": str(exc)}, status=500)
        AuditLog.objects.create(user=request.user, model_name="DatabaseBackup", object_id=0,
            action="delete", reason=name)
        return JsonResponse({"ok": True})
    from django.http import FileResponse
    response = FileResponse(path.open("rb"), as_attachment=True, filename=name)
    if path.suffix == ".sql":
        response["Content-Type"] = "application/sql"
    response["Cache-Control"] = "no-store"
    return response


@login_required
@require_http_methods(["GET", "POST"])
def backup_restore(request):
    require_admin(request)
    db_admin.RUNTIME_DIR.mkdir(exist_ok=True)
    status_path = db_admin.RUNTIME_DIR / "restore-status.json"
    if request.method == "GET":
        status = json.loads(status_path.read_text(encoding="utf-8")) if status_path.exists() else {"state": "idle"}
        return JsonResponse(status)
    upload = request.FILES.get("file")
    if not upload or upload.size > db_admin.MAX_RESTORE_BYTES:
        return JsonResponse({"ok": False, "error": "Выберите файл .dump размером до 50 МБ"}, status=400)
    heartbeat = db_admin.RUNTIME_DIR / "supervisor.json"
    try:
        supervisor = json.loads(heartbeat.read_text(encoding="utf-8"))
        last_seen = supervisor.get("time", 0)
        matching_database = supervisor.get("database") == connection.settings_dict["NAME"]
    except (OSError, ValueError):
        last_seen = 0
        matching_database = False
    if time.time() - last_seen > 5 or not matching_database:
        return JsonResponse({"ok": False, "error": "Восстановление доступно только при запущенной службе приложения"}, status=503)
    pending = db_admin.RUNTIME_DIR / "restore-request.json"
    if pending.exists():
        return JsonResponse({"ok": False, "error": "Восстановление уже выполняется"}, status=409)
    name = f"restore-{os.urandom(8).hex()}.dump"
    path = db_admin.RUNTIME_DIR / name
    try:
        with path.open("wb") as file:
            for chunk in upload.chunks():
                file.write(chunk)
        db_admin.validate_dump(path)
        status_path.write_text(json.dumps({"state": "queued", "message": "Ожидает остановки приложения"}, ensure_ascii=False), encoding="utf-8")
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=db_admin.RUNTIME_DIR,
                                         prefix="restore-request-", delete=False) as file:
            temporary = Path(file.name)
            json.dump({"file": name}, file)
            file.flush()
            os.fsync(file.fileno())
        AuditLog.objects.create(user=request.user, model_name="DatabaseBackup", object_id=0,
            action="import", reason=name)
        os.replace(temporary, pending)
        return JsonResponse({"ok": True, "message": "Файл принят; приложение перезапустится после восстановления"}, status=202)
    except (ValueError, OSError, subprocess.SubprocessError) as exc:
        path.unlink(missing_ok=True)
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


def display_user_name(user):
    # В старой тестовой фикстуре текст был утрачен и заменён вопросительными знаками.
    if user.first_name == "???????-????????" and user.username.startswith("technologist_"):
        return f"Инженер-технолог {user.username.removeprefix('technologist_')}"
    return user.get_full_name() or user.username


def user_payload(user):
    profile = getattr(user, "profile", None)
    return {"id": user.pk, "username": user.username,
        "fullName": display_user_name(user),
        "role": "admin" if user.is_superuser else (user.groups.first().name if user.groups.exists() else "unassigned"),
        "isActive": user.is_active, "canChangeUsername": bool(profile and profile.can_change_username),
        "canChangePassword": bool(profile and profile.can_change_password)}


@login_required
@require_http_methods(["GET", "PUT"])
def policy_api(request):
    from .models import SitePolicy
    require_admin(request)
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            fields = {"maintenance": "maintenance", "allowUsernameChanges": "allow_username_changes", "allowPasswordChanges": "allow_password_changes"}
            if not isinstance(data, dict) or not data or any(key not in fields or not isinstance(value, bool) for key, value in data.items()):
                raise ValueError("Неверные параметры безопасности")
            with transaction.atomic():
                policy, _ = SitePolicy.objects.select_for_update().get_or_create(pk=1)
                for key, value in data.items():
                    setattr(policy, fields[key], value)
                if "maintenance" in data:
                    policy.maintenance_owner = request.user if data["maintenance"] else None
                policy.save()
                AuditLog.objects.create(user=request.user, model_name="SitePolicy", object_id=1, action="update", reason="Настройки безопасности")
        except (ValueError, TypeError) as exc:
            return JsonResponse({"ok": False, "error": str(exc)}, status=400)
    else:
        policy = SitePolicy.objects.filter(pk=1).first()
    return JsonResponse({"maintenance": bool(policy and policy.maintenance),
        "allowUsernameChanges": bool(policy and policy.allow_username_changes),
        "allowPasswordChanges": bool(policy and policy.allow_password_changes)})


@login_required
@require_http_methods(["GET", "POST"])
def profile_api(request):
    from .models import UserProfile, SitePolicy
    from django.contrib.auth import update_session_auth_hash
    from PIL import Image, ImageOps, UnidentifiedImageError
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    user = request.user
    policy = SitePolicy.objects.filter(pk=1).first()
    allow_name = bool(policy and policy.allow_username_changes)
    allow_password = bool(policy and policy.allow_password_changes)
    if request.method == "POST":
        try:
            username = request.POST.get("username", user.username).strip()
            email = request.POST.get("email", "").strip()
            password = request.POST.get("new_password", "")
            name_changed = username != user.username
            if name_changed and not allow_name or password and not allow_password:
                raise PermissionDenied
            if (name_changed or password) and not user.check_password(request.POST.get("current_password", "")):
                raise ValueError("Укажите действующий пароль")
            user.username, user.email = username, email
            user.full_clean(exclude=["password"])
            if password:
                validate_password(password, user)
            avatar = request.FILES.get("avatar")
            image_bytes = None
            if avatar:
                if avatar.size > 2 * 1024 * 1024:
                    raise ValueError("Фотография должна быть не больше 2 МБ")
                with Image.open(avatar) as image:
                    if image.format not in ("PNG", "JPEG", "WEBP") or image.width * image.height > 4_000_000:
                        raise ValueError("Допустимы изображения PNG, JPEG или WebP до 4 мегапикселей")
                    image = ImageOps.exif_transpose(image)
                    image.thumbnail((256, 256))
                    output = io.BytesIO()
                    image.convert("RGBA").save(output, format="PNG")
                    image_bytes = output.getvalue()
            with transaction.atomic():
                if password:
                    user.set_password(password)
                user.save()
                if image_bytes is not None:
                    profile.avatar = image_bytes
                    profile.save(update_fields=["avatar"])
                AuditLog.objects.create(user=user, model_name="User", object_id=user.pk, action="update", reason="Изменение профиля")
            if password:
                update_session_auth_hash(request, user)
        except (ValueError, ValidationError, IntegrityError, OSError, UnidentifiedImageError, Image.DecompressionBombError) as exc:
            return JsonResponse({"ok": False, "error": str(exc)}, status=400)
    return JsonResponse({"username": user.username, "email": user.email, "fullName": user.get_full_name() or user.username,
        "canChangeUsername": allow_name, "canChangePassword": allow_password, "hasAvatar": bool(profile.avatar)})


@login_required
@require_http_methods(["GET"])
def profile_avatar(request):
    from .models import UserProfile
    avatar = UserProfile.objects.filter(user=request.user).values_list("avatar", flat=True).first()
    if not avatar:
        raise Http404
    response = HttpResponse(bytes(avatar), content_type="image/png")
    response["X-Content-Type-Options"] = "nosniff"
    return response


@login_required
@require_http_methods(["GET", "POST"])
def users_api(request):
    require_admin(request)
    if request.method == "GET":
        return JsonResponse({"users": [user_payload(user) for user in User.objects.prefetch_related("groups").order_by("username")]})
    return save_user_api(request)


@login_required
@require_http_methods(["PUT", "DELETE"])
def user_api(request, pk):
    require_admin(request)
    user = get_object_or_404(User, pk=pk)
    if request.method == "DELETE":
        if user.pk == request.user.pk or user.is_superuser:
            return JsonResponse({"ok": False, "error": "Нельзя удалить свою учётную запись или суперпользователя"}, status=400)
        user.is_active = False
        user.save(update_fields=["is_active"])
        AuditLog.objects.create(user=request.user, model_name="User", object_id=user.pk, action="archive")
        return JsonResponse({"ok": True})
    return save_user_api(request, user)


def save_user_api(request, user=None):
    try:
        data = json.loads(request.body)
        username = str(data.get("username", "")).strip()
        full_name = str(data.get("fullName", "")).strip()
        password = str(data.get("password", ""))
        new_role = str(data.get("role", ""))
        if not username or not full_name or new_role not in ADMIN_ROLES:
            raise ValueError("Укажите логин, ФИО и роль")
        if user is None and not password:
            raise ValueError("Для нового пользователя нужен пароль")
        if user and not user.has_usable_password() and not password and data.get("isActive", user.is_active):
            raise ValueError("Для активации учётной записи задайте индивидуальный пароль")
        if User.objects.filter(username=username).exclude(pk=user.pk if user else None).exists():
            raise ValueError("Такой логин уже существует")
        if user and user.is_superuser and new_role != "admin":
            raise ValueError("Роль суперпользователя нельзя изменить")
        with transaction.atomic():
            creating = user is None
            user = user or User()
            user.username = username
            parts = full_name.split(" ", 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ""
            requested_active = data.get("isActive", user.is_active if not creating else True)
            if not isinstance(requested_active, bool):
                raise ValueError("Неверное состояние учётной записи")
            if not requested_active and (user.pk == request.user.pk or user.is_superuser):
                raise ValueError("Нельзя отключить свою учётную запись или суперпользователя")
            user.is_active = requested_active
            if password:
                validate_password(password, user)
                user.set_password(password)
            user.full_clean(exclude=["password"])
            user.save()
            from .models import UserProfile
            profile, _ = UserProfile.objects.get_or_create(user=user)
            for key, field in (("canChangeUsername", "can_change_username"), ("canChangePassword", "can_change_password")):
                if key in data:
                    if not isinstance(data[key], bool):
                        raise ValueError("Неверное значение разрешения")
                    setattr(profile, field, data[key])
            profile.save()
            group, _ = Group.objects.get_or_create(name=new_role)
            user.groups.set([group])
            AuditLog.objects.create(user=request.user, model_name="User", object_id=user.pk,
                action="create" if creating else "update")
        return JsonResponse({"ok": True, "user": user_payload(user)})
    except (ValueError, TypeError, ValidationError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


def plan_parameters(data):
    kind = str(data.get("kind", ""))
    year = int(data.get("year") or date.today().year)
    quarter = int(data.get("quarter") or 0)
    if kind not in ("annual", "a", "b") or year < 2000 or year > 2100:
        raise ValueError("Неверный период плана")
    if kind != "annual" and quarter not in (1, 2, 3, 4):
        raise ValueError("Укажите квартал от 1 до 4")
    if kind == "annual":
        quarter = 0
    name = {"annual": f"Годовой план {year}", "a": f"План А {year}/{quarter}", "b": f"План Б {year}/{quarter}"}[kind]
    return kind, year, quarter, name


@login_required
@require_http_methods(["GET", "POST"])
def plans_api(request):
    if role(request.user) not in ("admin", "manager", "planner", "supervisor") and not request.user.is_superuser:
        raise PermissionDenied
    try:
        data = request.GET if request.method == "GET" else json.loads(request.body)
        kind, year, quarter, name = plan_parameters(data)
        items = OrderItem.objects.filter(order__archived=False, order__due_date__year=year).select_related(
            "order", "order__customer", "product", "equipment", "order__department")
        if quarter:
            start_month = (quarter - 1) * 3 + 1
            items = items.filter(order__due_date__month__gte=start_month, order__due_date__month__lte=start_month + 2)
        items = list(items)
        program = Program.objects.filter(name=name).order_by("-version").first()
        if request.method == "GET":
            planned = set(ProgramLine.objects.filter(program=program).values_list("order_item_id", flat=True)) if program else set()
            rows = []
            for item in items:
                routes = list(item.product.route.filter(approved=True).select_related("work_center"))
                hours = sum((route.batch_hours(item.quantity) for route in routes), Decimal("0"))
                categories = [Decimal("0") for _ in range(8)]
                for route in routes:
                    name = f"{route.name} {route.work_center.name}".lower()
                    category = next((index for token, index in (
                        ("карус", 6), ("токар", 5), ("кузне", 4), ("газорез", 3),
                        ("модель", 2), ("пресс", 1), ("заготов", 0),
                    ) if token in name), 7)
                    actual = Job.objects.filter(program_line__order_item=item, operation=route).aggregate(
                        value=Sum("actual_hours"))["value"] or Decimal("0")
                    categories[category] += max(route.batch_hours(item.quantity) - actual, Decimal("0"))
                rows.append({"id": item.pk, "number": item.order.number, "customer": item.order.customer.name,
                    "product": item.product.name, "drawing": item.product.drawing, "quantity": item.quantity,
                    "priority": item.order.priority, "request": item.order.request_number,
                    "start_date": item.order.start_date.isoformat(), "due_date": item.order.due_date.isoformat(),
                    "progress": item.order.progress, "hours": str(hours),
                    "remaining_by_category": [str(value) for value in categories], "planned": item.pk in planned})
            audit = AuditLog.objects.filter(model_name="Program", object_id=program.pk, action="approve").select_related("user").first() if program else None
            return JsonResponse({"items": rows, "program": {"id": program.pk, "status": program.status,
                "approved_by": display_user_name(audit.user) if audit and audit.user else None,
                "approved_at": audit.created_at.isoformat() if audit else None} if program else None})
        if not items:
            raise ValueError("Нет заказов для выбранного периода")
        with transaction.atomic():
            program = Program.objects.select_for_update().filter(name=name).order_by("-version").first()
            expected = {}
            for item in items:
                center = item.equipment.work_center if item.equipment_id else (
                    WorkCenter.objects.filter(department=item.order.department, archived=False).first()
                    or WorkCenter.objects.filter(archived=False).first())
                if not center:
                    raise ValueError("Сначала добавьте рабочий центр")
                expected[item.pk] = (center.pk, item.quantity, item.order.due_date)
            if program and program.status in ("approved", "revised"):
                actual = {line.order_item_id: (line.work_center_id, line.quantity, line.due_date)
                    for line in program.lines.all()}
                if actual != expected:
                    raise ValueError("Заказы изменились после утверждения плана. Создайте новую редакцию программы.")
                return JsonResponse({"ok": True, "id": program.pk, "lines": len(actual), "name": name})
            if program and program.status == "closed":
                raise ValueError("Программа закрыта. Создайте новую редакцию.")
            if not program:
                program = Program.objects.create(name=name, version=1, year=year, quarter=quarter, status="draft")
            program.lines.exclude(order_item_id__in=expected).delete()
            for item in items:
                center_id, quantity, due_date = expected[item.pk]
                line, _ = ProgramLine.objects.update_or_create(program=program, order_item=item,
                    defaults={"work_center_id": center_id, "quantity": quantity, "due_date": due_date})
                line.full_clean()
                if item.order.status == "draft":
                    item.order.status = "planned"
                    item.order.save(update_fields=["status"])
            program.status = "approved"
            program.save(update_fields=["status"])
            AuditLog.objects.create(user=request.user, model_name="Program", object_id=program.pk,
                action="approve", reason="Утверждение в интерфейсе tpp")
        return JsonResponse({"ok": True, "id": program.pk, "lines": program.lines.count(), "name": name})
    except (ValueError, TypeError, ValidationError, IntegrityError, ProtectedError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


@login_required
@require_http_methods(["GET", "POST"])
def norming_api(request):
    require_page_access(request, "standards")
    if request.method == "POST" and role(request.user) not in ("admin", "normalizer") and not request.user.is_superuser:
        raise PermissionDenied
    try:
        data = request.GET if request.method == "GET" else json.loads(request.body)
        year, quarter = int(data.get("year", 0)), int(data.get("quarter", 0))
        if not 2000 <= year <= 2100 or quarter not in (1, 2, 3, 4):
            raise ValueError("Укажите год и квартал нормирования")
        start_month = (quarter - 1) * 3 + 1
        items = list(OrderItem.objects.filter(order__archived=False, order__due_date__year=year,
            order__due_date__month__gte=start_month, order__due_date__month__lte=start_month + 2)
            .select_related("order", "product"))
        drawing_count = sum(item.drawing_count for item in items)
        base_hours = sum((route.batch_hours(item.quantity) for item in items
            for route in item.product.route.filter(approved=True)), Decimal("0"))
        actual_hours = Job.objects.filter(program_line__order_item__in=items).aggregate(
            total=Sum("actual_hours"))["total"] or Decimal("0")
        approval = NormingApproval.objects.filter(year=year, quarter=quarter).select_related("approved_by").first()
        if request.method == "POST":
            if not items:
                raise ValueError("В выбранном периоде нет изделий для утверждения")
            hours = Decimal(str(data.get("hours_per_employee", "0")))
            factor = Decimal(str(data.get("labor_factor", "0")))
            staff = int(data.get("staff_count", 0))
            if hours <= 0 or hours > 10000 or factor <= 0 or factor > 100 or not 1 <= staff <= 10000:
                raise ValueError("Часы, коэффициент и численность должны быть положительными")
            planned = (base_hours * factor).quantize(Decimal("0.01"))
            capacity = (hours * staff).quantize(Decimal("0.01"))
            with transaction.atomic():
                approval, created = NormingApproval.objects.update_or_create(year=year, quarter=quarter, defaults={
                    "drawing_count": drawing_count, "hours_per_employee": hours,
                    "labor_factor": factor, "staff_count": staff,
                    "planned_hours": planned, "actual_hours": actual_hours,
                    "capacity_hours": capacity, "approved_by": request.user,
                })
                AuditLog.objects.create(user=request.user, model_name="NormingApproval", object_id=approval.pk,
                    action="create" if created else "update", reason=f"Утверждение нормирования {year}/{quarter}")
        result = {"year": year, "quarter": quarter, "items": len(items),
            "item_ids": [item.pk for item in items], "drawing_count": drawing_count,
            "base_hours": str(base_hours.quantize(Decimal("0.01"))),
            "actual_hours": str(actual_hours.quantize(Decimal("0.01"))),
            "approval": None}
        if approval:
            result["approval"] = {"drawing_count": approval.drawing_count,
                "planned_hours": str(approval.planned_hours),
                "actual_hours": str(approval.actual_hours), "capacity_hours": str(approval.capacity_hours),
                "hours_per_employee": str(approval.hours_per_employee),
                "labor_factor": str(approval.labor_factor), "staff_count": approval.staff_count,
                "approved_by": approval.approved_by.username, "approved_at": approval.approved_at.isoformat()}
        return JsonResponse(result)
    except (ValueError, TypeError, InvalidOperation, OverflowError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


REPORT_KINDS = {"plan-a", "plan-b", "standards", "balance", "production"}
REPORT_HEADERS = {
    "plan-a": ["Заказ", "Объект", "Токарные", "Фрезерные", "Строгальные", "Расточные",
        "Слесарные", "Сварочные", "Шлифовка", "Плановая трудоёмкость", "Отклонения",
        "Фактически выполнено", "Остаток по заказу"],
    "plan-b": ["Заказ", "Изделие", "Количество", "Рабочий центр", "План, ч", "Факт, ч", "Остаток, ч", "Срок"],
    "standards": ["Заказ", "Изделие", "Операция", "Тпз, ч", "Штучное, ч", "Норма партии, ч", "Факт, ч", "Отклонение, ч"],
    "balance": ["Заказ", "Изделие", "План Б, шт.", "Принято, шт.", "Остаток, шт.", "Срок"],
    "production": ["Заказ", "Объект", "Изделие", "Заказано, шт.", "Принято, шт.", "Осталось, шт.", "Готовность, %", "Состояние"],
}


def report_filters(request):
    values = {key: request.GET.get(key, "").strip() for key in ("order", "product", "department", "from", "to")}
    for key in ("from", "to"):
        if values[key]:
            values[key] = date.fromisoformat(values[key])
    if values["from"] and values["to"] and values["from"] > values["to"]:
        raise ValueError("Начало периода позже окончания")
    return values


def filter_report_queryset(queryset, filters, order_path, product_path):
    if filters.get("order"):
        queryset = queryset.filter(**{f"{order_path}number__icontains": filters["order"]})
    if filters.get("product"):
        queryset = queryset.filter(**{f"{product_path}name__icontains": filters["product"]})
    if filters.get("department"):
        queryset = queryset.filter(**{f"{order_path}department__name__icontains": filters["department"]})
    if filters.get("from"):
        queryset = queryset.filter(**{f"{order_path}due_date__gte": filters["from"]})
    if filters.get("to"):
        queryset = queryset.filter(**{f"{order_path}due_date__lte": filters["to"]})
    return queryset.distinct()


def report_rows(kind="plan-a", filters=None):
    filters = filters or {}
    if kind in ("plan-b", "balance"):
        rows = []
        lines = ProgramLine.objects.filter(program__name__startswith="План Б ", program__status__in=["approved", "revised"],
            order_item__order__archived=False).select_related("order_item__order", "order_item__product", "work_center")
        lines = filter_report_queryset(lines, filters, "order_item__order__", "order_item__product__")
        for line in lines:
            item = line.order_item
            accepted = item.order.events.filter(kind="accepted", job__program_line__order_item=item).aggregate(v=Sum("quantity"))["v"] or 0
            if kind == "balance":
                rows.append([item.order.number, item.product.name, line.quantity, accepted,
                    max(line.quantity - accepted, 0), line.due_date.isoformat()])
            else:
                planned = line.planned_hours
                actual = Job.objects.filter(program_line=line).aggregate(v=Sum("actual_hours"))["v"] or Decimal("0")
                rows.append([item.order.number, item.product.name, line.quantity, line.work_center.name,
                    float(planned), float(actual), float(max(planned - actual, Decimal("0"))), line.due_date.isoformat()])
        return rows
    if kind == "standards":
        rows = []
        items = filter_report_queryset(OrderItem.objects.filter(order__archived=False)
            .select_related("order", "product"), filters, "order__", "product__")
        for item in items:
            for route in item.product.route.filter(approved=True):
                planned = route.batch_hours(item.quantity)
                actual = Job.objects.filter(program_line__order_item=item, operation=route).aggregate(v=Sum("actual_hours"))["v"] or Decimal("0")
                rows.append([item.order.number, item.product.name, route.name, float(route.setup_hours),
                    float(route.piece_hours), float(planned), float(actual), float(actual - planned)])
        return rows
    if kind == "production":
        rows = []
        items = filter_report_queryset(OrderItem.objects.filter(order__archived=False)
            .select_related("order", "order__customer", "product"), filters, "order__", "product__")
        for item in items:
            accepted = item.order.events.filter(kind="accepted", job__program_line__order_item=item).aggregate(v=Sum("quantity"))["v"] or 0
            rows.append([item.order.number, item.order.customer.name, item.product.name, item.quantity,
                accepted, max(item.quantity - accepted, 0), round(100 * accepted / item.quantity) if item.quantity else 0,
                item.order.get_status_display()])
        return rows
    rows = []
    orders = filter_report_queryset(Order.objects.filter(archived=False).select_related("customer"),
        filters, "", "items__product__")
    for order in orders:
        categories = [Decimal("0") for _ in range(7)]
        planned = Decimal("0")
        order_items = order.items.select_related("product")
        if filters.get("product"):
            order_items = order_items.filter(product__name__icontains=filters["product"])
        for item in order_items:
            for route in item.product.route.filter(approved=True):
                hours = route.batch_hours(item.quantity)
                planned += hours
                name = route.name.lower()
                index = next((index for word, index in [("токар", 0), ("фрезер", 1), ("строг", 2),
                    ("расточ", 3), ("слесар", 4), ("свар", 5), ("шлиф", 6)] if word in name), None)
                if index is not None:
                    categories[index] += hours
        actual = Job.objects.filter(program_line__order_item__order=order).aggregate(v=Sum("actual_hours"))["v"] or Decimal("0")
        deviations = Downtime.objects.filter(job__program_line__order_item__order=order).aggregate(v=Sum("hours"))["v"] or Decimal("0")
        rows.append([order.number, order.customer.name, *[float(value) for value in categories],
            float(planned), float(deviations), float(actual), float(max(planned - actual, Decimal("0")))])
    return rows


@login_required
@require_http_methods(["GET"])
def report_api(request):
    require_page_access(request, "reports")
    kind = request.GET.get("kind", "plan-a")
    if kind not in REPORT_KINDS:
        raise Http404
    try:
        rows = report_rows(kind, report_filters(request))
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)
    return JsonResponse({"headers": REPORT_HEADERS[kind], "rows": rows, "kind": kind})


def report_workbook(rows, kind):
    book = Workbook()
    sheet = book.active
    sheet.title = kind
    sheet.append(REPORT_HEADERS[kind])
    for row in rows:
        sheet.append([spreadsheet_value(value) for value in row])
    sheet.freeze_panes = "C2"
    sheet.auto_filter.ref = sheet.dimensions
    output = io.BytesIO()
    book.save(output)
    return output.getvalue()


@login_required
@require_http_methods(["GET"])
def report_export_api(request):
    require_page_access(request, "reports")
    kind = request.GET.get("kind", "plan-a")
    if kind != "all" and kind not in REPORT_KINDS:
        raise Http404
    try:
        filters = report_filters(request)
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)
    if kind == "all":
        output = io.BytesIO()
        with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
            for item in sorted(REPORT_KINDS):
                archive.writestr(f"report-{item}.xlsx", report_workbook(report_rows(item, filters), item))
        response = HttpResponse(output.getvalue(), content_type="application/zip")
        response["Content-Disposition"] = 'attachment; filename="reports.zip"'
    else:
        response = HttpResponse(report_workbook(report_rows(kind, filters), kind),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = f'attachment; filename="report-{kind}.xlsx"'
    AuditLog.objects.create(user=request.user, model_name="Report", object_id=0, action="export", reason=kind)
    return response


@login_required
@require_http_methods(["GET"])
def materials_api(request):
    require_page_access(request, "materials")
    return JsonResponse({"materials": [{"code": item.code, "name": item.name,
        "unit": item.unit, "stock": str(item.stock_quantity),
        "available": str(item.available_quantity)}
        for item in Material.objects.filter(archived=False).order_by("name")]})


@login_required
@require_http_methods(["GET"])
def dashboard_api(request):
    orders = Order.objects.filter(archived=False)
    quantity = OrderItem.objects.filter(order__archived=False).aggregate(v=Sum("quantity"))["v"] or 0
    accepted = sum(order.accepted_quantity for order in orders)
    groups = User.objects.filter(is_active=True)
    return JsonResponse({"orders": orders.count(), "quantity": quantity,
        "readiness": min(round(100 * accepted / quantity), 100) if quantity else 0,
        "workplaces": WorkCenter.objects.filter(archived=False).count(),
        "technologists": groups.filter(groups__name="technologist").distinct().count(),
        "normalizers": groups.filter(groups__name="normalizer").distinct().count(),
        "managers": groups.filter(groups__name="manager").distinct().count()})


@login_required
@require_http_methods(["GET", "POST"])
def processes_api(request):
    require_page_access(request, "processes")
    if request.method == "POST":
        return save_process_api(request)
    rows = [{"id": route.pk, "code": f"ТП-{route.product_id}-{route.number:03}",
        "product": route.product.name, "kind": route.get_kind_display(),
        "version": "v1", "status": "Утверждён" if route.approved else "Черновик",
        "date": "", "approved": route.approved, "product_id": route.product_id,
        "work_center_id": route.work_center_id, "number": route.number, "name": route.name,
        "kind_code": route.kind, "setup_hours": str(route.setup_hours),
        "piece_hours": str(route.piece_hours), "quality_required": route.quality_required,
        "shop_code": route.shop_code, "section_code": route.section_code,
        "workplace_code": route.workplace_code, "document_refs": route.document_refs,
        "operation_text": route.operation_text, "tooling": route.tooling,
        "profession_code": route.profession_code, "worker_count": route.worker_count,
        "simultaneous_quantity": route.simultaneous_quantity}
        for route in RouteOperation.objects.select_related("product").order_by("product__name", "number")]
    return JsonResponse({"processes": rows,
        "products": list(Product.objects.filter(archived=False).order_by("name").values("id", "name")),
        "centers": list(WorkCenter.objects.filter(archived=False).order_by("name").values("id", "name")),
        "kinds": [{"value": value, "label": label} for value, label in RouteOperation.KINDS]})


@login_required
@require_http_methods(["PUT", "DELETE"])
def process_api(request, pk):
    if role(request.user) not in ("admin", "technologist", "manager") and not request.user.is_superuser:
        raise PermissionDenied
    route = get_object_or_404(RouteOperation, pk=pk)
    if request.method == "PUT" and not request.body and role(request.user) not in ("admin", "manager") and not request.user.is_superuser:
        raise PermissionDenied
    if request.method == "DELETE" and route.approved and role(request.user) not in ("admin", "manager") and not request.user.is_superuser:
        raise PermissionDenied
    if request.method == "PUT" and request.body:
        return save_process_api(request, route)
    try:
        with transaction.atomic():
            if request.method == "PUT":
                route.approved = True
                route.full_clean()
                route.save(update_fields=["approved"])
                action = "approve"
            else:
                route.delete()
                action = "delete"
            AuditLog.objects.create(user=request.user, model_name="RouteOperation", object_id=pk,
                action=action, reason="Действие в интерфейсе tpp")
        return JsonResponse({"ok": True})
    except ProtectedError:
        return JsonResponse({"ok": False, "error": "Операция связана с производственным заданием и не может быть удалена"}, status=409)
    except ValidationError as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


def save_process_api(request, route=None):
    if role(request.user) not in ("admin", "technologist", "manager") and not request.user.is_superuser:
        raise PermissionDenied
    try:
        data = json.loads(request.body)
        with transaction.atomic():
            creating = route is None
            route = route or RouteOperation()
            product_id = int(data.get("product_id"))
            if route.pk and route.job_set.exists() and route.product_id != product_id:
                raise ValueError("Нельзя менять изделие операции, связанной с производственным заданием")
            route.product = get_object_or_404(Product, pk=product_id, archived=False)
            route.work_center = get_object_or_404(WorkCenter, pk=int(data.get("work_center_id")), archived=False)
            route.number = int(data.get("number"))
            route.name = str(data.get("name", "")).strip()
            route.kind = str(data.get("kind", ""))
            route.setup_hours = Decimal(str(data.get("setup_hours", "0")).replace(",", "."))
            route.piece_hours = Decimal(str(data.get("piece_hours", "0")).replace(",", "."))
            route.quality_required = bool(data.get("quality_required", False))
            for field in ("shop_code", "section_code", "workplace_code", "document_refs",
                          "operation_text", "tooling", "profession_code"):
                setattr(route, field, str(data.get(field, getattr(route, field, ""))).strip())
            route.worker_count = int(data.get("worker_count", route.worker_count))
            route.simultaneous_quantity = int(data.get("simultaneous_quantity", route.simultaneous_quantity))
            if role(request.user) not in ("admin", "manager") and not request.user.is_superuser:
                route.approved = False
            route.full_clean()
            route.save()
            AuditLog.objects.create(user=request.user, model_name="RouteOperation", object_id=route.pk,
                action="create" if creating else "update", reason="Технологический процесс в интерфейсе tpp")
        return JsonResponse({"ok": True, "id": route.pk})
    except (ValueError, TypeError, InvalidOperation, ValidationError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


def deviation_payload(item):
    order = item.job.program_line.order_item.order
    product = item.job.program_line.order_item.product
    return {"id": item.pk, "job_id": item.job_id, "order": order.number, "customer": order.customer.name,
        "product": product.name, "drawing": product.drawing, "date": item.date.isoformat(),
        "reason": item.note or item.reason, "hours": str(item.hours), "quantity": item.job.quantity}


@login_required
@require_http_methods(["GET", "POST"])
def deviations_api(request):
    require_page_access(request, "form2")
    if request.method == "GET":
        items = Downtime.objects.select_related("job__program_line__order_item__order__customer",
            "job__program_line__order_item__product").order_by("-date", "-pk")
        jobs = Job.objects.filter(program_line__order_item__order__archived=False).select_related(
            "program_line__order_item__order", "program_line__order_item__product", "operation")
        return JsonResponse({"deviations": [deviation_payload(item) for item in items],
            "jobs": [{"id": job.pk, "order": job.program_line.order_item.order.number,
                "label": f"{job.program_line.order_item.product.name} — {job.operation.number:02} {job.operation.name} (задание {job.pk})"}
                for job in jobs]})
    return save_deviation_api(request)


@login_required
@require_http_methods(["PUT", "DELETE"])
def deviation_api(request, pk):
    if role(request.user) not in ("admin", "manager", "supervisor", "normalizer") and not request.user.is_superuser:
        raise PermissionDenied
    item = get_object_or_404(Downtime, pk=pk)
    if request.method == "DELETE":
        with transaction.atomic():
            item.delete()
            AuditLog.objects.create(user=request.user, model_name="Downtime", object_id=pk,
                action="delete", reason="Удаление отклонения в интерфейсе tpp")
        return JsonResponse({"ok": True})
    return save_deviation_api(request, item)


def save_deviation_api(request, item=None):
    if role(request.user) not in ("admin", "manager", "supervisor", "normalizer") and not request.user.is_superuser:
        raise PermissionDenied
    try:
        data = json.loads(request.body)
        order_number = str(data.get("order", "")).strip()
        reason = str(data.get("reason", "")).strip()
        hours = Decimal(str(data.get("hours", "0")).replace(",", "."))
        event_date = date.fromisoformat(str(data.get("date", "")))
        if not reason or hours <= 0:
            raise ValueError("Укажите причину и число часов больше нуля")
        jobs = Job.objects.filter(program_line__order_item__order__number=order_number,
            program_line__order_item__order__archived=False)
        if data.get("job_id"):
            job = jobs.filter(pk=int(data["job_id"])).first()
        elif item and item.job.program_line.order_item.order.number == order_number:
            job = item.job
        else:
            job = jobs.first()
        if not job:
            raise ValueError("Для заказа нет производственного задания")
        with transaction.atomic():
            creating = item is None
            item = item or Downtime()
            item.job = job
            item.reason = reason if reason in dict(Downtime._meta.get_field("reason").choices) else "Прочее"
            item.note = "" if item.reason == reason else reason
            item.hours = hours
            item.date = event_date
            item.full_clean()
            item.save()
            AuditLog.objects.create(user=request.user, model_name="Downtime", object_id=item.pk,
                action="create" if creating else "update", reason=reason)
        return JsonResponse({"ok": True, "deviation": deviation_payload(item)})
    except (ValueError, TypeError, InvalidOperation, ValidationError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


@lru_cache(maxsize=1)
def legacy_assets_version():
    digest = hashlib.sha256()
    for name in ("legacy/js/app.js", "legacy/css/style.css", "bridge/server-bridge.js", "bridge/server-bridge.css"):
        digest.update((settings.BASE_DIR / "static" / "production" / name).read_bytes())
    return digest.hexdigest()[:16]


@login_required
def page(request, name="index"):
    if name not in PAGES:
        raise Http404
    if name in PAGE_ROLES and role(request.user) not in PAGE_ROLES[name] and not request.user.is_superuser:
        raise PermissionDenied
    markup = render_to_string(f"production/legacy/{name}.html", request=request)
    user = request.user
    original_role = role(user)
    data = {"username": user.username, "fullName": display_user_name(user), "role": original_role}
    bootstrap = "<script>const legacyUser=" + json.dumps(data, ensure_ascii=False).replace("<", "\\u003c") + ";sessionStorage.setItem('oecAuthorized','true');sessionStorage.setItem('oecUser',legacyUser.username);sessionStorage.setItem('oecFullName',legacyUser.fullName);sessionStorage.setItem('oecRole',legacyUser.role);</script>"
    version = legacy_assets_version()
    markup = markup.replace('<script src="js/app.js"></script>', bootstrap + f'<script src="/static/production/legacy/js/app.js?v={version}"></script><script src="/static/production/bridge/server-bridge.js?v={version}"></script>')
    markup = markup.replace('href="css/style.css"', f'href="/static/production/legacy/css/style.css?v={version}"><link rel="stylesheet" href="/static/production/bridge/server-bridge.css?v={version}"')
    markup = markup.replace('</head>', '<link rel="icon" type="image/svg+xml" href="/static/production/legacy/assets/favicon.svg"></head>', 1)
    markup = markup.replace('src="assets/', 'src="/static/production/legacy/assets/')
    return HttpResponse(markup)


def render_login(request, form):
    """Keep the tpp login markup and add only Django authentication fields."""
    markup = render_to_string("production/legacy/login.html", request=request)
    markup = markup.replace('href="css/style.css"', 'href="/static/production/legacy/css/style.css"')
    markup = markup.replace('</head>', '<link rel="icon" type="image/svg+xml" href="/static/production/legacy/assets/favicon.svg"></head>', 1)
    markup = markup.replace('src="assets/', 'src="/static/production/legacy/assets/')
    markup = markup.replace('<form id="login-form" class="login-form" novalidate>',
        '<form id="login-form" class="login-form" method="post"><input type="hidden" name="csrfmiddlewaretoken" value="' + get_token(request) + '">')
    markup = markup.replace('<input id="username" ', '<input id="username" name="username" ')
    markup = markup.replace('<input id="password" ', '<input id="password" name="password" ')
    markup = markup.replace('<input id="server" value="" readonly>',
        '<input id="server" value="' + escape(request.get_host()) + '" readonly>')
    markup = markup.replace('id="close-login"', 'id="close-login" onclick="this.form.reset()"')
    markup = markup.replace('<script src="js/auth.js"></script>', '')
    errors = form.non_field_errors()
    if errors:
        import re
        markup = re.sub(r'(<p id="login-message"[^>]*>).*?(</p>)',
            lambda match: match.group(1) + escape("; ".join(errors)) + match.group(2), markup, flags=re.S)
    return HttpResponse(markup)


ESTD_PRODUCT_FIELDS = ("material_specification", "material_code", "blank_type", "blank_dimensions")
ESTD_PRODUCT_NUMBERS = ("part_mass_kg", "material_consumption_kg", "blank_mass_kg")


@login_required
@require_http_methods(["GET", "PUT"])
def product_estd_api(request, pk):
    product = get_object_or_404(Product, pk=pk, archived=False)
    if request.method == "GET":
        return JsonResponse({"id": product.pk, "name": product.name, "drawing": product.drawing,
            **{field: getattr(product, field) for field in ESTD_PRODUCT_FIELDS},
            **{field: str(getattr(product, field)) if getattr(product, field) is not None else ""
               for field in ESTD_PRODUCT_NUMBERS},
            "parts_per_blank": product.parts_per_blank})
    if role(request.user) not in ("admin", "manager", "technologist") and not request.user.is_superuser:
        raise PermissionDenied
    try:
        data = json.loads(request.body)
        before = snapshot(product)
        for field in ESTD_PRODUCT_FIELDS:
            setattr(product, field, str(data.get(field, "")).strip())
        for field in ESTD_PRODUCT_NUMBERS:
            raw = str(data.get(field, "")).strip().replace(",", ".")
            setattr(product, field, Decimal(raw) if raw else None)
        product.parts_per_blank = int(data.get("parts_per_blank", 1))
        product.full_clean()
        with transaction.atomic():
            product.save(update_fields=[*ESTD_PRODUCT_FIELDS, *ESTD_PRODUCT_NUMBERS, "parts_per_blank"])
            AuditLog.objects.create(user=request.user, model_name="Product", object_id=product.pk,
                action="update", reason="Паспорт материала маршрутной карты ЕСТД",
                before=before, after=snapshot(product))
        return JsonResponse({"ok": True})
    except (ValueError, TypeError, InvalidOperation, ValidationError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


@login_required
@require_http_methods(["GET", "POST"])
def orders_api(request):
    if request.method == "GET":
        result = []
        for order in Order.objects.filter(archived=False).select_related("customer", "department"):
            for item in order.items.select_related("product", "equipment"):
                planned_hours = sum((route.batch_hours(item.quantity)
                    for route in item.product.route.filter(approved=True)), Decimal("0"))
                actual_hours = Job.objects.filter(program_line__order_item=item).aggregate(
                    value=Sum("actual_hours"))["value"] or Decimal("0")
                executors = list(Job.objects.filter(program_line__order_item=item, employee__isnull=False)
                    .values_list("employee__personnel_number", flat=True).distinct())
                result.append({"id": order.pk, "item_id": item.pk, "number": order.number,
                    "customer": order.customer.name, "department": order.department.name,
                    "product": item.product.name, "product_id": item.product_id,
                    "drawing": item.product.drawing,
                    "quantity": item.quantity, "drawing_count": item.drawing_count,
                    "object_name": item.object_name, "batch": item.batch,
                    "cost_code": item.cost_code, "invoice": item.invoice,
                    "machine": item.equipment.name if item.equipment else "", "cnc_program": item.cnc_program,
                    "one_c_code": item.one_c_code,
                    "start_date": order.start_date.isoformat(), "due_date": order.due_date.isoformat(),
                    "registration_date": order.registration_date.isoformat() if order.registration_date else "",
                    "request_date": order.request_date.isoformat() if order.request_date else "",
                    "priority": order.priority, "status": order.get_status_display(), "status_code": order.status,
                    "progress": order.progress, "request_number": order.request_number,
                    "note": order.note, "norm_per_item": str(planned_hours / item.quantity),
                    "planned_hours": str(planned_hours), "actual_hours": str(actual_hours),
                    "executors": ", ".join(number for number in executors if number)})
        return JsonResponse({"orders": result})
    if role(request.user) not in ("admin", "technologist", "manager") and not request.user.is_superuser:
        raise PermissionDenied
    try:
        data = json.loads(request.body)
        number = str(data.get("number", "")).strip()
        customer_name = str(data.get("customer", "")).strip()
        products = data.get("items", [])
        if not number or not customer_name or not products:
            raise ValueError("Заполните номер заказа, объект и список изделий")
        start = date.fromisoformat(data.get("start_date"))
        due = date.fromisoformat(data.get("due_date"))
        if start > due:
            raise ValueError("Дата выпуска должна быть после запуска")
        with transaction.atomic():
            customer, _ = Customer.objects.get_or_create(name=customer_name)
            department = Department.objects.filter(archived=False).first()
            if not department:
                raise ValueError("Сначала добавьте подразделение")
            order = Order(number=number, customer=customer, department=department,
                request_number=str(data.get("request_number", "")), start_date=start,
                registration_date=date.fromisoformat(data["registration_date"]) if data.get("registration_date") else None,
                request_date=date.fromisoformat(data["request_date"]) if data.get("request_date") else None,
                due_date=due, priority=int(data.get("priority") or 2), status="draft",
                note=str(data.get("note", "")))
            order.full_clean()
            order.save()
            machine_name = str(data.get("machine", "")).strip()
            equipment = None
            if machine_name:
                center = WorkCenter.objects.filter(archived=False).first()
                if not center:
                    raise ValueError("Сначала добавьте рабочий центр")
                equipment, _ = Equipment.objects.get_or_create(name=machine_name, defaults={
                    "work_center": center, "cnc": data.get("cnc") == "yes",
                    "cnc_control": str(data.get("cnc_control", "")),
                })
                equipment.cnc = data.get("cnc") == "yes"
                equipment.cnc_control = str(data.get("cnc_control", ""))
                equipment.save(update_fields=["cnc", "cnc_control"])
            for item in products:
                name = str(item.get("name", "")).strip()
                quantity = int(item.get("quantity") or 0)
                if not name or quantity <= 0:
                    raise ValueError("Укажите наименование и количество каждого изделия")
                product, _ = Product.objects.get_or_create(name=name,
                    drawing=str(item.get("drawing", "")).strip())
                order_item = OrderItem(order=order, product=product, quantity=quantity,
                    drawing_count=int(item.get("drawing_count", 1)),
                    object_name=str(item.get("object_name", "")).strip(),
                    cost_code=str(item.get("cost_code", data.get("cost_code", ""))).strip(),
                    invoice=str(item.get("invoice", "")).strip(),
                    batch=str(item.get("batch", "")), equipment=equipment,
                    cnc_program=str(data.get("cnc_program", "")), one_c_code=str(data.get("one_c_code", "")))
                order_item.full_clean()
                order_item.save()
            AuditLog.objects.create(user=request.user, model_name="Order", object_id=order.pk,
                action="create", reason="Прежний интерфейс", after=snapshot(order))
        return JsonResponse({"ok": True, "id": order.pk, "number": order.number})
    except (ValueError, TypeError, ValidationError, IntegrityError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


@login_required
@require_http_methods(["POST"])
def table_row_api(request, key):
    """Изменяет одну запись, не затирая другие строки таблицы."""
    if key not in ("personnel", "operations", "timesheet"):
        raise Http404
    if role(request.user) not in TABLE_ROLES[key] and not request.user.is_superuser:
        raise PermissionDenied
    try:
        data = json.loads(request.body)
        row = data.get("row")
        original = str(data.get("original", "")).strip()
        if not isinstance(row, list) or len(row) > 30 or any(isinstance(v, (list, dict)) or len(str(v)) > 2000 for v in row):
            raise ValueError("Неверный формат записи")
        with transaction.atomic():
            if key == "personnel":
                list(Employee.objects.select_for_update().values_list("pk", flat=True))
                rows = legacy_tables.personnel_rows()
            elif key == "operations":
                from .models import OperationDefinition
                list(OperationDefinition.objects.select_for_update().values_list("pk", flat=True))
                rows = legacy_tables.operations_rows(include_inactive=True)
            else:
                from .models import TimesheetEntry
                month = legacy_tables.month_from_text(data.get("month"))
                list(TimesheetEntry.objects.select_for_update().filter(month=month).values_list("pk", flat=True))
                rows = legacy_tables.timesheet_rows(month)
            matches = [i for i, value in enumerate(rows) if value[0] == original] if original else []
            if original and not matches:
                raise ValueError("Запись уже изменена или удалена. Обновите страницу")
            new_key = str(row[0]).strip() if row else ""
            if any(values[0] == new_key and values[0] != original for values in rows):
                raise ValueError("Запись с таким кодом уже существует")
            if matches:
                rows[matches[0]] = row
            else:
                rows.append(row)
            renamed = {new_key: original} if original and original != new_key else None
            if key == "personnel":
                legacy_tables.save_personnel([row], renamed=renamed, archive_missing=False)
            elif key == "operations":
                legacy_tables.save_operations([row], renamed=renamed, archive_missing=False)
            else:
                legacy_tables.save_timesheet([row], month, delete_missing=False)
                if original and original != new_key:
                    previous = legacy_tables._employee_by_number(original)
                    if previous:
                        TimesheetEntry.objects.filter(employee=previous, month=month).delete()
            AuditLog.objects.create(user=request.user, model_name=key, object_id=0, action="update" if original else "create", reason="Изменение строки")
        return JsonResponse({"ok": True})
    except (ValueError, TypeError, ValidationError, IntegrityError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


@login_required
@require_http_methods(["GET", "PUT"])
def table_api(request, key):
    if key not in TABLES:
        raise Http404
    can_read_personnel = request.method == "GET" and key == "personnel" and role(request.user) == "planner"
    if role(request.user) not in TABLE_ROLES[key] and not request.user.is_superuser and not can_read_personnel:
        raise PermissionDenied
    if request.method == "GET":
        if key == "operations":
            return JsonResponse({"rows": legacy_tables.operations_rows(
                include_inactive=request.GET.get("include_inactive") == "1")})
        if key == "personnel":
            return JsonResponse({"rows": legacy_tables.personnel_rows()})
        if key == "timesheet":
            return JsonResponse({"rows": legacy_tables.timesheet_rows(
                legacy_tables.month_from_text(request.GET.get("month"))),
                "departments": {employee.personnel_number or str(employee.pk).zfill(3): employee.department.name
                    for employee in Employee.objects.select_related("department").filter(archived=False)}})
        saved = LegacyTable.objects.filter(key=key).first()
        if saved and key != "materials1c":
            rows = [row[:8] for row in saved.rows] if key == "operations" else saved.rows
            return JsonResponse({"rows": rows})
        if key == "materials1c":
            rows = [[m.code, m.name, m.unit, "ЦС-01", str(m.stock_quantity), str(m.reserved_quantity), str(m.available_quantity), ""] for m in Material.objects.filter(archived=False)]
        elif key == "operations":
            rows = [[f"{op.number:03}", op.name, op.get_kind_display(), op.equipment.name if op.equipment else "",
                "", "нормо-час", f"{op.number:03}", "Да" if op.approved else "Нет"]
                for op in RouteOperation.objects.select_related("equipment")]
        elif key == "personnel":
            rows = [[str(e.pk).zfill(3), e.name, e.department.name, e.profession, str(e.grade), "1", "", "Работает"] for e in Employee.objects.select_related("department").filter(archived=False)]
        else:
            rows = []
        return JsonResponse({"rows": rows})
    try:
        if len(request.body) > 5_000_000:
            raise ValueError("Таблица слишком большая")
        data = json.loads(request.body)
        rows = data.get("rows")
        if not isinstance(rows, list) or len(rows) > 5000 or any(
            not isinstance(row, list) or len(row) > 30 or
            any(isinstance(value, (dict, list)) or len(str(value)) > 2000 for value in row)
            for row in rows
        ):
            raise ValueError("Неверный формат таблицы")
        with transaction.atomic():
            if key == "operations":
                legacy_tables.save_operations(rows)
            elif key == "personnel":
                legacy_tables.save_personnel(rows)
            elif key == "timesheet":
                legacy_tables.save_timesheet(rows, legacy_tables.month_from_text(
                    data.get("month") or request.GET.get("month")))
            saved_rows = [row[:8] for row in rows] if key == "operations" else rows
            LegacyTable.objects.update_or_create(key=key, defaults={"rows": saved_rows, "updated_by": request.user})
            if key == "materials1c":
                for row in rows:
                    if len(row) < 6 or not row[0] or not row[1]:
                        continue
                    Material.objects.update_or_create(code=str(row[0]).strip(), defaults={
                        "name": str(row[1]).strip(), "unit": str(row[2] or "кг"),
                        "stock_quantity": Decimal(str(row[4] or 0).replace(",", ".")),
                        "reserved_quantity": Decimal(str(row[5] or 0).replace(",", ".")),
                        "archived": False,
                    })
            AuditLog.objects.create(user=request.user, model_name="LegacyTable", object_id=0,
                action="update", reason=f"Таблица {key}")
        return JsonResponse({"ok": True})
    except (ValueError, TypeError, InvalidOperation, ValidationError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)


@login_required
@require_http_methods(["PUT", "DELETE"])
def order_api(request, pk):
    if role(request.user) not in ("admin", "technologist", "manager") and not request.user.is_superuser:
        raise PermissionDenied
    order = get_object_or_404(Order, pk=pk)
    try:
        data = json.loads(request.body)
        reason = str(data.get("reason", "Корректировка в прежнем интерфейсе")).strip()
        if not reason:
            raise ValueError("Укажите основание корректировки")
        before = snapshot(order)
        with transaction.atomic():
            if request.method == "DELETE":
                if data.get("scope") == "order":
                    order.archived = True
                    order.save(update_fields=["archived"])
                    action = "archive"
                else:
                    item = get_object_or_404(OrderItem, pk=data.get("item_id"), order=order)
                    if order.items.count() > 1:
                        item.delete()
                        action = "delete_item"
                    else:
                        order.archived = True
                        order.save(update_fields=["archived"])
                        action = "archive"
            else:
                if data.get("number"):
                    order.number = str(data["number"]).strip()
                if data.get("priority"):
                    order.priority = int(data["priority"])
                if "status" in data:
                    order.status = str(data["status"])
                order.request_number = str(data.get("request_number", order.request_number))
                if "registration_date" in data:
                    order.registration_date = date.fromisoformat(data["registration_date"]) if data["registration_date"] else None
                if "request_date" in data:
                    order.request_date = date.fromisoformat(data["request_date"]) if data["request_date"] else None
                order.note = str(data.get("note", order.note))
                if data.get("customer"):
                    order.customer, _ = Customer.objects.get_or_create(name=str(data["customer"]).strip())
                if data.get("start_date"):
                    order.start_date = date.fromisoformat(data["start_date"])
                if data.get("due_date"):
                    order.due_date = date.fromisoformat(data["due_date"])
                order.full_clean()
                order.save()
                item = get_object_or_404(OrderItem, pk=data.get("item_id"), order=order)
                product_name = str(data.get("product", item.product.name)).strip()
                drawing = str(data.get("drawing", item.product.drawing)).strip()
                if not product_name:
                    raise ValueError("Укажите наименование изделия")
                operation_map = {}
                if (product_name, drawing) != (item.product.name, item.product.drawing):
                    original = item.product
                    target = Product.objects.filter(name=product_name, drawing=drawing).first()
                    if target and Job.objects.filter(program_line__order_item=item).exists():
                        raise ValueError("Нельзя заменить изделие с заданиями на другое существующее изделие")
                    if target:
                        item.product = target
                    elif not OrderItem.objects.filter(product=original).exclude(pk=item.pk).exists():
                        original.name, original.drawing = product_name, drawing
                        original.full_clean()
                        original.save(update_fields=["name", "drawing"])
                    else:
                        # Для общей карточки создаём копию, сохраняя её маршрут и нормативы.
                        target = copy(original)
                        target.pk = None
                        target.name, target.drawing = product_name, drawing
                        target.full_clean()
                        target.save()
                        for route in original.route.all():
                            new_route = copy(route)
                            new_route.pk = None
                            new_route.product = target
                            new_route.save()
                            operation_map[route.pk] = new_route.pk
                            try:
                                norm = copy(route.cutting_norm)
                            except RouteOperation.cutting_norm.RelatedObjectDoesNotExist:
                                continue
                            norm.pk = None
                            norm.operation = new_route
                            norm.save()
                        item.product = target
                item.quantity = int(data.get("quantity", item.quantity))
                if "drawing_count" in data:
                    item.drawing_count = int(data["drawing_count"])
                if "object_name" in data:
                    item.object_name = str(data["object_name"]).strip()
                if "cost_code" in data:
                    item.cost_code = str(data["cost_code"]).strip()
                if "invoice" in data:
                    item.invoice = str(data["invoice"]).strip()
                item.full_clean()
                item.save()
                for old_operation, new_operation in operation_map.items():
                    Job.objects.filter(program_line__order_item=item, operation_id=old_operation).update(operation_id=new_operation)
                order.full_clean()
                action = "update"
            AuditLog.objects.create(user=request.user, model_name="Order", object_id=order.pk,
                action=action, reason=reason, before=before, after=snapshot(order))
        return JsonResponse({"ok": True})
    except (ValueError, TypeError, ValidationError, ProtectedError, IntegrityError) as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)
