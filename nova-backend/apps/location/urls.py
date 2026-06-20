from django.urls import path
from .views import nearby_geo_notes, GeoNoteCreateView

urlpatterns = [
    path("voice-notes/nearby/", nearby_geo_notes, name="geo-notes-nearby"),
    path("voice-notes/", GeoNoteCreateView.as_view(), name="geo-note-create"),
]
