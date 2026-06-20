from django.urls import path
from .views import user_stats, PlaceOrderView, OrderHistoryView

urlpatterns = [
    path("stats/", user_stats, name="gamification-stats"),
    path("order/", PlaceOrderView.as_view(), name="place-order"),
    path("orders/", OrderHistoryView.as_view(), name="order-history"),
]
