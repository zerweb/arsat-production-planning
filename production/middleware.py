from django.core.exceptions import PermissionDenied
from django.utils.cache import patch_cache_control


VALID_ROLES = frozenset({
    "admin", "manager", "planner", "technologist", "normalizer", "supervisor", "economist",
})


class AssignedRoleRequiredMiddleware:
    """Deny application access to accounts without one unambiguous assigned role."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated and not request.path.startswith(("/static/", "/assets/")):
            patch_cache_control(response, private=True, no_store=True)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        user = request.user
        if not user.is_authenticated or user.is_superuser:
            return None
        groups = list(user.groups.values_list("name", flat=True))
        if len(groups) != 1 or groups[0] not in VALID_ROLES:
            raise PermissionDenied("Для доступа назначьте одну роль пользователя")
        return None
