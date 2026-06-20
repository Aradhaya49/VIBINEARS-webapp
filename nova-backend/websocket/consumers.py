"""
Nova WebSocket consumers.

NovaConsumer  — handles presence, chat messages, typing indicators,
                WebRTC signalling, and connection requests.
SosConsumer   — dedicated channel for live SOS audio streaming sessions.

Events (client → server):
  { "type": "presence",       "is_open_to_talk": true }
  { "type": "message",        "conversation_id": 1, "content": "hey" }
  { "type": "typing",         "conversation_id": 1, "is_typing": true }
  { "type": "webrtc_offer",   "peer_id": 2, "sdp": "..." }
  { "type": "webrtc_answer",  "peer_id": 2, "sdp": "..." }
  { "type": "webrtc_ice",     "peer_id": 2, "sdp_mid": "audio", "sdp_m_line_index": 0, "sdp": "..." }

Events (server → client):
  { "type": "presence",        "user_id": 2, "is_online": true, "is_open_to_talk": true }
  { "type": "message",         "conversation_id": 1, "message": {...} }
  { "type": "typing",          "conversation_id": 1, "user_id": 2, "is_typing": true }
  { "type": "connection_request", "request": {...} }
  { "type": "webrtc_offer",    "from_user_id": 2, "sdp": "..." }
  { "type": "webrtc_answer",   "from_user_id": 2, "sdp": "..." }
  { "type": "webrtc_ice",      "from_user_id": 2, ... }
  { "type": "error",           "message": "..." }
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

PRESENCE_GROUP = "nova_presence"


class NovaConsumer(AsyncWebsocketConsumer):
    # ── lifecycle ─────────────────────────────────────────────────────────────

    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.close(code=4001)
            return

        self.user = self.scope["user"]
        self.user_group = f"user_{self.user.pk}"

        # Join personal group + global presence group
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.channel_layer.group_add(PRESENCE_GROUP, self.channel_name)
        await self.accept()

        # Broadcast online status
        await self._broadcast_presence(is_online=True)

    async def disconnect(self, close_code):
        if not hasattr(self, "user"):
            return
        await self._broadcast_presence(is_online=False)
        await self.channel_layer.group_discard(self.user_group, self.channel_name)
        await self.channel_layer.group_discard(PRESENCE_GROUP, self.channel_name)

    # ── inbound dispatch ──────────────────────────────────────────────────────

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self._send_error("Invalid JSON")
            return

        event_type = data.get("type")
        handlers = {
            "presence": self._handle_presence,
            "message": self._handle_message,
            "typing": self._handle_typing,
            "webrtc_offer": self._handle_webrtc,
            "webrtc_answer": self._handle_webrtc,
            "webrtc_ice": self._handle_webrtc,
        }
        handler = handlers.get(event_type)
        if handler:
            await handler(data)
        else:
            await self._send_error(f"Unknown event type: {event_type}")

    # ── handlers ──────────────────────────────────────────────────────────────

    async def _handle_presence(self, data):
        is_open = data.get("is_open_to_talk", False)
        await self._save_open_to_talk(is_open)
        await self._broadcast_presence(is_online=True, is_open_to_talk=is_open)

    async def _handle_message(self, data):
        conv_id = data.get("conversation_id")
        content = data.get("content", "").strip()
        if not conv_id or not content:
            return

        message = await self._save_message(conv_id, content)
        if not message:
            return

        # Send to all participants in this conversation
        await self.channel_layer.group_send(
            f"conversation_{conv_id}",
            {
                "type": "chat_message",
                "conversation_id": conv_id,
                "message": {
                    "id": message["id"],
                    "sender_id": self.user.pk,
                    "content": content,
                    "created_at": message["created_at"],
                },
            },
        )

    async def _handle_typing(self, data):
        conv_id = data.get("conversation_id")
        is_typing = data.get("is_typing", False)
        if not conv_id:
            return
        await self.channel_layer.group_send(
            f"conversation_{conv_id}",
            {
                "type": "typing_indicator",
                "conversation_id": conv_id,
                "user_id": self.user.pk,
                "is_typing": is_typing,
            },
        )

    async def _handle_webrtc(self, data):
        peer_id = data.get("peer_id")
        if not peer_id:
            return
        await self.channel_layer.group_send(
            f"user_{peer_id}",
            {
                "type": "webrtc_signal",
                "event_type": data.get("type"),
                "from_user_id": self.user.pk,
                "payload": data,
            },
        )

    # ── channel layer message handlers ────────────────────────────────────────

    async def presence_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "presence",
            "user_id": event["user_id"],
            "is_online": event["is_online"],
            "is_open_to_talk": event.get("is_open_to_talk", False),
        }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "conversation_id": event["conversation_id"],
            "message": event["message"],
        }))

    async def typing_indicator(self, event):
        if event["user_id"] == self.user.pk:
            return  # don't echo back to sender
        await self.send(text_data=json.dumps({
            "type": "typing",
            "conversation_id": event["conversation_id"],
            "user_id": event["user_id"],
            "is_typing": event["is_typing"],
        }))

    async def webrtc_signal(self, event):
        payload = event["payload"]
        payload["from_user_id"] = event["from_user_id"]
        await self.send(text_data=json.dumps(payload))

    async def connection_request(self, event):
        await self.send(text_data=json.dumps({
            "type": "connection_request",
            "request": event["request"],
        }))

    async def sos_alert(self, event):
        await self.send(text_data=json.dumps({
            "type": "sos_alert",
            "user_id": event["user_id"],
            "latitude": event["latitude"],
            "longitude": event["longitude"],
        }))

    # ── helpers ───────────────────────────────────────────────────────────────

    async def _broadcast_presence(self, is_online: bool, is_open_to_talk: bool = False):
        await self.channel_layer.group_send(
            PRESENCE_GROUP,
            {
                "type": "presence_update",
                "user_id": self.user.pk,
                "is_online": is_online,
                "is_open_to_talk": is_open_to_talk,
            },
        )

    async def _send_error(self, message: str):
        await self.send(text_data=json.dumps({"type": "error", "message": message}))

    @database_sync_to_async
    def _save_open_to_talk(self, value: bool):
        User.objects.filter(pk=self.user.pk).update(is_open_to_talk=value)

    @database_sync_to_async
    def _save_message(self, conv_id: int, content: str):
        from apps.chat.models import Conversation, Message
        try:
            conv = Conversation.objects.get(pk=conv_id, participants=self.user)
        except Conversation.DoesNotExist:
            return None
        msg = Message.objects.create(
            conversation=conv,
            sender=self.user,
            content=content,
        )
        conv.save()
        return {"id": msg.pk, "created_at": msg.created_at.isoformat()}


# ── SOS consumer ──────────────────────────────────────────────────────────────


class SosConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        try:
            # Debug logs
            print("=== SOS CONNECT START ===")
            print("USER:", self.scope.get("user"))
            print("QUERY STRING:", self.scope.get("query_string"))

            # Authentication check
            user = self.scope.get("user")

            if not user or not user.is_authenticated:
                print("AUTHENTICATION FAILED")
                await self.close(code=4001)
                return

            self.user = user

            # Get event id from websocket URL
            self.event_id = self.scope["url_route"]["kwargs"].get("event_id")

            if not self.event_id:
                print("EVENT ID MISSING")
                await self.close(code=4002)
                return

            print("EVENT ID:", self.event_id)

            # Create websocket group
            self.group_name = f"sos_{self.event_id}"

            # Join websocket group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name,
            )

            # Accept websocket connection
            await self.accept()

            print("SOS WEBSOCKET CONNECTED")

            # Notify listeners
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "sos_stream_start",
                    "user_id": self.user.pk,
                },
            )

        except Exception as e:
            print("SOS CONNECTION ERROR:", str(e))
            await self.close(code=4000)

    async def disconnect(self, close_code):
        try:
            print("SOS DISCONNECTED:", close_code)

            if hasattr(self, "group_name"):
                await self.channel_layer.group_discard(
                    self.group_name,
                    self.channel_name,
                )

        except Exception as e:
            print("DISCONNECT ERROR:", str(e))

    async def receive(self, text_data=None, bytes_data=None):
        try:
            # Forward audio stream
            if bytes_data:
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "sos_audio_chunk",
                        "data": bytes_data.hex(),
                    },
                )

            # Optional text handling
            if text_data:
                print("TEXT DATA:", text_data)

        except Exception as e:
            print("RECEIVE ERROR:", str(e))

    async def sos_stream_start(self, event):
        try:
            await self.send(
                text_data=json.dumps({
                    "type": "sos_stream_start",
                    "user_id": event["user_id"],
                })
            )

        except Exception as e:
            print("STREAM START ERROR:", str(e))

    async def sos_audio_chunk(self, event):
        try:
            await self.send(
                bytes_data=bytes.fromhex(event["data"])
            )

        except Exception as e:
            print("AUDIO CHUNK ERROR:", str(e))