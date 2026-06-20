from django.urls import path
from .views import recall, MemoryCreateView

urlpatterns = [
    path("search/", recall, name="memory-search"),
    path("store/", MemoryCreateView.as_view(), name="memory-store"),
]
