from django.urls import path
from .views import ConversationListView, ConversationCreateView, MessageListCreateView, suggest_reply

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversations"),
    path("conversations/create/", ConversationCreateView.as_view(), name="conversation-create"),
    path("conversations/<int:conv_id>/messages/", MessageListCreateView.as_view(), name="messages"),
    path("suggest-reply/", suggest_reply, name="suggest-reply"),
]
