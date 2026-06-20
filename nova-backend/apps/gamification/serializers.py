from rest_framework import serializers
from .models import GamificationStats, Badge, Order


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ["id", "name", "icon_url", "earned_at"]


class GamificationStatsSerializer(serializers.ModelSerializer):
    badges = BadgeSerializer(source="user.badges", many=True, read_only=True)

    class Meta:
        model = GamificationStats
        fields = [
            "party_streak", "total_spent", "vip_points", "tier",
            "last_activity", "badges",
        ]


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["id", "venue_id", "items", "total_amount", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]
