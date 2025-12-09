from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import ChatMessageSerializer, ChatResponseSerializer
from .services import ChatbotService, MockChatbotService


@method_decorator(csrf_exempt, name='dispatch')
class ChatbotMessageView(APIView):
	"""
	POST endpoint to send a message to the chatbot
	"""
	permission_classes = [AllowAny]
	
	def post(self, request):
		# Validate incoming data
		serializer = ChatMessageSerializer(data=request.data)
		
		if not serializer.is_valid():
			return Response(
				serializer.errors,
				status=status.HTTP_400_BAD_REQUEST
			)
		
		# Extract validated data
		message = serializer.validated_data.get("message")
		session_id = serializer.validated_data.get("session_id", None)
		
		# Use Mock or Real service based on your preference
		# Change to ChatbotService() when you have API key configured
		service = ChatbotService()
		
		try:
			# Generate response
			result = service.generate_response(message, session_id)
			
			# Serialize response
			response_serializer = ChatResponseSerializer(result)
			
			return Response(
				response_serializer.data,
				status=status.HTTP_200_OK
			)
		
		except Exception as e:
			return Response(
				{"error": f"Failed to generate response: {str(e)}"},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)