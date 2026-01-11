from django.urls import path
from . import views
from .suggestions_views import DynamicSuggestionsView
app_name = 'renovation'

urlpatterns = [
    path(
        'generate-plan/',
        views.generate_renovation_plan,
        name='generate_plan'
    ),
    
    path(
        'next-question/',
        views.generate_next_question,
        name='generate_next_question'
    ),

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
    
    path(
        'health/',
        views.api_health_check,
        name='health_check'
    ),
    path('suggestions/', DynamicSuggestionsView.as_view(), name='dynamic-suggestions'),
]