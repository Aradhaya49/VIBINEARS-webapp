from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .views import (
    ChangePasswordView, DeleteAccountView, RegisterView, LoginView, ProfileView,
    EmergencyContactListCreateView, EmergencyContactDeleteView,ProfileSerializer, ChangePasswordSerializer, MFAStatusSerializer, DisableAccountSerializer, DeleteAccountSerializer, MFAView, DevicesView, DisableAccountView
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="auth-logout"),
    path("profile/", ProfileView.as_view(), name="auth-profile"),
    path("emergency-contacts/", EmergencyContactListCreateView.as_view(), name="emergency-contacts"),
    path("emergency-contacts/<int:pk>/", EmergencyContactDeleteView.as_view(), name="emergency-contact-delete"),
    path("settings/profile/", ProfileView.as_view()), 
    path("settings/change-password/", ChangePasswordView.as_view()), 
    path("settings/mfa/", MFAView.as_view()), 
    path("settings/devices/", DevicesView.as_view()), 
    path("settings/disable/", DisableAccountView.as_view()), 
    path("settings/delete/", DeleteAccountView.as_view()), 
]
