from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from tasks.celery_tasks import notify_emergency_contacts_task
from .models import SosEvent
from .serializers import SosEventSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def trigger_sos(request):
    serializer = SosEventSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    event = serializer.save(user=request.user)

    # Fire async Celery task to notify contacts
    notify_emergency_contacts_task.delay(event.pk, request.user.pk)

    return Response(
        SosEventSerializer(event).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def resolve_sos(request, pk):
    try:
        event = SosEvent.objects.get(pk=pk, user=request.user, status=SosEvent.Status.ACTIVE)
    except SosEvent.DoesNotExist:
        return Response({"detail": "Active SOS event not found."}, status=404)
    event.status = SosEvent.Status.RESOLVED
    event.resolved_at = timezone.now()
    event.save(update_fields=["status", "resolved_at"])
    return Response(SosEventSerializer(event).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sos_history(request):
    events = SosEvent.objects.filter(user=request.user)
    return Response(SosEventSerializer(events, many=True).data)
