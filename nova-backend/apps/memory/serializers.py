from rest_framework import serializers
from .models import Memory


class MemorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Memory
        fields = ["id", "content", "tags", "relevance_score", "created_at"]
        read_only_fields = ["id", "relevance_score", "created_at"]
