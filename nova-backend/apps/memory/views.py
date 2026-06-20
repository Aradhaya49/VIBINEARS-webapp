from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Memory
from .serializers import MemorySerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recall(request):
    """Keyword-based search (replace with vector similarity in production)."""
    query = request.query_params.get("query", "")
    memories = Memory.objects.filter(user=request.user)
    if query:
        # Simple keyword match — production would use cosine similarity on embeddings
        memories = memories.filter(content__icontains=query)
    memories = memories[:10]
    for m in memories:
        # Mock relevance scoring based on keyword overlap
        words = set(query.lower().split())
        content_words = set(m.content.lower().split())
        m.relevance_score = round(len(words & content_words) / max(len(words), 1), 2)
    serializer = MemorySerializer(memories, many=True)
    return Response({"memories": serializer.data})


class MemoryCreateView(generics.CreateAPIView):
    serializer_class = MemorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        content = self.request.data.get("content", "")
        # In production: call embedding API and store vector
        mock_embedding = [0.1] * 128
        serializer.save(user=self.request.user, embedding=mock_embedding)
