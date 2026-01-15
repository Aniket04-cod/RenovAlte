from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .serializers import ChatMessageSerializer, ChatResponseSerializer
from .services import ChatbotService
from core.models import ChatSession, ChatMessage


class ChatbotMessageView(APIView):
    """
    POST endpoint to send a message to the chatbot.
    Requires authentication - messages are linked to user.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        message = request.data.get("message")
        session_id = request.data.get("session_id")
        image = request.FILES.get("image")

        if not message:
            return Response(
                {"error": "Message is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = ChatbotService()

        try:
            result = service.generate_response(
                message=message,
                user=request.user,
                session_id=session_id,
                image=image
            )

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to generate response: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatSessionListView(APIView):
    """
    GET: List all chat sessions for the authenticated user.
    POST: Create a new chat session.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all sessions for current user."""
        active_only = request.query_params.get('active_only', 'true').lower() == 'true'
        
        sessions = ChatSession.objects.filter(user=request.user)
        if active_only:
            sessions = sessions.filter(is_active=True)

        data = []
        for session in sessions:
            message_count = session.messages.count()
            last_message = session.messages.order_by('-created_at').first()
            
            data.append({
                "id": session.id,
                "title": session.title,
                "session_type": session.session_type,
                "is_active": session.is_active,
                "is_plan_generated": session.is_plan_generated,
                "message_count": message_count,
                "last_message": last_message.content[:100] if last_message else None,
                "last_message_at": last_message.created_at if last_message else None,
                "created_at": session.created_at,
                "updated_at": session.updated_at,
            })

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new chat session."""
        service = ChatbotService()
        session = service.get_or_create_session(
            user=request.user,
            session_id=None,
            project=None
        )

        return Response({
            "id": session.id,
            "title": session.title,
            "session_type": session.session_type,
            "created_at": session.created_at,
        }, status=status.HTTP_201_CREATED)


class ChatSessionDetailView(APIView):
    """
    GET: Get a specific session with all messages.
    DELETE: Deactivate a session.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        """Get session details with all messages."""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Session not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        messages = ChatMessage.objects.filter(session=session).order_by('created_at')
        
        messages_data = [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "metadata": msg.metadata,
                "created_at": msg.created_at,
            }
            for msg in messages
        ]

        return Response({
            "id": session.id,
            "title": session.title,
            "session_type": session.session_type,
            "is_active": session.is_active,
            "is_plan_generated": session.is_plan_generated,
            "extracted_data": session.extracted_data,
            "created_at": session.created_at,
            "updated_at": session.updated_at,
            "messages": messages_data,
        }, status=status.HTTP_200_OK)

    def delete(self, request, session_id):
        """Deactivate a session (soft delete)."""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Session not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        session.is_active = False
        session.save()

        return Response(
            {"message": "Session deactivated"},
            status=status.HTTP_200_OK
        )


class ExtractAndGeneratePlanView(APIView):
    """
    POST endpoint to extract data from chat and generate renovation plan.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get("session_id")

        if not session_id:
            return Response(
                {"success": False, "error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        chatbot_service = ChatbotService()
        extraction_result = chatbot_service.extract_plan_data(
            session_id=session_id,
            user=request.user
        )

        if not extraction_result["success"]:
            return Response(
                {
                    "success": False,
                    "error": extraction_result["error"],
                    "step": "extraction"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        extracted_data = extraction_result["data"]

        # Import here to avoid circular imports
        from core.api.planning_work.services import GeminiService

        plan_input = {
            "building_type": extracted_data.get("building_type") or "Unknown",
            "budget": float(extracted_data.get("budget") or 0),
            "location": extracted_data.get("location") or "Germany",
            "building_size": int(extracted_data.get("building_size") or 0),
            "goals": extracted_data.get("renovation_goals") or [],
            "building_age": extracted_data.get("building_age") or "Unknown",
            "current_condition": extracted_data.get("current_condition") or "",
            "specific_materials": extracted_data.get("specific_materials") or [],
            "rooms_involved": extracted_data.get("rooms_involved") or [],
            "timeline": extracted_data.get("timeline") or "",
            "special_requirements": extracted_data.get("special_requirements") or [],
        }

        try:
            gemini_service = GeminiService()
            plan_result = gemini_service.generate_renovation_plan(
                building_type=plan_input["building_type"],
                budget=plan_input["budget"],
                location=plan_input["location"],
                building_size=plan_input["building_size"],
                renovation_goals=plan_input["goals"],
                dynamic_context=plan_input
            )

            # Mark session as plan generated
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
                session.is_plan_generated = True
                session.save()
            except ChatSession.DoesNotExist:
                pass

            # Save the plan to database
            from core.models import RenovationPlan
            
            if plan_result.get('success') and plan_result.get('plan'):
                renovation_plan = RenovationPlan.objects.create(
                    user=request.user,
                    plan_name=f"Plan from Chat - {session.title}" if session else "Chat Generated Plan",
                    plan_data=plan_result.get('plan', {}),
                    input_data=plan_input,
                    status='generated'
                )
                plan_result['plan_id'] = renovation_plan.id

            return Response({
                "success": True,
                "extracted_data": extracted_data,
                "plan": plan_result,
                "session_id": session_id
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error during plan generation: {str(e)}")
            return Response(
                {
                    "success": False,
                    "error": f"Plan generation failed: {str(e)}",
                    "step": "generation",
                    "extracted_data": extracted_data
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserMemoryView(APIView):
    """
    GET: List all memories for the authenticated user.
    DELETE: Clear all memories for the user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all active memories for current user."""
        from core.models import UserMemory
        
        memories = UserMemory.objects.filter(user=request.user, is_active=True)
        
        data = [
            {
                "id": mem.id,
                "memory_type": mem.memory_type,
                "key": mem.key,
                "value": mem.value,
                "confidence": mem.confidence,
                "created_at": mem.created_at,
                "updated_at": mem.updated_at,
            }
            for mem in memories
        ]

        return Response(data, status=status.HTTP_200_OK)

    def delete(self, request):
        """Deactivate all memories for user."""
        from core.models import UserMemory
        
        UserMemory.objects.filter(user=request.user).update(is_active=False)
        
        return Response(
            {"message": "All memories cleared"},
            status=status.HTTP_200_OK
        )