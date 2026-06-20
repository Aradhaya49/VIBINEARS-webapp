from rest_framework import serializers
from .models import SosEvent


class SosEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SosEvent
        fields = [
            "id", "latitude", "longitude", "trigger_type",
            "status", "audio_url", "notes", "created_at", "resolved_at",
        ]
        read_only_fields = ["id", "status", "created_at", "resolved_at"]
