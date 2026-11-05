"""Черновики карт несоответствия, отдельно от учёта простоев."""
import json

from django import forms
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods

from .models import AuditLog, NonconformityCard, NonconformityLine, OrderItem
from .views import role

READ_ROLES = {"admin", "manager", "technologist", "supervisor", "normalizer", "planner", "economist"}
WRITE_ROLES = {"admin", "manager", "technologist", "supervisor"}
CARD_FIELDS = ("number", "date", "order_item", "source_document", "register_number", "assembly", "assembly_drawing",
    "detail", "detail_drawing", "manufacturing_basis", "batch_quantity", "unit_labor_hours", "deviation_labor_hours",
    "detection_operation", "inspector", "manufacturer", "manager", "quality_manager", "technologist_decision",
    "customer_decision", "designer_conclusion", "corrective_action", "action_due_date", "action_responsible")
LINE_FIELDS = ("requirement", "actual", "quantity", "reason")


class CardForm(forms.ModelForm):
    class Meta:
        model = NonconformityCard
        fields = CARD_FIELDS

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["order_item"].queryset = OrderItem.objects.filter(
            Q(order__archived=False) | Q(pk=self.instance.order_item_id)).select_related("order", "product")


class LineForm(forms.ModelForm):
    class Meta:
        model = NonconformityLine
        fields = LINE_FIELDS


def authorize(user, write=False):
    if not user.is_superuser and role(user) not in (WRITE_ROLES if write else READ_ROLES):
        raise PermissionDenied


def payload(card):
    result = {name: getattr(card, name) for name in CARD_FIELDS if name != "order_item"}
    result.update({"id": card.pk, "order_item": card.order_item_id, "order": card.order_item.order.number,
        "product": card.order_item.product.name, "drawing": card.order_item.product.drawing,
        "created_by": card.created_by.get_full_name() or card.created_by.username,
        "lines": list(card.lines.values(*LINE_FIELDS))})
    return result


def save_card(request, card=None):
    authorize(request.user, write=True)
    if len(request.body) > 200_000:
        return JsonResponse({"error": "Слишком большой запрос"}, status=400)
    try:
        data = json.loads(request.body)
        if not isinstance(data, dict) or not isinstance(data.get("lines"), list) or not 1 <= len(data["lines"]) <= 50:
            raise ValueError("Добавьте от одной до 50 строк отклонений")
        if any(not isinstance(line, dict) for line in data["lines"]):
            raise ValueError("Неверный формат строк отклонений")
        form = CardForm(data, instance=card)
        line_forms = [LineForm(line) for line in data["lines"]]
        valid = form.is_valid()
        line_valid = [entry.is_valid() for entry in line_forms]
        if valid:
            batch = form.cleaned_data["batch_quantity"]
            for entry, is_valid in zip(line_forms, line_valid):
                if is_valid and entry.cleaned_data["quantity"] > batch:
                    entry.add_error("quantity", "Количество больше партии")
            line_valid = [not entry.errors for entry in line_forms]
        if not valid or not all(line_valid):
            return JsonResponse({"error": "Проверьте поля карты", "fields": form.errors.get_json_data(),
                "lines": [entry.errors.get_json_data() for entry in line_forms],
                "labels": {name: str(field.label or name) for name, field in {**form.fields, **line_forms[0].fields}.items()}}, status=400)
        with transaction.atomic():
            creating = card is None
            saved = form.save(commit=False)
            if creating:
                saved.created_by = request.user
            saved.order_item = OrderItem.objects.select_for_update().select_related("order", "product").get(pk=saved.order_item_id)
            saved.full_clean()
            saved.save()
            saved.lines.all().delete()
            for entry in line_forms:
                line = entry.save(commit=False)
                line.card = saved
                line.full_clean()
                line.save()
            AuditLog.objects.create(user=request.user, model_name="NonconformityCard", object_id=saved.pk,
                action="create" if creating else "update", reason="Черновик карты отклонений")
        return JsonResponse({"ok": True, "card": payload(saved)})
    except (ValueError, TypeError, IntegrityError, ValidationError) as exc:
        return JsonResponse({"error": str(exc)}, status=400)


@login_required
@require_http_methods(["GET", "POST"])
def cards(request):
    authorize(request.user)
    if request.method == "POST":
        return save_card(request)
    queryset = NonconformityCard.objects.select_related("order_item__order", "order_item__product", "created_by").prefetch_related("lines")
    items = OrderItem.objects.filter(order__archived=False).select_related("order", "product").order_by("order__number", "pk")
    return JsonResponse({"cards": [payload(card) for card in queryset], "can_write": request.user.is_superuser or role(request.user) in WRITE_ROLES,
        "items": [{"id": item.pk, "label": f"{item.order.number} · {item.product.name} · {item.product.drawing}", "quantity": item.quantity} for item in items]})


@login_required
@require_http_methods(["PUT", "DELETE"])
def card_detail(request, pk):
    authorize(request.user, write=True)
    card = get_object_or_404(NonconformityCard, pk=pk)
    if request.method == "PUT":
        return save_card(request, card)
    with transaction.atomic():
        card.delete()
        AuditLog.objects.create(user=request.user, model_name="NonconformityCard", object_id=pk, action="delete", reason="Удаление черновика карты")
    return JsonResponse({"ok": True})


@login_required
@require_http_methods(["GET"])
def print_card(request, pk):
    authorize(request.user)
    card = get_object_or_404(NonconformityCard.objects.select_related("order_item__order__customer", "order_item__product", "created_by").prefetch_related("lines"), pk=pk)
    return render(request, "production/nonconformity_print.html", {"card": card})
