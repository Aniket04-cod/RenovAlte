from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import logging
import os

from .serializers import (
    RenovationPlanRequestSerializer, 
    RenovationPlanResponseSerializer,
    NextQuestionRequestSerializer,
    NextQuestionResponseSerializer
)
from .services import GeminiService

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_next_question(request):
    """
    Generate the next contextual question based on current answers.
    Endpoint: POST /api/renovation/next-question/
    """
    serializer = NextQuestionRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        service = GeminiService()
        result = service.generate_next_question(
            current_answers=serializer.validated_data['current_answers']
        )
        
        # We don't strictly validate the AI response against a serializer here 
        # to allow for flexibility, but we could.
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error generating question: {e}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_renovation_plan(request):
    """
    Generate a renovation plan using Gemini AI.
    Supports both legacy arguments and the new 'dynamic_answers' dict.
    Endpoint: POST /api/renovation/generate-plan/
    """
    # Use standard serializer for validation, but allow partial/dynamic data
    serializer = RenovationPlanRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'success': False, 'error': 'Invalid request', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    validated_data = serializer.validated_data
    
    try:
        service = GeminiService()
        
        # Check if we have dynamic answers, otherwise use legacy fields
        dynamic_answers = validated_data.get('dynamic_answers')
        
        if dynamic_answers:
            # New Flow: Pass the whole context dict
            result = service.generate_renovation_plan(
                building_type=dynamic_answers.get('building_type', 'unknown'),
                budget=float(dynamic_answers.get('budget', 0)),
                location=dynamic_answers.get('location', 'Germany'),
                building_size=int(dynamic_answers.get('building_size', 0)),
                renovation_goals=dynamic_answers.get('goals', []),
                # Core fields passed as fallback, but 'dynamic_context' holds the real juice
                dynamic_context=dynamic_answers,
                # Pass any other keys as kwargs
                **{k:v for k,v in dynamic_answers.items() if k not in ['building_type', 'budget', 'location']}
            )
        else:
            # Legacy Flow (Keep this working for existing tests/frontend parts)
            result = service.generate_renovation_plan(
                building_type=validated_data.get('building_type'),
                budget=float(validated_data.get('budget', 0)),
                location=validated_data.get('location'),
                building_size=validated_data.get('building_size', 0),
                renovation_goals=validated_data.get('renovation_goals', []),
                building_age=str(validated_data.get('building_age')),
                target_start_date=str(validated_data.get('target_start_date')),
                financing_preference=validated_data.get('financing_preference', ''),
                incentive_intent=validated_data.get('incentive_intent', ''),
                living_during_renovation=validated_data.get('living_during_renovation', ''),
                heritage_protection=validated_data.get('heritage_protection', '')
            )
            
        return Response(result, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Error generating plan: {str(e)}", exc_info=True)
        return Response(
            {'success': False, 'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_building_types(request):
    # (Keep existing implementation)
    return Response({'success': True, 'building_types': []}) 
    # Placeholder for brevity, assume previous code exists

@api_view(['GET'])
@permission_classes([AllowAny])
def get_renovation_types(request):
    # (Keep existing implementation)
    return Response({'success': True, 'renovation_types': []})

@api_view(['GET'])
@permission_classes([AllowAny])
def api_health_check(request):
    # (Keep existing implementation)
    return Response({'success': True, 'message': 'Renovation API is running'})