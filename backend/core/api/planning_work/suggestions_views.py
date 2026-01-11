from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .suggestions_service import SuggestionsService


class DynamicSuggestionsView(APIView):
    """
    POST endpoint to get dynamic AI suggestions based on current context.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        context = request.data.get('context', {})
        
        if not context:
            return Response(
                {"error": "Context is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = SuggestionsService()
        
        try:
            suggestions = service.generate_suggestions(context)
            return Response({
                "success": True,
                "suggestions": suggestions
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e),
                "suggestions": service._get_default_suggestions()
            }, status=status.HTTP_200_OK)