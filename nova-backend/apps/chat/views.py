from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from apps.auth_app.models import User

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects.filter(
                participants=self.request.user
            )
            .prefetch_related(
                "participants",
                "messages",
            )
            .order_by("-updated_at")
        )


class ConversationCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        other_user_id = request.data.get("user_id")

        if not other_user_id:
            return Response(
                {"detail": "user_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            other_user = User.objects.get(pk=other_user_id)

        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Prevent self chat
        if other_user == request.user:
            return Response(
                {"detail": "Cannot create conversation with yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Return existing conversation
        existing = (
            Conversation.objects.filter(
                participants=request.user
            )
            .filter(
                participants=other_user
            )
            .first()
        )

        if existing:
            serializer = ConversationSerializer(
                existing,
                context={"request": request},
            )

            return Response(serializer.data)

        # Create new conversation
        conversation = Conversation.objects.create()

        conversation.participants.add(
            request.user,
            other_user,
        )

        serializer = ConversationSerializer(
            conversation,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_conversation(self):
        conv_id = self.kwargs["conv_id"]

        try:
            conversation = Conversation.objects.get(
                pk=conv_id,
                participants=self.request.user,
            )

            return conversation

        except Conversation.DoesNotExist:
            raise PermissionDenied(
                "Conversation not found."
            )

    def get_queryset(self):
        conversation = self.get_conversation()

        # MARK OTHER USER MESSAGES AS READ
        Message.objects.filter(
            conversation=conversation,
            is_read=False,
        ).exclude(
            sender=self.request.user
        ).update(is_read=True)

        return (
            Message.objects.filter(
                conversation=conversation
            )
            .select_related("sender")
            .order_by("created_at")
        )

    def perform_create(self, serializer):
        conversation = self.get_conversation()

        serializer.save(
            sender=self.request.user,
            conversation=conversation,
        )

        # Update conversation timestamp
        conversation.save()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def suggest_reply(request):
    conversation_id = request.query_params.get(
        "conversationId"
    )

    suggestions = [
        "Still here! Near the bar 🍹",
        "Heading out soon, want to meet up?",
        "Just left actually, great night though!",
    ]

    return Response(
        {"suggestions": suggestions}
    )