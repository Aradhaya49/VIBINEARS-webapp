from django.urls import path
from .views import trigger_sos, resolve_sos, sos_history

urlpatterns = [
    path("trigger/", trigger_sos, name="sos-trigger"),
    path("<int:pk>/resolve/", resolve_sos, name="sos-resolve"),
    path("history/", sos_history, name="sos-history"),
]
