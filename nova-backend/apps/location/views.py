import math
from django.utils import timezone
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import GeoNote
from .serializers import GeoNoteSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def nearby_geo_notes(request):
    lat = float(request.query_params.get("lat", 0))
    lng = float(request.query_params.get("lng", 0))
    radius = int(request.query_params.get("radius", 200))

    now = timezone.now()
    deg = radius / 111_000
    notes = GeoNote.objects.filter(
        latitude__range=(lat - deg, lat + deg),
        longitude__range=(lng - deg, lng + deg),
    ).filter(expires_at__gte=now) | GeoNote.objects.filter(
        latitude__range=(lat - deg, lat + deg),
        longitude__range=(lng - deg, lng + deg),
        expires_at__isnull=True,
    )
    return Response(GeoNoteSerializer(notes.distinct(), many=True).data)


class GeoNoteCreateView(generics.CreateAPIView):
    serializer_class = GeoNoteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
