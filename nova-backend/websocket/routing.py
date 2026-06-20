from django.urls import re_path
from .consumers import NovaConsumer, SosConsumer

websocket_urlpatterns = [
    re_path(r"^ws/$", NovaConsumer.as_asgi()),
    re_path(r"^ws/sos/(?P<event_id>\d+)/$", SosConsumer.as_asgi()),
]
