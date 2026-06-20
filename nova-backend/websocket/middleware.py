"""
JWT auth middleware for Django Channels.
Reads ?token=<access_token> from the query string and authenticates the user
so request.user is available inside consumers.
"""
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()


@database_sync_to_async
def get_user(token_key):
    try:
        token = AccessToken(token_key)
        return User.objects.get(pk=token["user_id"])
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token_list = params.get("token", [])
        if token_list:
            scope["user"] = await get_user(token_list[0])
        else:
            scope["user"] = AnonymousUser()
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
