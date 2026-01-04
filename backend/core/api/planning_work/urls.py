from django.urls import path
from . import views

app_name = 'renovation'

urlpatterns = [
    # Main renovation plan generation endpoint
    path(
        'generate-plan/',
        views.generate_renovation_plan,
        name='generate_plan'
    ),
    
    # Helper endpoints for dropdowns/selects
    path(
        'building-types/',
        views.get_building_types,
        name='building_types'
    ),
    
    path(
        'renovation-types/',
        views.get_renovation_types,
        name='renovation_types'
    ),
    
    # Health check
    path(
        'health/',
        views.api_health_check,
        name='health_check'
    ),
]