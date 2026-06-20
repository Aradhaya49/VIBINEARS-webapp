from django.urls import path
from .views import (
    nearby_users, open_to_talk, update_location,
    SendConnectionView, RespondConnectionView, icebreaker,
)

urlpatterns = [
    path("nearby/", nearby_users, name="nearby-users"),
    path("open-to-talk/", open_to_talk, name="open-to-talk"),
    path("location/", update_location, name="update-location"),
    path("connect/<int:user_id>/", SendConnectionView.as_view(), name="send-connection"),
    path("connect/<int:pk>/respond/", RespondConnectionView.as_view(), name="respond-connection"),
    path("icebreaker/<int:user_id>/", icebreaker, name="icebreaker"),
]
