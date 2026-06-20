from django.db import models
from django.conf import settings


class GeoNote(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="geo_notes"
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    audio_url = models.URLField(blank=True)
    transcript = models.TextField(blank=True)
    radius_meters = models.PositiveIntegerField(default=100)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "geo_notes"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["latitude", "longitude"])]

    def __str__(self):
        return f"GeoNote[{self.pk}] at ({self.latitude},{self.longitude})"
