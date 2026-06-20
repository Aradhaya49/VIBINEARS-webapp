from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView
from .models import User, EmergencyContact
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    TokenResponseSerializer, EmergencyContactSerializer,
)
from django.contrib.auth import logout
from django.contrib.auth.hashers import check_password
from rest_framework.views import APIView

from .models import User
from .serializers import (
    ProfileSerializer,
    ChangePasswordSerializer,
    MFAStatusSerializer,
    DisableAccountSerializer,
    DeleteAccountSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = TokenResponseSerializer.get_tokens(user)
        return Response(
            {**tokens, "user": UserSerializer(user, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = TokenResponseSerializer.get_tokens(user)
        return Response(
            {**tokens, "user": UserSerializer(user, context={"request": request}).data}
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class EmergencyContactListCreateView(generics.ListCreateAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmergencyContact.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EmergencyContactDeleteView(generics.DestroyAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmergencyContact.objects.filter(user=self.request.user)
    



class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"detail": "Old password is incorrect"},
                status=400,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({"detail": "Password updated successfully"})


class MFAView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "enabled": request.user.two_factor_enabled
        })

    def post(self, request):
        serializer = MFAStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        request.user.two_factor_enabled = serializer.validated_data["enabled"]
        request.user.save()

        return Response({
            "enabled": request.user.two_factor_enabled
        })


class DevicesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        devices = [
            {
                "id": 1,
                "device": "Chrome on Windows",
                "location": "Nashik, India",
                "current": True,
            },
            {
                "id": 2,
                "device": "Android App",
                "location": "Mumbai, India",
                "current": False,
            },
        ]

        return Response(devices)


class DisableAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DisableAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not serializer.validated_data["confirm"]:
            return Response(
                {"detail": "Confirmation required"},
                status=400,
            )

        request.user.is_disabled = True
        request.user.save()

        logout(request)

        return Response({
            "detail": "Account disabled successfully"
        })


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DeleteAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        password = serializer.validated_data["password"]

        if not request.user.check_password(password):
            return Response(
                {"detail": "Invalid password"},
                status=400,
            )

        request.user.delete()

        return Response({
            "detail": "Account deleted successfully"
        })

