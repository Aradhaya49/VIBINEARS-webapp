from django.db import models
from django.conf import settings


class Connection(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        BLOCKED = "blocked", "Blocked"

    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_connections"
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_connections"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "connections"
        unique_together = [("from_user", "to_user")]
        indexes = [
            models.Index(fields=["from_user", "status"]),
            models.Index(fields=["to_user", "status"]),
        ]

    def __str__(self):
        return f"{self.from_user} → {self.to_user} ({self.status})"
