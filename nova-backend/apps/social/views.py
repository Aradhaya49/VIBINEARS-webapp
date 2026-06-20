import math
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.auth_app.models import User
from apps.auth_app.serializers import UserSerializer
from .models import Connection
from .serializers import ConnectionSerializer, NearbyUserSerializer


def haversine_distance(lat1, lon1, lat2, lon2):
    """Returns distance in metres between two lat/lon points."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def nearby_users(request):
    lat = request.query_params.get("lat")
    lng = request.query_params.get("lng")
    radius = int(request.query_params.get("radius", settings.NEARBY_RADIUS_METERS))

    if not lat or not lng:
        # Fall back to user's stored location
        user = request.user
        if not user.latitude or not user.longitude:
            return Response({"detail": "Provide lat/lng or update your location."}, status=400)
        lat, lng = user.latitude, user.longitude
    else:
        lat, lng = float(lat), float(lng)

    cache_key = f"nearby:{lat:.4f}:{lng:.4f}:{radius}"
    cached = cache.get(cache_key)
    if cached:
        return Response(cached)

    # Simple bounding-box pre-filter, then exact haversine
    deg_offset = radius / 111_000
    candidates = User.objects.filter(
        latitude__range=(lat - deg_offset, lat + deg_offset),
        longitude__range=(lng - deg_offset, lng + deg_offset),
        is_open_to_talk=True,
    ).exclude(pk=request.user.pk)

    results = []
    for u in candidates:
        dist = haversine_distance(lat, lng, u.latitude, u.longitude)
        if dist <= radius:
            u.distance_meters = round(dist, 1)
            results.append(u)

    results.sort(key=lambda u: u.distance_meters)
    data = NearbyUserSerializer(results, many=True, context={"request": request}).data
    cache.set(cache_key, data, timeout=30)
    return Response(data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def open_to_talk(request):
    is_open = request.data.get("is_open", False)
    request.user.is_open_to_talk = is_open
    request.user.save(update_fields=["is_open_to_talk"])
    return Response(UserSerializer(request.user, context={"request": request}).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_location(request):
    lat = request.data.get("latitude")
    lng = request.data.get("longitude")
    if lat is None or lng is None:
        return Response({"detail": "latitude and longitude required."}, status=400)
    request.user.latitude = float(lat)
    request.user.longitude = float(lng)
    request.user.location_updated_at = timezone.now()
    request.user.save(update_fields=["latitude", "longitude", "location_updated_at"])
    return Response({"status": "ok"})


class SendConnectionView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionSerializer

    def create(self, request, *args, **kwargs):
        to_user_id = kwargs.get("user_id")
        try:
            to_user = User.objects.get(pk=to_user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        if to_user == request.user:
            return Response({"detail": "Cannot connect to yourself."}, status=400)

        conn, created = Connection.objects.get_or_create(
            from_user=request.user, to_user=to_user,
            defaults={"status": Connection.Status.PENDING},
        )
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(ConnectionSerializer(conn, context={"request": request}).data, status=status_code)


class RespondConnectionView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionSerializer

    def update(self, request, *args, **kwargs):
        conn_id = kwargs.get("pk")
        action = request.data.get("action")  # accept | reject
        try:
            conn = Connection.objects.get(pk=conn_id, to_user=request.user)
        except Connection.DoesNotExist:
            return Response({"detail": "Request not found."}, status=404)

        if action == "accept":
            conn.status = Connection.Status.ACCEPTED
        elif action == "reject":
            conn.status = Connection.Status.REJECTED
        else:
            return Response({"detail": "action must be 'accept' or 'reject'."}, status=400)

        conn.save(update_fields=["status"])
        return Response(ConnectionSerializer(conn, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def icebreaker(request, user_id):
    try:
        target = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=404)

    suggestions = [
        f"Ask {target.first_name or target.username} what brought them out tonight!",
        "What's the best live event you've been to recently?",
        "What's your go-to drink order?",
    ]
    return Response({
        "message": f"You and {target.first_name or target.username} are nearby — say hi!",
        "suggestions": suggestions,
    })
