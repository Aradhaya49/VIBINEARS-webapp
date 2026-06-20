from rest_framework import serializers
from .models import GeoNote


class GeoNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoNote
        fields = [
            "id", "latitude", "longitude", "audio_url",
            "transcript", "radius_meters", "expires_at", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
