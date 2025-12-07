from rest_framework import serializers

# --- EXISTING SERIALIZERS (Keep these) ---
class RenovationPlanRequestSerializer(serializers.Serializer):
    # ... (Keep existing fields for backward compatibility/initial validation) ...
    # We can reuse the existing logic or make fields optional if we move fully dynamic
    # For now, let's keep the core ones required for the initial step.
    building_type = serializers.CharField(required=False)
    budget = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    location = serializers.CharField(required=False)
    # Allow arbitrary dict for the dynamic flow
    dynamic_answers = serializers.DictField(required=False)

class RenovationPlanResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    plan = serializers.JSONField()
    building_type = serializers.CharField(required=False, allow_null=True)
    budget = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    location = serializers.CharField(required=False, allow_null=True)
    error = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    generated_at = serializers.DateTimeField()

# --- NEW SERIALIZERS FOR DYNAMIC FLOW ---

class NextQuestionRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting the next dynamic question
    """
    current_answers = serializers.DictField(
        help_text="Dictionary containing all questions answered so far",
        required=True
    )

class NextQuestionResponseSerializer(serializers.Serializer):
    """
    Serializer for the AI generated question
    """
    question_text = serializers.CharField()
    explanation = serializers.CharField(required=False, allow_blank=True)
    input_type = serializers.ChoiceField(choices=['text', 'select', 'number', 'date'])
    options = serializers.ListField(child=serializers.DictField(), required=False)
    question_id = serializers.CharField(required=False)