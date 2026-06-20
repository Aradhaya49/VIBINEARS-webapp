from rest_framework.permissions import BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """Allow write access only to the owner of an object."""

    def has_object_permission(self, request, view, obj):
        from rest_framework.permissions import SAFE_METHODS
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user


class IsVerifiedUser(BasePermission):
    """Only verified (active) users may proceed."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_active)
