from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/auth/", include("apps.auth_app.urls")),

    # Features
    path("api/social/", include("apps.social.urls")),
    path("api/chat/", include("apps.chat.urls")),
    path("api/ai/", include("apps.ai_service.urls")),
    path("api/memory/", include("apps.memory.urls")),
    path("api/sos/", include("apps.sos.urls")),
    path("api/location/", include("apps.location.urls")),
    path("api/gamification/", include("apps.gamification.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
