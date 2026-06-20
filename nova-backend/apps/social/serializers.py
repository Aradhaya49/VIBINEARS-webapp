from rest_framework import serializers
from apps.auth_app.serializers import UserSerializer
from .models import Connection


class ConnectionSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = Connection
        fields = ["id", "from_user", "to_user", "status", "created_at"]
        read_only_fields = ["id", "from_user", "status", "created_at"]


class NearbyUserSerializer(UserSerializer):
    distance_meters = serializers.FloatField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields
