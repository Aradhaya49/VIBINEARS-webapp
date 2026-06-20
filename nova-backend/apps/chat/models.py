from django.db import models
from django.conf import settings


class Conversation(models.Model):
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="conversations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "conversations"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Conversation {self.pk}"


class Message(models.Model):
    class MessageType(models.TextChoices):
        TEXT = "text", "Text"
        AUDIO = "audio", "Audio"
        SYSTEM = "system", "System"

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="sent_messages"
    )
    content = models.TextField(blank=True)
    message_type = models.CharField(max_length=10, choices=MessageType.choices, default=MessageType.TEXT)
    audio_url = models.URLField(blank=True)
    translated_content = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "messages"
        ordering = ["created_at"]
        indexes = [models.Index(fields=["conversation", "created_at"])]

    def __str__(self):
        return f"Message {self.pk} in {self.conversation_id}"
