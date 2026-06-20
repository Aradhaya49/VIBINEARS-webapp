"""
Async Celery tasks for Nova backend.
"""
import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=5)
def notify_emergency_contacts_task(self, sos_event_pk: int, user_pk: int):
    """Send email/SMS notifications to emergency contacts when SOS is triggered."""
    try:
        from apps.sos.models import SosEvent
        from apps.auth_app.models import EmergencyContact, User

        event = SosEvent.objects.get(pk=sos_event_pk)
        user = User.objects.get(pk=user_pk)
        contacts = EmergencyContact.objects.filter(user=user)

        maps_link = f"https://maps.google.com/?q={event.latitude},{event.longitude}"
        subject = f"🚨 SOS Alert from {user.get_full_name() or user.username}"
        body = (
            f"{user.get_full_name() or user.username} has triggered an SOS alert.\n\n"
            f"Trigger type: {event.trigger_type}\n"
            f"Time: {event.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
            f"Location: {maps_link}\n\n"
            f"Please contact them immediately or call emergency services if needed."
        )

        emails = [c.email for c in contacts if hasattr(c, "email") and c.email]
        if emails:
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=emails,
                fail_silently=False,
            )
            logger.info("SOS notifications sent to %d contacts for event %d", len(emails), sos_event_pk)
        else:
            logger.warning("No email contacts for user %d, SOS event %d", user_pk, sos_event_pk)

    except Exception as exc:
        logger.error("notify_emergency_contacts_task failed: %s", exc)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=2)
def index_memory_embedding_task(self, memory_pk: int):
    """
    Generate and store vector embedding for a memory entry.
    Swap the mock logic for a real embedding API call in production.
    """
    try:
        from apps.memory.models import Memory
        memory = Memory.objects.get(pk=memory_pk)

        if settings.ENABLE_REAL_OPENAI and settings.OPENAI_API_KEY:
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=memory.content,
            )
            embedding = response.data[0].embedding
        else:
            # Mock 1536-dim embedding
            import hashlib
            h = int(hashlib.md5(memory.content.encode()).hexdigest(), 16)
            embedding = [(h >> i & 0xFF) / 255.0 for i in range(1536)]

        memory.embedding = embedding
        memory.save(update_fields=["embedding"])
        logger.info("Embedding stored for memory %d", memory_pk)

    except Exception as exc:
        logger.error("index_memory_embedding_task failed: %s", exc)
        raise self.retry(exc=exc)


@shared_task
def process_ai_intent_task(transcript: str, user_pk: int, context: dict = None):
    """Async intent classification — for heavy LLM calls that shouldn't block the request."""
    from apps.ai_service.services import classify_intent
    result = classify_intent(transcript, context or {})
    logger.info("Async intent for user %d: %s", user_pk, result.get("intent"))
    return result


@shared_task
def send_push_notification_task(user_pk: int, title: str, body: str, data: dict = None):
    """
    Placeholder for FCM push notifications.
    Replace with firebase-admin SDK calls in production.
    """
    logger.info("PUSH → user=%d | %s: %s | data=%s", user_pk, title, body, data)
    # TODO: integrate firebase_admin.messaging.send()


@shared_task
def cleanup_expired_geo_notes_task():
    """Periodic task: remove expired geo notes. Schedule via Celery Beat."""
    from apps.location.models import GeoNote
    from django.utils import timezone
    deleted, _ = GeoNote.objects.filter(expires_at__lt=timezone.now()).delete()
    logger.info("Deleted %d expired geo notes", deleted)


@shared_task
def recalculate_gamification_tiers_task():
    """Periodic task: recalculate tiers for all users. Schedule daily via Celery Beat."""
    from apps.gamification.models import GamificationStats
    stats = GamificationStats.objects.all()
    for s in stats:
        s.recalculate_tier()
    GamificationStats.objects.bulk_update(stats, ["tier"])
    logger.info("Recalculated tiers for %d users", len(stats))
