from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    is_open_to_talk = models.BooleanField(default=False)

    # Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    location_updated_at = models.DateTimeField(null=True, blank=True)

    # Gamification
    is_vip = models.BooleanField(default=False)
    party_streak = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    #settings

    two_factor_enabled = models.BooleanField(default=False)
    is_disabled = models.BooleanField(default=False)



    class Meta:
        db_table = "users"

    def __str__(self):
        return self.username


class EmergencyContact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="emergency_contacts")
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    relation = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "emergency_contacts"

    def __str__(self):
        return f"{self.name} ({self.user.username})"
