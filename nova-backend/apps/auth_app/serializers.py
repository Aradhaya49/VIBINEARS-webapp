from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, EmergencyContact
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User, EmergencyContact


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    distance_meters = serializers.FloatField(read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "phone", "bio", "avatar_url", "is_open_to_talk",
            "latitude", "longitude", "distance_meters",
            "is_vip", "party_streak", "created_at",
        ]
        read_only_fields = ["id", "created_at", "is_vip", "party_streak"]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2", "phone"]

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user_obj = User.objects.get(email=data["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials.")
        user = authenticate(username=user_obj.username, password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account is disabled.")
        data["user"] = user
        return data


class TokenResponseSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    user = UserSerializer()

    @staticmethod
    def get_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
        }


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ["id", "name", "phone", "relation", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "bio",
            "avatar",
            "two_factor_enabled",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class MFAStatusSerializer(serializers.Serializer):
    enabled = serializers.BooleanField()


class DisableAccountSerializer(serializers.Serializer):
    confirm = serializers.BooleanField()


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField()

