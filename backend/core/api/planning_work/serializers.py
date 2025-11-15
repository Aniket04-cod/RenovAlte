from rest_framework import serializers


class RenovationPlanRequestSerializer(serializers.Serializer):
    """
    Serializer for renovation plan generation request
    """
    BUILDING_TYPE_CHOICES = [
        ('residential', 'Residential'),
        ('commercial', 'Commercial'),
        ('industrial', 'Industrial'),
        ('apartment', 'Apartment'),
        ('villa', 'Villa'),
        ('office', 'Office'),
    ]
    
    RENOVATION_GOAL_CHOICES = [
        ('energy_efficiency', 'Energy Efficiency'),
        ('insulation', 'Insulation'),
        ('windows_doors', 'Windows & Doors'),
        ('heating_system', 'Heating System'),
        ('solar_panels', 'Solar Panels'),
        ('bathroom', 'Bathroom'),
        ('kitchen', 'Kitchen'),
        ('roof', 'Roof'),
    ]
    
    FINANCING_PREFERENCE_CHOICES = [
        ('personal_savings', 'Personal Savings'),
        ('bank_loan', 'Bank Loan'),
        ('kfw_loan', 'KfW Loan'),
        ('mixed', 'Mixed Financing'),
    ]
    
    INCENTIVE_INTENT_CHOICES = [
        ('yes_planning', 'Yes, planning to apply'),
        ('yes_applied', 'Yes, already applied'),
        ('no', 'No'),
        ('unsure', 'Unsure'),
    ]
    
    LIVING_DURING_CHOICES = [
        ('yes', 'Yes'),
        ('no', 'No'),
        ('partial', 'Partially'),
    ]
    
    HERITAGE_PROTECTION_CHOICES = [
        ('yes', 'Yes'),
        ('no', 'No'),
        ('unsure', 'Unsure'),
    ]
    
    SURVEYS_REQUIRE_CHOICES = [
        ('energy_audit', 'Energy Audit'),
        ('structural_assessment', 'Structural Assessment'),
        ('asbestos_survey', 'Asbestos Survey'),
        ('none', 'None'),
        ('unsure', 'Unsure'),
    ]
    
    HEATING_SYSTEM_CHOICES = [
        ('gas', 'Gas'),
        ('oil', 'Oil'),
        ('electric', 'Electric'),
        ('heat_pump', 'Heat Pump'),
        ('district_heating', 'District Heating'),
        ('other', 'Other'),
    ]
    
    WINDOW_TYPE_CHOICES = [
        ('single_pane', 'Single-pane'),
        ('double_pane', 'Double-pane'),
        ('triple_pane', 'Triple-pane'),
        ('mixed', 'Mixed'),
    ]
    
    INSULATION_STATUS_CHOICES = [
        ('none', 'None'),
        ('partial', 'Partial (specify area like roof/attic)'),
        ('full', 'Full'),
    ]
    
    NEIGHBOR_IMPACTS_CHOICES = [
        ('scaffolding', 'Scaffolding over neighbor property'),
        ('noise', 'Noise disruption'),
        ('access', 'Access restrictions'),
        ('none', 'None'),
    ]
    
    MAJOR_ISSUES_CHOICES = [
        ('mold', 'Mold'),
        ('water_damage', 'Water damage'),
        ('structural_cracks', 'Structural cracks'),
        ('roof_leaks', 'Roof leaks'),
        ('none', 'None'),
    ]

    # Required fields
    building_type = serializers.ChoiceField(
        choices=BUILDING_TYPE_CHOICES,
        required=True,
        help_text="Type of building to renovate"
    )
    
    budget = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=True,
        min_value=0,
        help_text="Budget for renovation in EUR"
    )
    
    location = serializers.CharField(
        required=True,
        max_length=100,
        help_text="Location (Bundesland) in Germany"
    )
    
    building_size = serializers.IntegerField(
        required=True,
        min_value=1,
        help_text="Building size in square meters"
    )
    
    renovation_goals = serializers.ListField(
        child=serializers.ChoiceField(choices=RENOVATION_GOAL_CHOICES),
        required=True,
        help_text="List of renovation goals"
    )
    
    building_age = serializers.DateField(
        required=True,
        help_text="Building construction date"
    )
    
    target_start_date = serializers.DateField(
        required=True,
        help_text="Target renovation start date"
    )
    
    financing_preference = serializers.ChoiceField(
        choices=FINANCING_PREFERENCE_CHOICES,
        required=True,
        help_text="Preferred financing method"
    )
    
    incentive_intent = serializers.ChoiceField(
        choices=INCENTIVE_INTENT_CHOICES,
        required=True,
        help_text="Intent to apply for KfW or other incentives"
    )
    
    living_during_renovation = serializers.ChoiceField(
        choices=LIVING_DURING_CHOICES,
        required=True,
        help_text="Will you be living in the property during renovation?"
    )
    
    heritage_protection = serializers.ChoiceField(
        choices=HERITAGE_PROTECTION_CHOICES,
        required=True,
        help_text="Is the building under heritage protection (Denkmalschutz)?"
    )
    
    # Optional fields
    energy_certificate_available = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=10,
        help_text="Energy certificate grade (e.g., A+, B, C)"
    )
    
    surveys_require = serializers.ChoiceField(
        choices=SURVEYS_REQUIRE_CHOICES,
        required=False,
        allow_blank=True,
        help_text="Are surveys or assessments required?"
    )
    
    neighbor_impacts = serializers.ChoiceField(
        choices=NEIGHBOR_IMPACTS_CHOICES,
        required=False,
        allow_blank=True,
        help_text="Expected impacts on neighbors"
    )
    
    current_insulation_status = serializers.ChoiceField(
        choices=INSULATION_STATUS_CHOICES,
        required=False,
        allow_blank=True,
        help_text="Current insulation status"
    )
    
    heating_system_type = serializers.ChoiceField(
        choices=HEATING_SYSTEM_CHOICES,
        required=False,
        allow_blank=True,
        help_text="Current heating system type"
    )
    
    window_type = serializers.ChoiceField(
        choices=WINDOW_TYPE_CHOICES,
        required=False,
        allow_blank=True,
        help_text="Current window type"
    )
    
    known_major_issues = serializers.ChoiceField(
        choices=MAJOR_ISSUES_CHOICES,
        required=False,
        allow_blank=True,
        help_text="Known major issues with the building"
    )

    def validate_budget(self, value):
        """Validate that budget is reasonable"""
        if value < 1000:
            raise serializers.ValidationError(
                "Budget should be at least 1000 EUR for a renovation plan"
            )
        if value > 10000000:
            raise serializers.ValidationError(
                "Budget seems unrealistic. Please enter a valid amount."
            )
        return value


class RenovationPlanResponseSerializer(serializers.Serializer):
    """
    Serializer for renovation plan generation response
    """
    success = serializers.BooleanField()
    plan = serializers.JSONField()
    building_type = serializers.CharField()
    budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    location = serializers.CharField()
    error = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    generated_at = serializers.DateTimeField()