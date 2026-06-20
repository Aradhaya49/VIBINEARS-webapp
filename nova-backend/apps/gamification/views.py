from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import GamificationStats, Order
from .serializers import GamificationStatsSerializer, OrderSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_stats(request):
    stats, _ = GamificationStats.objects.get_or_create(user=request.user)
    return Response(GamificationStatsSerializer(stats).data)


class PlaceOrderView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        order = serializer.save(user=self.request.user)
        # Award VIP points (1 point per dollar)
        stats, _ = GamificationStats.objects.get_or_create(user=self.request.user)
        points_earned = int(order.total_amount)
        stats.vip_points += points_earned
        stats.total_spent += order.total_amount
        stats.last_activity = timezone.now()
        stats.recalculate_tier()
        stats.save()
        # Sync VIP flag to User
        if stats.tier in ["GOLD", "PLATINUM"]:
            self.request.user.is_vip = True
            self.request.user.save(update_fields=["is_vip"])


class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
