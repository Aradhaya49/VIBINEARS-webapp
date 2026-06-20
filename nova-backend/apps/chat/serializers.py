from rest_framework import serializers
from apps.auth_app.serializers import UserSerializer
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = [
            "id", "conversation", "sender", "content",
            "message_type", "audio_url", "translated_content",
            "is_read", "metadata", "created_at",
        ]
        read_only_fields = [
            "id",
            "conversation",
            "sender",
            "created_at",
            "is_read",
        ]




class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "participants", "last_message", "unread_count", "created_at", "updated_at"]

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return MessageSerializer(msg).data if msg else None

    def get_unread_count(self, obj):
        user = self.context["request"].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
