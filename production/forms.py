from django import forms
from django.contrib.auth.models import User
from . import models


REGISTRY = {
    "orders": (models.Order, "Портфель заказов", "Заказ"),
    "items": (models.OrderItem, "Состав заказов", "Позиция заказа"),
    "programs": (models.Program, "Производственные программы", "Программа"),
    "lines": (models.ProgramLine, "План выпуска", "Строка программы"),
    "jobs": (models.Job, "Производственные задания", "Задание"),
    "events": (models.ProductionEvent, "Выпуск и сдача", "Движение продукции"),
    "quality": (models.QualityCheck, "Контроль качества", "Результат контроля"),
    "materials": (models.Material, "Материалы", "Материал"),
    "requirements": (models.MaterialRequirement, "Обеспеченность", "Потребность"),
    "downtime": (models.Downtime, "Простои", "Простой"),
    "products": (models.Product, "Изделия", "Изделие"),
    "routes": (models.RouteOperation, "Технологические маршруты", "Операция"),
    "cutting-norms": (models.CuttingNorm, "Режимы резания", "Норматив режима резания"),
    "customers": (models.Customer, "Заказчики", "Заказчик"),
    "departments": (models.Department, "Подразделения", "Подразделение"),
    "centers": (models.WorkCenter, "Рабочие центры", "Рабочий центр"),
    "equipment": (models.Equipment, "Оборудование", "Единица оборудования"),
    "employees": (models.Employee, "Сотрудники", "Сотрудник"),
}

EXCLUDED = {"created_at", "updated_at", "archived", "actor"}


def form_for(key, *args, **kwargs):
    model = REGISTRY[key][0]
    fields = [f.name for f in model._meta.fields if f.editable and not f.primary_key and f.name not in EXCLUDED]
    if key == "requirements":
        fields.remove("reserved")

    class RecordForm(forms.modelform_factory(model, fields=fields)):
        def __init__(self, *a, **kw):
            super().__init__(*a, **kw)
            for name, field in self.fields.items():
                if isinstance(field, forms.DateField):
                    field.widget = forms.DateInput(attrs={"type": "date"}, format="%Y-%m-%d")
                    field.input_formats = ["%Y-%m-%d"]
                if name in ("quantity", "actual_quantity", "priority"):
                    field.widget.attrs["min"] = "0" if name == "actual_quantity" else "1"
            if key == "jobs":
                self.fields["program_line"].queryset = models.ProgramLine.objects.filter(program__status__in=["approved", "revised"])

    return RecordForm(*args, **kwargs)


class LoginForm(forms.Form):
    username = forms.CharField(label="Логин")
    password = forms.CharField(label="Пароль", widget=forms.PasswordInput)


class UserForm(forms.ModelForm):
    password = forms.CharField(label="Новый пароль", required=False, widget=forms.PasswordInput)
    role = forms.ChoiceField(label="Роль", choices=[
        ("admin", "Администратор"), ("manager", "Руководитель"),
        ("planner", "Планировщик / диспетчер"), ("technologist", "Технолог"),
        ("normalizer", "Нормировщик"), ("supervisor", "Начальник участка"),
        ("economist", "Экономист"),
    ])

    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "email", "is_active"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            role = self.instance.groups.first()
            self.fields["role"].initial = role.name if role else "technologist"

    def clean_password(self):
        from django.contrib.auth.password_validation import validate_password
        password = self.cleaned_data.get("password")
        if password:
            validate_password(password, self.instance)
        return password

    def save(self, commit=True):
        from django.contrib.auth.models import Group
        user = super().save(commit=False)
        if self.cleaned_data.get("password"):
            user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
            group, _ = Group.objects.get_or_create(name=self.cleaned_data["role"])
            user.groups.set([group])
        return user
