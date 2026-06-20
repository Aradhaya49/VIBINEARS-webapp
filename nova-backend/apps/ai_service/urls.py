from django.urls import path
from .views import process_intent, translate, suggest

urlpatterns = [
    path("intent/", process_intent, name="ai-intent"),
    path("translate/", translate, name="ai-translate"),
    path("suggest/", suggest, name="ai-suggest"),
]
