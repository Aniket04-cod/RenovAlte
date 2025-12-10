import os
import django
import json

# Ensure settings loaded for serializer to import correctly
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from core.api.planning_work.serializers import RenovationPlanRequestSerializer

# Sample payload similar to what the frontend sends from ProjectSetupWizard
sample = {
    'building_type': 'single-family',
    'budget': '50000',
    'location': 'hesse',
    'building_size': 50,
    'renovation_goals': ['Energy Efficiency'],
    'building_age': '2024-01-15',
    'target_start_date': '2025-01-15',
    'financing_preference': 'personal-savings',
    'incentive_intent': 'yes',
    'living_during_renovation': 'no',
    'heritage_protection': 'no',
    # optional fields - include some values
    'energy_certificate_available': 'a_plus',
    'surveys_require': 'none',
    'neighbor_impacts': 'none',
    'current_insulation_status': 'partial',
    'heating_system_type': 'electric',
    'window_type': 'single-pane',
}

serializer = RenovationPlanRequestSerializer(data=sample)
if serializer.is_valid():
    print('SERIALIZER VALID ✅')
    print(json.dumps(serializer.validated_data, indent=2, default=str))
else:
    print('SERIALIZER INVALID ❌')
    print(json.dumps(serializer.errors, indent=2, default=str))
