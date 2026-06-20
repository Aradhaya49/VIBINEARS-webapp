from django.db import models
from django.conf import settings


class Memory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memories"
    )
    content = models.TextField()
    # Serialised float list — in production replace with pgvector or Pinecone
    embedding = models.JSONField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    relevance_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "memories"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "created_at"])]

    def __str__(self):
        return f"Memory[{self.pk}] for {self.user_id}"
