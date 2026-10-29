from decimal import Decimal
from datetime import timedelta
from math import ceil
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Sum
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    can_change_username = models.BooleanField(default=False)
    can_change_password = models.BooleanField(default=False)
    avatar = models.BinaryField(null=True, blank=True)


class SitePolicy(models.Model):
    maintenance = models.BooleanField(default=False)
    maintenance_owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    allow_username_changes = models.BooleanField(default=False)
    allow_password_changes = models.BooleanField(default=False)


class NamedModel(models.Model):
    name = models.CharField("Наименование", max_length=200)
    archived = models.BooleanField("Архив", default=False)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class Customer(NamedModel):
    code = models.CharField("Код", max_length=30, blank=True)

    class Meta:
        verbose_name = "Заказчик"
        verbose_name_plural = "Заказчики"


class Department(NamedModel):
    class Meta:
        verbose_name = "Подразделение"
        verbose_name_plural = "Подразделения"


class WorkCenter(NamedModel):
    department = models.ForeignKey(Department, on_delete=models.PROTECT, verbose_name="Подразделение")
    hours_per_day = models.DecimalField("Часов в смене", max_digits=5, decimal_places=2, default=8)
    shifts = models.PositiveSmallIntegerField("Смен", default=1)

    class Meta:
        verbose_name = "Рабочий центр"
        verbose_name_plural = "Рабочие центры"
        constraints = [
            models.CheckConstraint(condition=models.Q(hours_per_day__gt=0), name="work_center_positive_hours"),
            models.CheckConstraint(condition=models.Q(shifts__gt=0), name="work_center_positive_shifts"),
        ]

    @property
    def daily_capacity(self):
        return self.hours_per_day * self.shifts


class Equipment(NamedModel):
    work_center = models.ForeignKey(WorkCenter, on_delete=models.PROTECT, verbose_name="Рабочий центр")
    available = models.BooleanField("Доступно", default=True)
    cnc = models.BooleanField("Станок с ЧПУ", default=False)
    cnc_control = models.CharField("Система ЧПУ", max_length=100, blank=True)
    inventory_number = models.CharField("Инвентарный номер", max_length=80, blank=True)

    class Meta:
        verbose_name = "Оборудование"
        verbose_name_plural = "Оборудование"


class Employee(NamedModel):
    personnel_number = models.CharField("Табельный номер", max_length=30, unique=True, null=True, blank=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Учетная запись")
    department = models.ForeignKey(Department, on_delete=models.PROTECT, verbose_name="Подразделение")
    profession = models.CharField("Профессия", max_length=100)
    grade = models.PositiveSmallIntegerField("Разряд", default=1)
    hours_per_day = models.DecimalField("Часов в день", max_digits=5, decimal_places=2, default=8)
    shift = models.PositiveSmallIntegerField("Смена", default=1)
    hired_on = models.DateField("Дата приема", null=True, blank=True)
    personnel_status = models.CharField("Состояние", max_length=60, default="Работает")

    class Meta:
        verbose_name = "Сотрудник"
        verbose_name_plural = "Сотрудники"


class Product(NamedModel):
    drawing = models.CharField("Чертеж", max_length=100, blank=True)
    unit = models.CharField("Единица измерения", max_length=20, default="шт")
    kind = models.CharField("Вид", max_length=30, choices=[("part", "Деталь"), ("assembly", "Сборочная единица"), ("product", "Изделие")], default="product")
    material_specification = models.CharField("Материал по КД (М01)", max_length=240, blank=True)
    material_code = models.CharField("Код материала (М02)", max_length=50, blank=True)
    part_mass_kg = models.DecimalField("Масса детали, кг", max_digits=10, decimal_places=3,
        null=True, blank=True, validators=[MinValueValidator(0)])
    material_consumption_kg = models.DecimalField("Норма расхода материала, кг", max_digits=10,
        decimal_places=3, null=True, blank=True, validators=[MinValueValidator(0)])
    blank_type = models.CharField("Вид заготовки", max_length=100, blank=True)
    blank_dimensions = models.CharField("Профиль и размеры заготовки", max_length=120, blank=True)
    blank_mass_kg = models.DecimalField("Масса заготовки, кг", max_digits=10, decimal_places=3,
        null=True, blank=True, validators=[MinValueValidator(0)])
    parts_per_blank = models.PositiveSmallIntegerField("Деталей из одной заготовки", default=1)

    class Meta:
        verbose_name = "Изделие"
        verbose_name_plural = "Изделия"
        constraints = [models.UniqueConstraint(fields=["name", "drawing"], name="unique_product_name_drawing")]

    def clean(self):
        if self.parts_per_blank < 1:
            raise ValidationError("Количество деталей из одной заготовки должно быть положительным.")


class OperationDefinition(models.Model):
    code = models.CharField("Код операции", max_length=30, unique=True)
    name = models.CharField("Наименование", max_length=200)
    kind = models.CharField("Вид работ", max_length=100)
    equipment = models.ForeignKey(Equipment, on_delete=models.PROTECT, null=True, blank=True)
    equipment_name = models.CharField("Оборудование", max_length=200, blank=True)
    min_grade = models.PositiveSmallIntegerField("Минимальный разряд", default=1)
    norm_unit = models.CharField("Единица нормирования", max_length=40, default="нормо-час")
    estd_code = models.CharField("Обозначение ЕСТД", max_length=80, blank=True)
    active = models.BooleanField("Действует", default=True)

    class Meta:
        verbose_name = "Справочная операция"
        verbose_name_plural = "Справочные операции"

    def __str__(self):
        return f"{self.code} {self.name}"


class RouteOperation(models.Model):
    KINDS = [(x, y) for x, y in [("machining", "Механообработка"), ("assembly", "Сборка"), ("fitting", "Слесарная"), ("blank", "Заготовительная"), ("thermal", "Термическая"), ("welding", "Сварочная")]]
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="route", verbose_name="Изделие")
    definition = models.ForeignKey(OperationDefinition, on_delete=models.PROTECT, null=True, blank=True,
        related_name="routes", verbose_name="Справочная операция")
    number = models.PositiveSmallIntegerField("№ операции")
    name = models.CharField("Операция", max_length=200)
    kind = models.CharField("Вид операции", max_length=20, choices=KINDS)
    work_center = models.ForeignKey(WorkCenter, on_delete=models.PROTECT, verbose_name="Рабочий центр")
    equipment = models.ForeignKey(Equipment, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Оборудование")
    setup_hours = models.DecimalField("Тпз на партию, ч", max_digits=8, decimal_places=2, default=0)
    piece_hours = models.DecimalField("Штучное время, ч", max_digits=8, decimal_places=3, default=0)
    quality_required = models.BooleanField("Контроль обязателен", default=False)
    approved = models.BooleanField("Утверждено", default=False)
    cnc_program = models.CharField("Программа ЧПУ", max_length=120, blank=True)
    machine_setup = models.TextField("Наладка станка", blank=True)
    shop_code = models.CharField("Код цеха ЕСТД", max_length=20, blank=True)
    section_code = models.CharField("Код участка ЕСТД", max_length=20, blank=True)
    workplace_code = models.CharField("Код рабочего места ЕСТД", max_length=20, blank=True)
    document_refs = models.CharField("Документы операции ЕСТД", max_length=300, blank=True)
    operation_text = models.TextField("Содержание операции (О)", blank=True)
    tooling = models.TextField("Оснастка (Т, через ;)", blank=True)
    profession_code = models.CharField("Код профессии", max_length=20, blank=True)
    worker_count = models.PositiveSmallIntegerField("Число исполнителей", default=1)
    simultaneous_quantity = models.PositiveSmallIntegerField("Одновременная обработка, шт.", default=1)

    class Meta:
        verbose_name = "Операция маршрута"
        verbose_name_plural = "Операции маршрута"
        ordering = ["product", "number"]
        unique_together = [("product", "number")]

    def __str__(self):
        return f"{self.product} · {self.number:02} {self.name}"

    def batch_hours(self, quantity):
        return self.setup_hours + self.effective_piece_hours * quantity

    def calculated_piece_hours(self, quantity):
        return self.effective_piece_hours + self.setup_hours / quantity if quantity else Decimal("0")

    @property
    def effective_piece_hours(self):
        norm = getattr(self, "cutting_norm", None)
        return norm.machine_hours if norm and norm.approved else self.piece_hours

    def clean(self):
        if self.equipment_id and self.equipment.work_center_id != self.work_center_id:
            raise ValidationError("Оборудование должно относиться к выбранному рабочему центру.")
        if self.worker_count < 1 or self.simultaneous_quantity < 1:
            raise ValidationError("Число исполнителей и одновременно обрабатываемых деталей должно быть положительным.")
        if len(self.operation_text) > 2000 or len(self.tooling) > 2000:
            raise ValidationError("Содержание операции и оснастка должны быть короче 2000 символов.")


class Order(models.Model):
    STATUSES = [("draft", "Проект"), ("planned", "Запланирован"), ("work", "В работе"), ("risk", "Под риском"), ("done", "Исполнен"), ("closed", "Закрыт")]
    number = models.CharField("Номер заказа", max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, verbose_name="Заказчик")
    department = models.ForeignKey(Department, on_delete=models.PROTECT, verbose_name="Подразделение")
    request_number = models.CharField("Номер заявки", max_length=80, blank=True)
    registration_date = models.DateField("Дата регистрации", null=True, blank=True)
    request_date = models.DateField("Дата заявки", null=True, blank=True)
    start_date = models.DateField("Плановый запуск")
    due_date = models.DateField("Плановый выпуск")
    priority = models.PositiveSmallIntegerField("Приоритет", default=2)
    status = models.CharField("Состояние", max_length=15, choices=STATUSES, default="draft")
    constraint = models.TextField("Ограничения", blank=True)
    note = models.TextField("Примечание", blank=True)
    archived = models.BooleanField("Архив", default=False)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Изменен", auto_now=True)

    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ["due_date", "-priority"]
        indexes = [models.Index(fields=["archived", "due_date", "status"], name="order_active_due_status_idx")]
        constraints = [
            models.CheckConstraint(condition=models.Q(start_date__lte=models.F("due_date")), name="order_valid_dates"),
            models.CheckConstraint(condition=models.Q(priority__gt=0), name="order_positive_priority"),
        ]

    def __str__(self):
        return self.number

    @property
    def quantity(self):
        return self.items.aggregate(v=Sum("quantity"))["v"] or 0

    @property
    def accepted_quantity(self):
        return self.events.filter(kind="accepted").aggregate(v=Sum("quantity"))["v"] or 0

    @property
    def progress(self):
        return min(round(self.accepted_quantity * 100 / self.quantity), 100) if self.quantity else 0

    @property
    def remaining_quantity(self):
        return max(self.quantity - self.accepted_quantity, 0)

    @property
    def is_overdue(self):
        return self.due_date < timezone.localdate() and self.status not in ("done", "closed")

    @property
    def forecast_date(self):
        dates = [line.forecast_date for line in ProgramLine.objects.filter(order_item__order=self, program__status__in=["approved", "revised"]).select_related("order_item__order", "work_center")]
        return max(dates) if dates else self.due_date

    @property
    def is_at_risk(self):
        return bool(self.constraint) or self.status == "risk" or self.forecast_date > self.due_date

    def clean(self):
        if self.start_date and self.due_date and self.start_date > self.due_date:
            raise ValidationError("Плановый запуск не может быть позже выпуска.")
        if self.pk and self.status in ("done", "closed") and self.progress < 100:
            raise ValidationError("Для закрытия заказа необходимо принять весь заказанный объем.")


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items", verbose_name="Заказ")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, verbose_name="Изделие")
    batch = models.CharField("Партия", max_length=50, blank=True)
    quantity = models.PositiveIntegerField("Количество")
    drawing_count = models.PositiveIntegerField("Количество чертежей", default=1)
    object_name = models.CharField("Объект изделия", max_length=200, blank=True)
    cost_code = models.CharField("Шифр затрат", max_length=80, blank=True)
    invoice = models.CharField("Накладная", max_length=100, blank=True)
    equipment = models.ForeignKey(Equipment, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Станок / оборудование")
    cnc_program = models.CharField("Программа ЧПУ", max_length=120, blank=True)
    one_c_code = models.CharField("Код номенклатуры 1С", max_length=80, blank=True)

    class Meta:
        verbose_name = "Позиция заказа"
        verbose_name_plural = "Позиции заказа"
        constraints = [
            models.CheckConstraint(condition=models.Q(quantity__gt=0), name="order_item_positive_quantity"),
            models.CheckConstraint(condition=models.Q(drawing_count__gt=0), name="order_item_positive_drawing_count"),
        ]

    def __str__(self):
        return f"{self.order} · {self.product} × {self.quantity}"

    def clean(self):
        if not self.pk or not self.quantity:
            return
        previous_quantity = OrderItem.objects.filter(pk=self.pk).values_list("quantity", flat=True).first()
        if self.order.status in ("done", "closed") and self.quantity != previous_quantity:
            raise ValidationError("Количество закрытого заказа изменять нельзя.")
        largest_plan = ProgramLine.objects.filter(order_item=self).aggregate(value=models.Max("quantity"))["value"] or 0
        if self.quantity < largest_plan:
            raise ValidationError("Количество не может быть меньше утвержденного объема программы.")
        accepted = ProductionEvent.objects.filter(job__program_line__order_item=self, kind="accepted").aggregate(
            value=Sum("quantity"))["value"] or 0
        if self.quantity < accepted:
            raise ValidationError("Количество не может быть меньше уже принятого объема.")


class Program(models.Model):
    STATUSES = [("draft", "Проект"), ("review", "На согласовании"), ("approved", "Утверждена"), ("revised", "Скорректирована"), ("closed", "Закрыта")]
    name = models.CharField("Наименование", max_length=200)
    year = models.PositiveSmallIntegerField("Год")
    quarter = models.PositiveSmallIntegerField("Квартал (0 — год)", default=0)
    version = models.PositiveSmallIntegerField("Версия", default=1)
    status = models.CharField("Статус", max_length=15, choices=STATUSES, default="draft")
    correction_reason = models.TextField("Причина корректировки", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Производственная программа"
        verbose_name_plural = "Производственные программы"
        ordering = ["-year", "-quarter", "-version"]
        constraints = [models.UniqueConstraint(fields=["name", "version"], name="unique_program_version")]

    def __str__(self):
        return f"{self.name} · версия {self.version}"

    def clean(self):
        if self.quarter not in range(5):
            raise ValidationError("Квартал должен быть от 0 до 4; 0 означает годовую программу.")


class ProgramLine(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="lines", verbose_name="Программа")
    order_item = models.ForeignKey(OrderItem, on_delete=models.PROTECT, verbose_name="Позиция заказа")
    work_center = models.ForeignKey(WorkCenter, on_delete=models.PROTECT, verbose_name="Рабочий центр")
    quantity = models.PositiveIntegerField("Плановый выпуск")
    due_date = models.DateField("Срок")

    class Meta:
        verbose_name = "Строка программы"
        verbose_name_plural = "Строки программы"
        constraints = [
            models.UniqueConstraint(fields=["program", "order_item"], name="unique_program_order_item"),
            models.CheckConstraint(condition=models.Q(quantity__gt=0), name="program_line_positive_quantity"),
        ]

    @property
    def planned_hours(self):
        return sum((r.batch_hours(self.quantity) for r in self.order_item.product.route.filter(approved=True)), Decimal("0"))

    @property
    def forecast_date(self):
        daily = self.work_center.daily_capacity
        days = max(ceil(self.planned_hours / daily), 1) if daily else 1
        cursor = self.order_item.order.start_date
        completed = 0
        while completed < days:
            if cursor.weekday() < 5:
                completed += 1
                if completed == days:
                    break
            cursor += timedelta(days=1)
        return cursor

    def clean(self):
        if self.order_item_id and self.quantity > self.order_item.quantity:
            raise ValidationError("Объем программы превышает количество в заказе.")


class NormingApproval(models.Model):
    """Утверждённый снимок расчёта трудоёмкости за квартал."""

    year = models.PositiveSmallIntegerField("Год")
    quarter = models.PositiveSmallIntegerField("Квартал")
    drawing_count = models.PositiveIntegerField("Количество чертежей")
    hours_per_employee = models.DecimalField("Часов на сотрудника", max_digits=9, decimal_places=2)
    labor_factor = models.DecimalField("Коэффициент трудоёмкости", max_digits=7, decimal_places=3)
    staff_count = models.PositiveIntegerField("Численность")
    planned_hours = models.DecimalField("Плановая трудоёмкость, ч", max_digits=12, decimal_places=2)
    actual_hours = models.DecimalField("Фактическая трудоёмкость, ч", max_digits=12, decimal_places=2)
    capacity_hours = models.DecimalField("Располагаемый фонд, ч", max_digits=12, decimal_places=2)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    approved_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Утверждённое нормирование"
        verbose_name_plural = "Утверждённое нормирование"
        constraints = [models.UniqueConstraint(fields=["year", "quarter"], name="unique_norming_period")]


class Job(models.Model):
    STATUSES = [("planned", "Запланировано"), ("waiting", "Ожидает запуска"), ("work", "В работе"), ("paused", "Приостановлено"), ("quality", "Ожидает контроля"), ("done", "Выполнено"), ("accepted", "Принято")]
    program_line = models.ForeignKey(ProgramLine, on_delete=models.PROTECT, verbose_name="Строка утвержденной программы")
    operation = models.ForeignKey(RouteOperation, on_delete=models.PROTECT, verbose_name="Операция")
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Исполнитель")
    quantity = models.PositiveIntegerField("Количество")
    actual_quantity = models.PositiveIntegerField("Фактическое количество", default=0)
    planned_start = models.DateField("Плановое начало")
    planned_end = models.DateField("Плановое окончание")
    actual_end = models.DateField("Фактическое окончание", null=True, blank=True)
    actual_hours = models.DecimalField("Фактическая трудоемкость, ч", max_digits=9, decimal_places=2, default=0)
    status = models.CharField("Статус", max_length=15, choices=STATUSES, default="planned")
    deviation_reason = models.TextField("Причина отклонения", blank=True)

    class Meta:
        verbose_name = "Производственное задание"
        verbose_name_plural = "Производственные задания"
        ordering = ["planned_end"]
        constraints = [
            models.UniqueConstraint(fields=["program_line", "operation"], name="unique_line_operation_job"),
            models.CheckConstraint(condition=models.Q(quantity__gt=0), name="job_positive_quantity"),
            models.CheckConstraint(condition=models.Q(planned_start__lte=models.F("planned_end")), name="job_valid_dates"),
            models.CheckConstraint(condition=models.Q(actual_quantity__lte=models.F("quantity")), name="job_actual_not_above_plan"),
        ]

    def __str__(self):
        return f"ПЗ-{self.pk or 'новое'} · {self.operation}"

    @property
    def planned_hours(self):
        return self.operation.batch_hours(self.quantity)

    @property
    def priority(self):
        return self.program_line.order_item.order.priority

    def clean(self):
        if self.planned_start and self.planned_end and self.planned_start > self.planned_end:
            raise ValidationError("Начало задания не может быть позже окончания.")
        if not self.pk and self.program_line_id and self.program_line.program.status not in ("approved", "revised"):
            raise ValidationError("Задание создается только по утвержденной программе.")
        if self.program_line_id and self.operation_id and self.operation.product_id != self.program_line.order_item.product_id:
            raise ValidationError("Операция должна относиться к изделию в программе.")
        if self.employee_id and self.employee.archived:
            raise ValidationError("Архивного сотрудника нельзя назначить на задание.")
        if self.employee_id and self.operation_id and self.operation.definition_id and self.employee.grade < self.operation.definition.min_grade:
            raise ValidationError("Разряд исполнителя ниже минимального разряда операции.")
        if self.actual_quantity > self.quantity:
            raise ValidationError("Фактическое количество не может превышать плановое.")
        if self.status in ("done", "accepted") and (not self.actual_end or not self.actual_quantity or not self.employee_id or self.actual_hours <= 0):
            raise ValidationError("Для закрытия задания укажите исполнителя, дату, фактическое количество и трудоемкость.")
        if self.status == "accepted" and self.operation_id and self.operation.quality_required and (not self.pk or not self.quality_checks.filter(result="accepted").exists()):
            raise ValidationError("Для приемки задания требуется положительный результат контроля.")


class ProductionEvent(models.Model):
    KINDS = [("produced", "Произведено"), ("presented", "Предъявлено"), ("accepted", "Принято"), ("rejected", "Брак"), ("rework", "Доработка"), ("delivered", "Сдано")]
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name="events", verbose_name="Заказ")
    job = models.ForeignKey(Job, on_delete=models.PROTECT, related_name="events", verbose_name="Задание")
    kind = models.CharField("Вид движения", max_length=15, choices=KINDS)
    quantity = models.PositiveIntegerField("Количество")
    date = models.DateField("Дата", default=timezone.localdate)
    document = models.CharField("Документ-основание", max_length=100)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, verbose_name="Ответственный")

    class Meta:
        verbose_name = "Движение продукции"
        verbose_name_plural = "Движение продукции"
        ordering = ["-date", "-id"]

    def clean(self):
        if self.job_id and self.order_id != self.job.program_line.order_item.order_id:
            raise ValidationError("Заказ должен совпадать с заказом задания.")
        if self.order_id and self.quantity > self.order.quantity:
            raise ValidationError("Количество превышает объем заказа.")
        if self.job_id and self.kind == "accepted":
            last_operation = self.job.operation.product.route.order_by("-number").first()
            if last_operation and last_operation.pk != self.job.operation_id:
                raise ValidationError("Готовая продукция принимается после последней операции маршрута.")
            previous = ProductionEvent.objects.filter(job=self.job, kind="accepted").exclude(pk=self.pk).aggregate(v=Sum("quantity"))["v"] or 0
            if self.job.operation.quality_required:
                checked = self.job.quality_checks.filter(result="accepted").aggregate(v=Sum("quantity"))["v"] or 0
                if checked < previous + self.quantity:
                    raise ValidationError("Принятое количество должно пройти контроль качества.")
            if previous + self.quantity > self.job.quantity:
                raise ValidationError("Суммарная приемка превышает объем задания.")
        if self.job_id and self.kind == "delivered":
            accepted = ProductionEvent.objects.filter(job=self.job, kind="accepted").aggregate(v=Sum("quantity"))["v"] or 0
            delivered = ProductionEvent.objects.filter(job=self.job, kind="delivered").exclude(pk=self.pk).aggregate(v=Sum("quantity"))["v"] or 0
            if delivered + self.quantity > accepted:
                raise ValidationError("Нельзя сдать больше принятого количества.")


class QualityCheck(models.Model):
    RESULTS = [("accepted", "Принято"), ("rejected", "Отклонено"), ("rework", "Доработка")]
    job = models.ForeignKey(Job, on_delete=models.PROTECT, related_name="quality_checks", verbose_name="Задание")
    result = models.CharField("Результат", max_length=15, choices=RESULTS)
    quantity = models.PositiveIntegerField("Количество")
    defect = models.TextField("Дефект", blank=True)
    decision = models.TextField("Решение", blank=True)
    repeated = models.BooleanField("Повторное предъявление", default=False)
    date = models.DateField("Дата", default=timezone.localdate)
    inspector = models.ForeignKey(Employee, on_delete=models.PROTECT, verbose_name="Контролер")

    class Meta:
        verbose_name = "Контроль качества"
        verbose_name_plural = "Контроль качества"

    def clean(self):
        if self.job_id and self.quantity > self.job.quantity:
            raise ValidationError("Количество превышает объем задания.")
        if self.job_id and self.result == "accepted":
            previous = QualityCheck.objects.filter(job=self.job, result="accepted").exclude(pk=self.pk).aggregate(v=Sum("quantity"))["v"] or 0
            if previous + self.quantity > self.job.quantity:
                raise ValidationError("Суммарный объем контроля превышает задание.")
        if self.result in ("rejected", "rework") and not self.defect:
            raise ValidationError("Укажите дефект.")
        if self.result in ("rejected", "rework") and not self.decision:
            raise ValidationError("Укажите решение по несоответствию.")


class Material(NamedModel):
    code = models.CharField("Код материала", max_length=50, unique=True)
    unit = models.CharField("Единица", max_length=20, default="кг")
    stock_quantity = models.DecimalField("Остаток", max_digits=12, decimal_places=3, default=0)
    reserved_quantity = models.DecimalField("Зарезервировано", max_digits=12, decimal_places=3, default=0)

    class Meta:
        verbose_name = "Материал"
        verbose_name_plural = "Материалы"

    @property
    def available_quantity(self):
        return self.stock_quantity - self.reserved_quantity


class CuttingNorm(models.Model):
    operation = models.OneToOneField(RouteOperation, on_delete=models.PROTECT, related_name="cutting_norm",
        verbose_name="Операция маршрута")
    material = models.ForeignKey(Material, on_delete=models.PROTECT, verbose_name="Материал")
    tool = models.CharField("Режущий инструмент", max_length=200)
    source_document = models.CharField("Источник норматива", max_length=200)
    cutting_speed_m_min = models.DecimalField("Скорость резания, м/мин", max_digits=9, decimal_places=3)
    diameter_mm = models.DecimalField("Диаметр, мм", max_digits=9, decimal_places=3)
    feed_mm_rev = models.DecimalField("Подача, мм/об/зуб", max_digits=9, decimal_places=4)
    teeth = models.PositiveSmallIntegerField("Число зубьев", default=1)
    pass_length_mm = models.DecimalField("Длина прохода, мм", max_digits=10, decimal_places=3)
    passes = models.PositiveSmallIntegerField("Число проходов", default=1)
    approved = models.BooleanField("Утвержден", default=False)

    class Meta:
        verbose_name = "Норматив режима резания"
        verbose_name_plural = "Нормативы режимов резания"

    def clean(self):
        if self.operation_id and self.operation.kind != "machining":
            raise ValidationError("Режим резания применим только к механообработке.")
        if self.approved and not self.source_document.strip():
            raise ValidationError("Для утверждения укажите источник норматива.")
        for field in ("cutting_speed_m_min", "diameter_mm", "feed_mm_rev", "pass_length_mm"):
            value = getattr(self, field)
            if value is not None and value <= 0:
                raise ValidationError("Параметры режима должны быть положительными.")
        if self.teeth < 1 or self.passes < 1:
            raise ValidationError("Число зубьев и проходов должно быть положительным.")

    @property
    def spindle_rpm(self):
        return Decimal("1000") * self.cutting_speed_m_min / (Decimal("3.141592653589793") * self.diameter_mm)

    @property
    def feed_mm_min(self):
        return self.feed_mm_rev * self.teeth * self.spindle_rpm

    @property
    def machine_hours(self):
        return (self.pass_length_mm * self.passes / self.feed_mm_min / Decimal("60")).quantize(Decimal("0.001"))

    def __str__(self):
        return f"{self.operation}: {self.material} / {self.tool}"


class MaterialRequirement(models.Model):
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, verbose_name="Позиция заказа")
    material = models.ForeignKey(Material, on_delete=models.PROTECT, verbose_name="Материал")
    quantity_per_item = models.DecimalField("Норма на изделие", max_digits=10, decimal_places=3)
    reserved = models.DecimalField("Резерв под заказ", max_digits=12, decimal_places=3, default=0)

    class Meta:
        verbose_name = "Потребность в материале"
        verbose_name_plural = "Потребности в материалах"

    @property
    def required(self):
        return self.quantity_per_item * self.order_item.quantity

    @property
    def deficit(self):
        return max(self.required - self.reserved, Decimal("0"))


class Downtime(models.Model):
    job = models.ForeignKey(Job, on_delete=models.PROTECT, verbose_name="Задание")
    reason = models.CharField("Причина", max_length=100, choices=[(x, x) for x in ["Нет материала", "Неисправность оборудования", "Нехватка персонала", "Технологическая проблема", "Контроль качества", "Прочее"]])
    hours = models.DecimalField("Часов", max_digits=8, decimal_places=2)
    date = models.DateField("Дата", default=timezone.localdate)
    note = models.TextField("Примечание", blank=True)

    class Meta:
        verbose_name = "Простой"
        verbose_name_plural = "Простои"


class TimesheetEntry(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name="timesheets", verbose_name="Сотрудник")
    month = models.DateField("Месяц")
    planned_hours = models.DecimalField("План, ч", max_digits=8, decimal_places=2, default=0)
    actual_hours = models.DecimalField("Факт, ч", max_digits=8, decimal_places=2, default=0)
    absent_hours = models.DecimalField("Неявка, ч", max_digits=8, decimal_places=2, default=0)
    overtime_hours = models.DecimalField("Сверхурочно, ч", max_digits=8, decimal_places=2, default=0)
    output_hours = models.DecimalField("Выработка, н-ч", max_digits=8, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Строка табеля"
        verbose_name_plural = "Табель рабочего времени"
        constraints = [models.UniqueConstraint(fields=["employee", "month"], name="unique_employee_timesheet_month")]

    def clean(self):
        for field in ("planned_hours", "actual_hours", "absent_hours", "overtime_hours", "output_hours"):
            if getattr(self, field) < 0:
                raise ValidationError("Часы табеля не могут быть отрицательными.")
        if self.month and self.month.day != 1:
            raise ValidationError("Период табеля должен начинаться с первого числа месяца.")

    @property
    def output_ratio(self):
        return self.output_hours / self.actual_hours if self.actual_hours else Decimal("0")

    @property
    def load_ratio(self):
        return self.actual_hours / self.planned_hours if self.planned_hours else Decimal("0")


class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    model_name = models.CharField(max_length=80)
    object_id = models.PositiveBigIntegerField()
    action = models.CharField(max_length=20)
    reason = models.TextField(blank=True)
    before = models.JSONField(default=dict)
    after = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Запись журнала"
        verbose_name_plural = "Журнал изменений"


class LegacyTable(models.Model):
    key = models.CharField(max_length=80, unique=True)
    rows = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Таблица прежнего интерфейса"
        verbose_name_plural = "Таблицы прежнего интерфейса"
