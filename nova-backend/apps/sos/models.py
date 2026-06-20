from django.db import models
from django.conf import settings


class SosEvent(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        RESOLVED = "RESOLVED", "Resolved"
        CANCELLED = "CANCELLED", "Cancelled"

    class TriggerType(models.TextChoices):
        MANUAL = "MANUAL", "Manual"
        VOICE = "VOICE", "Voice"
        SHAKE = "SHAKE", "Shake"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sos_events"
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    trigger_type = models.CharField(max_length=10, choices=TriggerType.choices, default=TriggerType.MANUAL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    audio_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "sos_events"
        ordering = ["-created_at"]

    def __str__(self):
        return f"SOS[{self.pk}] by {self.user_id} ({self.status})"
