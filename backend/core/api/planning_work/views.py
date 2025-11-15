from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import logging
import os

# Import the serializers and service
# You'll need to adjust the import paths based on your actual project structure
# from .serializers import RenovationPlanRequestSerializer, RenovationPlanResponseSerializer
# from .services.gemini_service import GeminiService, MockGeminiService

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])  # Change to IsAuthenticated if you need auth
def generate_renovation_plan(request):
    """
    Generate a renovation plan using Gemini AI
    
    Endpoint: POST /api/renovation/generate-plan/
    
    Request Body:
    {
        "building_type": "residential",
        "budget": 50000.00,
        "renovation_type": "full",
        "additional_details": "Need to modernize kitchen and bathroom" (optional)
    }
    
    Response:
    {
        "success": true,
        "plan": "... detailed renovation plan ...",
        "building_type": "residential",
        "budget": 50000.00,
        "renovation_type": "full",
        "generated_at": "2025-11-09T10:30:00Z"
    }
    """
    
    # Validate request data
    from .serializers import RenovationPlanRequestSerializer, RenovationPlanResponseSerializer
    
    serializer = RenovationPlanRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {
                'success': False,
                'error': 'Invalid request data',
                'details': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    validated_data = serializer.validated_data
    
    try:
        # Allow client to choose provider (for A/B testing): 'gemini' or 'groq'
        # If not provided, fall back to environment `PREFERRED_PROVIDER` or 'gemini'.
        provider = request.data.get('provider') or os.getenv('PREFERRED_PROVIDER', 'gemini')

        # Import providers
        from .services import GeminiService, GroqService, MockGeminiService

        # Instantiate the requested service with safe fallback to mock
        provider = (provider or 'gemini').lower()
        if provider == 'groq':
            try:
                gemini_service = GroqService()
            except ValueError as e:
                logger.warning(f"GROQ not configured or SDK missing: {e}. Using mock service.")
                gemini_service = MockGeminiService()
        else:
            try:
                gemini_service = GeminiService()
            except ValueError as e:
                # Fallback to mock service if API key not configured
                logger.warning(f"Gemini API key not configured: {e}. Using mock service.")
                gemini_service = MockGeminiService()
        
        # Generate renovation plan
        # Generate renovation plan
        result = gemini_service.generate_renovation_plan(
            building_type=validated_data['building_type'],
            budget=float(validated_data['budget']),
            location=validated_data['location'],
            building_size=validated_data['building_size'],
            renovation_goals=validated_data['renovation_goals'],
            building_age=validated_data['building_age'].isoformat(),
            target_start_date=validated_data['target_start_date'].isoformat(),
            financing_preference=validated_data['financing_preference'],
            incentive_intent=validated_data['incentive_intent'],
            living_during_renovation=validated_data['living_during_renovation'],
            heritage_protection=validated_data['heritage_protection'],
            energy_certificate_available=validated_data.get('energy_certificate_available'),
            surveys_require=validated_data.get('surveys_require'),
            neighbor_impacts=validated_data.get('neighbor_impacts'),
            current_insulation_status=validated_data.get('current_insulation_status'),
            heating_system_type=validated_data.get('heating_system_type'),
            window_type=validated_data.get('window_type'),
            known_major_issues=validated_data.get('known_major_issues')
        )
        print("Result from GeminiService:")
        print(type(result['plan']))
        print(result['plan'])
        # Serialize response
        response_serializer = RenovationPlanResponseSerializer(data=result)
        
        if response_serializer.is_valid():
            if result['success']:
                return Response(
                    response_serializer.validated_data,
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    response_serializer.validated_data,
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(f"Response serialization error: {response_serializer.errors}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to process response',
                    'details': response_serializer.errors
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f"Error generating renovation plan: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'error': 'An unexpected error occurred',
                'details': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_building_types(request):
    """
    Get available building types
    
    Endpoint: GET /api/renovation/building-types/
    """
    building_types = [
        {'value': 'residential', 'label': 'Residential'},
        {'value': 'commercial', 'label': 'Commercial'},
        {'value': 'industrial', 'label': 'Industrial'},
        {'value': 'apartment', 'label': 'Apartment'},
        {'value': 'villa', 'label': 'Villa'},
        {'value': 'office', 'label': 'Office'},
    ]
    
    return Response({
        'success': True,
        'building_types': building_types
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_renovation_types(request):
    """
    Get available renovation types
    
    Endpoint: GET /api/renovation/renovation-types/
    """
    renovation_types = [
        {'value': 'full', 'label': 'Full Renovation'},
        {'value': 'partial', 'label': 'Partial Renovation'},
        {'value': 'kitchen', 'label': 'Kitchen Renovation'},
        {'value': 'bathroom', 'label': 'Bathroom Renovation'},
        {'value': 'exterior', 'label': 'Exterior Renovation'},
        {'value': 'interior', 'label': 'Interior Renovation'},
    ]
    
    return Response({
        'success': True,
        'renovation_types': renovation_types
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_health_check(request):
    """
    Health check endpoint
    
    Endpoint: GET /api/renovation/health/
    """
    import os
    
    gemini_configured = bool('AIzaSyAFL5moLbRfXvTPA0vPPcLFdx_oh0geiI8')
    
    return Response({
        'success': True,
        'message': 'Renovation API is running',
        'gemini_api_configured': gemini_configured
    })