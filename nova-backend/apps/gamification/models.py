from django.db import models
from django.conf import settings


class GamificationStats(models.Model):
    class Tier(models.TextChoices):
        BRONZE = "BRONZE", "Bronze"
        SILVER = "SILVER", "Silver"
        GOLD = "GOLD", "Gold"
        PLATINUM = "PLATINUM", "Platinum"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gamification_stats"
    )
    party_streak = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vip_points = models.PositiveIntegerField(default=0)
    tier = models.CharField(max_length=20, choices=Tier.choices, default=Tier.BRONZE)
    last_activity = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "gamification_stats"

    def __str__(self):
        return f"Stats[{self.user_id}] tier={self.tier}"

    def recalculate_tier(self):
        if self.vip_points >= 5000:
            self.tier = self.Tier.PLATINUM
        elif self.vip_points >= 2000:
            self.tier = self.Tier.GOLD
        elif self.vip_points >= 500:
            self.tier = self.Tier.SILVER
        else:
            self.tier = self.Tier.BRONZE


class Badge(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="badges"
    )
    name = models.CharField(max_length=100)
    icon_url = models.URLField(blank=True)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "badges"

    def __str__(self):
        return f"{self.name} → {self.user_id}"


class Order(models.Model):
    class OrderStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders"
    )
    venue_id = models.CharField(max_length=100)
    items = models.JSONField(default=list)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.CONFIRMED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order[{self.pk}] ${self.total_amount} ({self.status})"
