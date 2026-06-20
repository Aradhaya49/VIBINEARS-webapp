# Nova Backend

Production-ready Django backend for the Nova social audio platform.

## Stack

| Layer | Technology |
|---|---|
| Framework | Django 4.2 + Django REST Framework |
| ASGI / WebSockets | Daphne + Django Channels |
| Database | PostgreSQL 15 |
| Cache / Pub-Sub | Redis 7 |
| Background tasks | Celery 5 + Celery Beat |
| Auth | JWT (djangorestframework-simplejwt) |
| AI | OpenAI (mock fallback, no key required) |

## Quick Start (Docker)

```bash
cp .env.example .env
# edit .env — set SECRET_KEY at minimum
docker compose up --build
```

API available at `http://localhost:8000/api/`
WebSocket at `ws://localhost:8000/ws/?token=<access_token>`

## Quick Start (local)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # configure DB + Redis
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Start Celery worker (separate terminal):
```bash
celery -A tasks.celery worker --loglevel=info
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register/ | Register |
| POST | /api/auth/login/ | Login → JWT |
| POST | /api/auth/refresh/ | Refresh token |
| GET | /api/social/nearby/ | Nearby users |
| PUT | /api/social/open-to-talk/ | Toggle availability |
| PUT | /api/social/location/ | Update location |
| POST | /api/social/connect/{id}/ | Send connection request |
| PUT | /api/social/connect/{id}/respond/ | Accept/reject |
| GET | /api/social/icebreaker/{id}/ | AI icebreaker |
| GET | /api/chat/conversations/ | List conversations |
| POST | /api/chat/conversations/{id}/messages/ | Send message |
| GET | /api/chat/suggest-reply/ | AI reply suggestions |
| POST | /api/ai/intent/ | Voice intent classification |
| POST | /api/ai/translate/ | Text translation |
| POST | /api/ai/suggest/ | Conversation suggestions |
| GET | /api/memory/search/ | Semantic memory recall |
| POST | /api/memory/store/ | Store memory |
| POST | /api/sos/trigger/ | Trigger SOS |
| PUT | /api/sos/{id}/resolve/ | Resolve SOS |
| GET | /api/gamification/stats/ | VIP stats + badges |
| POST | /api/gamification/order/ | Place venue order |
| GET | /api/location/voice-notes/nearby/ | Nearby geo notes |

## WebSocket Events

Connect: `ws://host/ws/?token=<jwt>`

Send: `{"type": "message", "conversation_id": 1, "content": "hey"}`
Send: `{"type": "presence", "is_open_to_talk": true}`
Send: `{"type": "typing", "conversation_id": 1, "is_typing": true}`
Send: `{"type": "webrtc_offer", "peer_id": 2, "sdp": "..."}`

## Environment Variables

See `.env.example` for all variables. Required ones:
- `SECRET_KEY` — Django secret key
- `DB_*` — PostgreSQL connection
- `REDIS_URL` — Redis URL
- `OPENAI_API_KEY` — Optional; app works without it using mock AI
