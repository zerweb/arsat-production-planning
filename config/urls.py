from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.views.static import serve
from django.views.generic import RedirectView

urlpatterns = [
    path("favicon.ico", RedirectView.as_view(url="/static/production/legacy/assets/favicon.svg", permanent=True)),
    path("django-admin/", admin.site.urls),
    path("", include("production.urls")),
]
urlpatterns += [
    path("assets/<path:path>", serve, {"document_root": settings.STATIC_ROOT / "production" / "legacy" / "assets"}),
    path("static/<path:path>", serve, {"document_root": settings.STATIC_ROOT}),
]
