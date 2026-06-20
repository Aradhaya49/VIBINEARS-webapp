from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import classify_intent, translate_text, suggest_conversation


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_intent(request):
    transcript = request.data.get("transcript", "")
    context = request.data.get("context", {})
    if not transcript:
        return Response({"detail": "transcript is required."}, status=400)
    result = classify_intent(transcript, context)
    return Response(result)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def translate(request):
    text = request.data.get("text", "")
    target = request.data.get("target_language", "en")
    if not text:
        return Response({"detail": "text is required."}, status=400)
    return Response(translate_text(text, target))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def suggest(request):
    messages = request.data.get("messages", [])
    context = request.data.get("context", {})
    suggestions = suggest_conversation(messages, context)
    return Response({"suggestions": suggestions})
