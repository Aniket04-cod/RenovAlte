import os
import json
from datetime import datetime, timedelta
from typing import Optional
import google.generativeai as genai


class GeminiService:
    """Service for interacting with Google's Gemini AI"""
    
    def __init__(self):
        """Initialize the Gemini service with API key"""
        api_key = os.getenv('GEMINI_API_KEY', 'AIzaSyAFL5moLbRfXvTPA0vPPcLFdx_oh0geiI8')
        
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def generate_renovation_plan(
        self,
        building_type: str,
        budget: float,
        location: str,
        building_size: int,
        renovation_goals: list,
        building_age: str,
        target_start_date: str,
        financing_preference: str,
        incentive_intent: str,
        living_during_renovation: str,
        heritage_protection: str,
        energy_certificate_available: str = None,
        surveys_require: str = None,
        neighbor_impacts: str = None,
        current_insulation_status: str = None,
        heating_system_type: str = None,
        window_type: str = None,
        known_major_issues: str = None
    ) -> dict:
        """
        Generate a comprehensive renovation plan using Gemini AI
        
        Args:
            building_type: Type of building (residential, commercial, etc.)
            budget: Available budget in EUR
            location: Location (Bundesland) in Germany
            building_size: Building size in square meters
            renovation_goals: List of renovation goals
            building_age: Building construction date
            target_start_date: Target renovation start date
            financing_preference: Preferred financing method
            incentive_intent: Intent to apply for incentives
            living_during_renovation: Whether living during renovation
            heritage_protection: Heritage protection status
            energy_certificate_available: Energy certificate grade (optional)
            surveys_require: Required surveys (optional)
            neighbor_impacts: Expected neighbor impacts (optional)
            current_insulation_status: Current insulation status (optional)
            heating_system_type: Current heating system (optional)
            window_type: Current window type (optional)
            known_major_issues: Known major issues (optional)
            
        Returns:
            dict: Contains success status, plan data, and metadata
        """
        try:
            # Construct the prompt for Gemini
            prompt = self._build_renovation_prompt(
                building_type=building_type,
                budget=budget,
                location=location,
                building_size=building_size,
                renovation_goals=renovation_goals,
                building_age=building_age,
                target_start_date=target_start_date,
                financing_preference=financing_preference,
                incentive_intent=incentive_intent,
                living_during_renovation=living_during_renovation,
                heritage_protection=heritage_protection,
                energy_certificate_available=energy_certificate_available,
                surveys_require=surveys_require,
                neighbor_impacts=neighbor_impacts,
                current_insulation_status=current_insulation_status,
                heating_system_type=heating_system_type,
                window_type=window_type,
                known_major_issues=known_major_issues
            )
            
            # Generate content using Gemini
            response = self.model.generate_content(prompt)
            
            # Parse the response
            plan_data = self._parse_gemini_response(response.text)
            
            return {
                'success': True,
                'plan': plan_data,
                'building_type': building_type,
                'budget': budget,
                'location': location,
                'error': None,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'plan': None,
                'building_type': building_type,
                'budget': budget,
                'location': location,
                'error': str(e),
                'generated_at': datetime.now().isoformat()
            }
    
    def _build_renovation_prompt(
        self,
        building_type: str,
        budget: float,
        location: str,
        building_size: int,
        renovation_goals: list,
        building_age: str,
        target_start_date: str,
        financing_preference: str,
        incentive_intent: str,
        living_during_renovation: str,
        heritage_protection: str,
        energy_certificate_available: str = None,
        surveys_require: str = None,
        neighbor_impacts: str = None,
        current_insulation_status: str = None,
        heating_system_type: str = None,
        window_type: str = None,
        known_major_issues: str = None
    ) -> str:
        """Build a detailed prompt for the Gemini AI"""
        
        # Format renovation goals as a comma-separated string
        goals_str = ", ".join(renovation_goals)
        
        prompt = f"""
You are an expert renovation consultant specializing in German building regulations, energy efficiency standards (EnEV/GEG), and renovation financing options including KfW grants.

Generate a comprehensive, structured renovation plan in JSON format for the following project:

**Building Information:**
- Building Type: {building_type}
- Location (Bundesland): {location}
- Building Size: {building_size} m²
- Building Age: {building_age}
- Heritage Protection (Denkmalschutz): {heritage_protection}

**Current Building Status:**
- Energy Certificate: {energy_certificate_available or 'Not available'}
- Current Insulation Status: {current_insulation_status or 'Not specified'}
- Heating System Type: {heating_system_type or 'Not specified'}
- Window Type: {window_type or 'Not specified'}
- Known Major Issues: {known_major_issues or 'None reported'}

**Renovation Details:**
- Renovation Goals: {goals_str}
- Budget: €{budget:,.2f}
- Target Start Date: {target_start_date}
- Living During Renovation: {living_during_renovation}

**Financing & Compliance:**
- Financing Preference: {financing_preference}
- Incentive Intent (KfW/Grants): {incentive_intent}
- Surveys Required: {surveys_require or 'To be determined'}
- Neighbor Impacts: {neighbor_impacts or 'None expected'}

**CRITICAL: Follow this EXACT JSON structure for frontend compatibility:**

{{
    "project_summary": {{
        "total_estimated_cost": "€X - €Y",
        "total_duration": "X-Y months",
        "funding_readiness": "Good Match/Partial Match/Needs Review",
        "complexity_level": "Low/Medium/High",
        "key_considerations": ["point1", "point2", "point3"]
    }},
    
    "phases": [
        {{
            "id": 1,
            "title": "Site Inspection",
            "icon": "Search",
            "duration": "1-2 weeks",
            "cost": "€500 - €1,200",
            "status": "ready",
            "color": "emerald",
            "tasks": [
                {{
                    "task_name": "Task description",
                    "estimated_time": "X days",
                    "estimated_cost": "€X",
                    "required_by": "Stakeholder name"
                }}
            ],
            "required_documents": ["document1", "document2"],
            "stakeholders": ["stakeholder1", "stakeholder2"]
        }},
        {{
            "id": 2,
            "title": "Energy Audit",
            "icon": "Zap",
            "duration": "1 week",
            "cost": "€800 - €1,500",
            "status": "ready",
            "color": "blue",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }},
        {{
            "id": 3,
            "title": "Permit Preparation",
            "icon": "FileText",
            "duration": "2-3 weeks",
            "cost": "€1,000 - €2,000",
            "status": "pending",
            "color": "amber",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }},
        {{
            "id": 4,
            "title": "Contractor Selection",
            "icon": "Users",
            "duration": "2-4 weeks",
            "cost": "Variable",
            "status": "pending",
            "color": "purple",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }},
        {{
            "id": 5,
            "title": "Implementation",
            "icon": "Wrench",
            "duration": "8-12 weeks",
            "cost": "€35,000 - €50,000",
            "status": "pending",
            "color": "rose",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }},
        {{
            "id": 6,
            "title": "Final Inspection",
            "icon": "CheckCircle2",
            "duration": "1 week",
            "cost": "€300 - €600",
            "status": "pending",
            "color": "gray",
            "tasks": [],
            "required_documents": [],
            "stakeholders": []
        }}
    ],
    
    "gantt_chart": [
        {{
            "id": 1,
            "name": "Site Inspection",
            "start": 5,
            "duration": 10,
            "color": "bg-emerald-500"
        }},
        {{
            "id": 2,
            "name": "Energy Audit",
            "start": 15,
            "duration": 7,
            "color": "bg-blue-500"
        }},
        {{
            "id": 3,
            "name": "Permit Preparation",
            "start": 22,
            "duration": 14,
            "color": "bg-amber-500"
        }},
        {{
            "id": 4,
            "name": "Contractor Selection",
            "start": 36,
            "duration": 21,
            "color": "bg-purple-500"
        }},
        {{
            "id": 5,
            "name": "Implementation",
            "start": 57,
            "duration": 56,
            "color": "bg-rose-500"
        }},
        {{
            "id": 6,
            "name": "Final Inspection",
            "start": 113,
            "duration": 7,
            "color": "bg-gray-500"
        }}
    ],
    
    "permits": [
        {{
            "id": "geg",
            "name": "GEG Energy Compliance",
            "description": "Compliance with the German Building Energy Act (GEG) for energy-efficient renovations.",
            "checked": true
        }},
        {{
            "id": "baug",
            "name": "Baugenehmigung",
            "description": "Building permit required for structural changes and major renovations.",
            "checked": false
        }},
        {{
            "id": "architect",
            "name": "Architect Approval",
            "description": "Professional architect review and approval for design and structural plans.",
            "checked": false
        }},
        {{
            "id": "energy-cert",
            "name": "Energy Certificate",
            "description": "Updated energy performance certificate post-renovation.",
            "checked": false
        }},
        {{
            "id": "heritage",
            "name": "Heritage Protection Check",
            "description": "Required if the building is listed or in a protected area.",
            "checked": {str(heritage_protection == 'yes').lower()}
        }}
    ],
    
    "budget_breakdown": {{
        "total_estimated_cost": {{
            "min": 0,
            "max": 0
        }},
        "user_budget": {budget},
        "financing_readiness": "Good Match/Needs Review",
        "cost_categories": [
            {{
                "category": "Category Name",
                "estimated_cost": "€X - €Y",
                "percentage_of_total": "X%",
                "items": ["item1", "item2"]
            }}
        ],
        "contingency_fund": "€X (10-15% of total)"
    }},
    
    "kfw_funding_eligibility": {{
        "eligible_programs": [
            {{
                "program_name": "KfW Program Name",
                "program_number": "XXX",
                "type": "Grant/Loan/Subsidy",
                "max_amount": "€X or X%",
                "requirements": ["requirement1", "requirement2"],
                "energy_standard_required": "Standard description"
            }}
        ],
        "estimated_total_funding": "€X - €Y",
        "application_deadline": "Information or date",
        "next_steps": ["step1", "step2"]
    }},
    
    "stakeholders": [
        {{
            "name": "Stakeholder Name",
            "role": "Role Description",
            "when_needed": "Phase X",
            "estimated_cost": "€X - €Y",
            "how_to_find": "Recommendation"
        }}
    ],
    
    "risks_and_mitigation": [
        {{
            "risk": "Risk Description",
            "likelihood": "Low/Medium/High",
            "impact": "Low/Medium/High",
            "mitigation": "How to mitigate"
        }}
    ],
    
    "next_steps": [
        "Immediate action 1",
        "Immediate action 2",
        "Immediate action 3"
    ],
    
    "ai_suggestions": [
        "Suggestion 1",
        "Suggestion 2",
        "Suggestion 3"
    ]
}}

**IMPORTANT RULES:**
1. phases MUST have exactly 6 items with ids 1-6
2. phases icons MUST be one of: "Search", "Zap", "FileText", "Users", "Wrench", "CheckCircle2"
3. phases colors MUST be one of: "emerald", "blue", "amber", "purple", "rose", "gray"
4. phases status MUST be either "ready" or "pending"
5. gantt_chart MUST have exactly 6 items matching the phases
6. gantt_chart colors MUST be in format: "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-rose-500", "bg-gray-500"
7. gantt_chart start values should be cumulative (each task starts after the previous)
8. gantt_chart duration should be in days
9. permits MUST include all 5 items with exact ids: "geg", "baug", "architect", "energy-cert", "heritage"
10. Calculate realistic timeline based on target start date: {target_start_date}

Please provide ONLY the JSON output without any additional text or markdown formatting.
"""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> dict:
        """
        Parse the Gemini response into structured JSON
        
        Args:
            response_text: Raw text response from Gemini
            
        Returns:
            dict: Parsed renovation plan data
        """
        try:
            # Clean up the response text
            cleaned_text = response_text.strip()
            
            # Remove markdown code blocks if present
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith('```'):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            cleaned_text = cleaned_text.strip()
            
            # Parse JSON
            plan_data = json.loads(cleaned_text)
            
            # Validate and ensure required structure
            plan_data = self._validate_plan_structure(plan_data)
            
            return plan_data
            
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return a fallback structure
            return self._get_fallback_plan()
    
    def _validate_plan_structure(self, plan_data: dict) -> dict:
        """Ensure the plan has all required fields in correct format"""
        
        # Ensure phases have correct structure
        if 'phases' in plan_data:
            for i, phase in enumerate(plan_data['phases']):
                if 'id' not in phase:
                    phase['id'] = i + 1
                if 'icon' not in phase:
                    icons = ["Search", "Zap", "FileText", "Users", "Wrench", "CheckCircle2"]
                    phase['icon'] = icons[i] if i < len(icons) else "Search"
                if 'color' not in phase:
                    colors = ["emerald", "blue", "amber", "purple", "rose", "gray"]
                    phase['color'] = colors[i] if i < len(colors) else "gray"
                if 'status' not in phase:
                    phase['status'] = "ready" if i < 2 else "pending"
        
        # Ensure gantt_chart has correct structure
        if 'gantt_chart' in plan_data:
            colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-rose-500", "bg-gray-500"]
            for i, task in enumerate(plan_data['gantt_chart']):
                if 'color' not in task or not task['color'].startswith('bg-'):
                    task['color'] = colors[i] if i < len(colors) else "bg-gray-500"
        
        return plan_data
    
    def _get_fallback_plan(self) -> dict:
        """Return a basic fallback plan structure"""
        return {
            "error": "Failed to parse AI response",
            "project_summary": {
                "total_estimated_cost": "€0 - €0",
                "total_duration": "Unknown",
                "funding_readiness": "Needs Review",
                "complexity_level": "Unknown",
                "key_considerations": ["Unable to generate plan - please try again"]
            },
            "phases": [
                {
                    "id": 1,
                    "title": "Site Inspection",
                    "icon": "Search",
                    "duration": "1-2 weeks",
                    "cost": "€500 - €1,200",
                    "status": "ready",
                    "color": "emerald",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 2,
                    "title": "Energy Audit",
                    "icon": "Zap",
                    "duration": "1 week",
                    "cost": "€800 - €1,500",
                    "status": "ready",
                    "color": "blue",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 3,
                    "title": "Permit Preparation",
                    "icon": "FileText",
                    "duration": "2-3 weeks",
                    "cost": "€1,000 - €2,000",
                    "status": "pending",
                    "color": "amber",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 4,
                    "title": "Contractor Selection",
                    "icon": "Users",
                    "duration": "2-4 weeks",
                    "cost": "Variable",
                    "status": "pending",
                    "color": "purple",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 5,
                    "title": "Implementation",
                    "icon": "Wrench",
                    "duration": "8-12 weeks",
                    "cost": "€35,000 - €50,000",
                    "status": "pending",
                    "color": "rose",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                },
                {
                    "id": 6,
                    "title": "Final Inspection",
                    "icon": "CheckCircle2",
                    "duration": "1 week",
                    "cost": "€300 - €600",
                    "status": "pending",
                    "color": "gray",
                    "tasks": [],
                    "required_documents": [],
                    "stakeholders": []
                }
            ],
            "gantt_chart": [
                {"id": 1, "name": "Site Inspection", "start": 5, "duration": 10, "color": "bg-emerald-500"},
                {"id": 2, "name": "Energy Audit", "start": 15, "duration": 7, "color": "bg-blue-500"},
                {"id": 3, "name": "Permit Preparation", "start": 22, "duration": 14, "color": "bg-amber-500"},
                {"id": 4, "name": "Contractor Selection", "start": 36, "duration": 21, "color": "bg-purple-500"},
                {"id": 5, "name": "Implementation", "start": 57, "duration": 56, "color": "bg-rose-500"},
                {"id": 6, "name": "Final Inspection", "start": 113, "duration": 7, "color": "bg-gray-500"}
            ],
            "permits": [
                {
                    "id": "geg",
                    "name": "GEG Energy Compliance",
                    "description": "Compliance with the German Building Energy Act (GEG) for energy-efficient renovations.",
                    "checked": true
                },
                {
                    "id": "baug",
                    "name": "Baugenehmigung",
                    "description": "Building permit required for structural changes and major renovations.",
                    "checked": false
                },
                {
                    "id": "architect",
                    "name": "Architect Approval",
                    "description": "Professional architect review and approval for design and structural plans.",
                    "checked": false
                },
                {
                    "id": "energy-cert",
                    "name": "Energy Certificate",
                    "description": "Updated energy performance certificate post-renovation.",
                    "checked": false
                },
                {
                    "id": "heritage",
                    "name": "Heritage Protection Check",
                    "description": "Required if the building is listed or in a protected area.",
                    "checked": false
                }
            ],
            "next_steps": ["Contact support for assistance"]
        }


class MockGeminiService:
    """Mock service for testing without API calls"""
    
    def generate_renovation_plan(
        self,
        building_type: str,
        budget: float,
        location: str,
        building_size: int,
        renovation_goals: list,
        building_age: str,
        target_start_date: str,
        financing_preference: str,
        incentive_intent: str,
        living_during_renovation: str,
        heritage_protection: str,
        **kwargs
    ) -> dict:
        """Generate a mock renovation plan for testing"""
        
        goals_str = ", ".join(renovation_goals)
        
        mock_plan = {
            "project_summary": {
                "total_estimated_cost": f"€{budget * 0.8:,.0f} - €{budget * 1.2:,.0f}",
                "total_duration": "6-8 months",
                "funding_readiness": "Good Match" if incentive_intent == "yes_planning" else "Needs Review",
                "complexity_level": "Medium",
                "key_considerations": [
                    f"Building located in {location} with specific regional requirements",
                    f"Renovation goals include: {goals_str}",
                    f"Heritage protection: {heritage_protection}"
                ]
            },
            "phases": [
                {
                    "id": 1,
                    "title": "Site Inspection",
                    "icon": "Search",
                    "duration": "1-2 weeks",
                    "cost": f"€{budget * 0.02:,.0f} - €{budget * 0.03:,.0f}",
                    "status": "ready",
                    "color": "emerald",
                    "tasks": [
                        {
                            "task_name": "Initial building assessment",
                            "estimated_time": "2-3 days",
                            "estimated_cost": "€500 - €800",
                            "required_by": "Building Inspector"
                        }
                    ],
                    "required_documents": ["Building plans", "Property deed"],
                    "stakeholders": ["Building Inspector", "Architect"]
                },
                {
                    "id": 2,
                    "title": "Energy Audit",
                    "icon": "Zap",
                    "duration": "1 week",
                    "cost": f"€{budget * 0.015:,.0f} - €{budget * 0.025:,.0f}",
                    "status": "ready",
                    "color": "blue",
                    "tasks": [
                        {
                            "task_name": "Conduct energy assessment",
                            "estimated_time": "1 day",
                            "estimated_cost": "€800 - €1,500",
                            "required_by": "Energy Consultant"
                        }
                    ],
                    "required_documents": ["Energy consumption records"],
                    "stakeholders": ["Energy Consultant"]
                },
                {
                    "id": 3,
                    "title": "Permit Preparation",
                    "icon": "FileText",
                    "duration": "2-3 weeks",
                    "cost": f"€{budget * 0.03:,.0f} - €{budget * 0.05:,.0f}",
                    "status": "pending",
                    "color": "amber",
                    "tasks": [
                        {
                            "task_name": "Prepare building permit application",
                            "estimated_time": "1 week",
                            "estimated_cost": "€1,000 - €2,000",
                            "required_by": "Architect"
                        }
                    ],
                    "required_documents": ["Architectural plans", "Static calculations"],
                    "stakeholders": ["Architect", "Building Authority"]
                },
                {
                    "id": 4,
                    "title": "Contractor Selection",
                    "icon": "Users",
                    "duration": "2-4 weeks",
                    "cost": "Variable",
                    "status": "pending",
                    "color": "purple",
                    "tasks": [
                        {
                            "task_name": "Request quotes from contractors",
                            "estimated_time": "1 week",
                            "estimated_cost": "€0",
                            "required_by": "Homeowner"
                        }
                    ],
                    "required_documents": ["Contractor quotes"],
                    "stakeholders": ["Contractors"]
                },
                {
                    "id": 5,
                    "title": "Implementation",
                    "icon": "Wrench",
                    "duration": "8-12 weeks",
                    "cost": f"€{budget * 0.75:,.0f} - €{budget * 0.85:,.0f}",
                    "status": "pending",
                    "color": "rose",
                    "tasks": [
                        {
                            "task_name": "Execute renovation work",
                            "estimated_time": "8-12 weeks",
                            "estimated_cost": f"€{budget * 0.75:,.0f}",
                            "required_by": "Contractors"
                        }
                    ],
                    "required_documents": ["Construction permits"],
                    "stakeholders": ["All Contractors"]
                },
                {
                    "id": 6,
                    "title": "Final Inspection",
                    "icon": "CheckCircle2",
                    "duration": "1 week",
                    "cost": f"€{budget * 0.01:,.0f} - €{budget * 0.02:,.0f}",
                    "status": "pending",
                    "color": "gray",
                    "tasks": [
                        {
                            "task_name": "Final building inspection",
                            "estimated_time": "1 day",
                            "estimated_cost": "€300 - €600",
                            "required_by": "Building Inspector"
                        }
                    ],
                    "required_documents": ["Completion reports"],
                    "stakeholders": ["Building Inspector"]
                }
            ],
            "gantt_chart": [
                {"id": 1, "name": "Site Inspection", "start": 5, "duration": 10, "color": "bg-emerald-500"},
                {"id": 2, "name": "Energy Audit", "start": 15, "duration": 7, "color": "bg-blue-500"},
                {"id": 3, "name": "Permit Preparation", "start": 22, "duration": 14, "color": "bg-amber-500"},
                {"id": 4, "name": "Contractor Selection", "start": 36, "duration": 21, "color": "bg-purple-500"},
                {"id": 5, "name": "Implementation", "start": 57, "duration": 56, "color": "bg-rose-500"},
                {"id": 6, "name": "Final Inspection", "start": 113, "duration": 7, "color": "bg-gray-500"}
            ],
            "permits": [
                {
                    "id": "geg",
                    "name": "GEG Energy Compliance",
                    "description": "Compliance with the German Building Energy Act (GEG) for energy-efficient renovations.",
                    "checked": True
                },
                {
                    "id": "baug",
                    "name": "Baugenehmigung",
                    "description": "Building permit required for structural changes and major renovations.",
                    "checked": False
                },
                {
                    "id": "architect",
                    "name": "Architect Approval",
                    "description": "Professional architect review and approval for design and structural plans.",
                    "checked": False
                },
                {
                    "id": "energy-cert",
                    "name": "Energy Certificate",
                    "description": "Updated energy performance certificate post-renovation.",
                    "checked": False
                },
                {
                    "id": "heritage",
                    "name": "Heritage Protection Check",
                    "description": "Required if the building is listed or in a protected area.",
                    "checked": heritage_protection == "yes"
                }
            ],
            "budget_breakdown": {
                "total_estimated_cost": {
                    "min": budget * 0.9,
                    "max": budget * 1.15
                },
                "user_budget": budget,
                "financing_readiness": "Good Match",
                "cost_categories": [
                    {
                        "category": "Planning & Permits",
                        "estimated_cost": f"€{budget * 0.10:,.0f}",
                        "percentage_of_total": "10%",
                        "items": ["Architect fees", "Permits"]
                    }
                ],
                "contingency_fund": f"€{budget * 0.12:,.0f}"
            },
            "kfw_funding_eligibility": {
                "eligible_programs": [
                    {
                        "program_name": "KfW Efficient House 261",
                        "program_number": "261",
                        "type": "Loan with Grant",
                        "max_amount": "€150,000",
                        "requirements": ["Energy efficiency standard"],
                        "energy_standard_required": "EH 55"
                    }
                ],
                "estimated_total_funding": f"€{budget * 0.25:,.0f}",
                "application_deadline": "Before construction",
                "next_steps": ["Contact KfW consultant"]
            },
            "stakeholders": [
                {
                    "name": "Energy Consultant",
                    "role": "Energy assessment",
                    "when_needed": "Phase 2",
                    "estimated_cost": "€800 - €1,500",
                    "how_to_find": "Energie-Effizienz-Experten.de"
                }
            ],
            "risks_and_mitigation": [
                {
                    "risk": "Permit delays",
                    "likelihood": "Medium",
                    "impact": "High",
                    "mitigation": "Submit early"
                }
            ],
            "next_steps": [
                "Contact energy consultants",
                "Request building plans",
                "Research KfW programs"
            ],
            "ai_suggestions": [
                f"Prioritize energy efficiency for {building_type}",
                "Start permits in winter for spring construction",
                "Maximize KfW funding opportunities"
            ]
        }
        
        return {
            'success': True,
            'plan': mock_plan,
            'building_type': building_type,
            'budget': budget,
            'location': location,
            'error': None,
            'generated_at': datetime.now().isoformat()
        }


try:
    from groq import Groq
    
    class GroqService:
        """Service for interacting with Groq AI"""
        
        def __init__(self):
            """Initialize the Groq service with API key"""
            api_key = os.getenv('GROQ_API_KEY')
            
            if not api_key:
                raise ValueError("GROQ_API_KEY environment variable is not set")
            
            self.client = Groq(api_key=api_key)
        
        def generate_renovation_plan(
            self,
            building_type: str,
            budget: float,
            location: str,
            building_size: int,
            renovation_goals: list,
            building_age: str,
            target_start_date: str,
            financing_preference: str,
            incentive_intent: str,
            living_during_renovation: str,
            heritage_protection: str,
            **kwargs
        ) -> dict:
            """Generate a comprehensive renovation plan using Groq AI"""
            
            try:
                # Use the same prompt builder as GeminiService
                gemini_service = GeminiService.__new__(GeminiService)
                prompt = gemini_service._build_renovation_prompt(
                    building_type=building_type,
                    budget=budget,
                    location=location,
                    building_size=building_size,
                    renovation_goals=renovation_goals,
                    building_age=building_age,
                    target_start_date=target_start_date,
                    financing_preference=financing_preference,
                    incentive_intent=incentive_intent,
                    living_during_renovation=living_during_renovation,
                    heritage_protection=heritage_protection,
                    **kwargs
                )
                
                # Call Groq API
                chat_completion = self.client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="llama3-70b-8192",
                    temperature=0.7,
                    max_tokens=8000,
                )
                
                response_text = chat_completion.choices[0].message.content
                plan_data = gemini_service._parse_gemini_response(response_text)
                
                return {
                    'success': True,
                    'plan': plan_data,
                    'building_type': building_type,
                    'budget': budget,
                    'location': location,
                    'error': None,
                    'generated_at': datetime.now().isoformat()
                }
                
            except Exception as e:
                return {
                    'success': False,
                    'plan': None,
                    'building_type': building_type,
                    'budget': budget,
                    'location': location,
                    'error': str(e),
                    'generated_at': datetime.now().isoformat()
                }
                
except ImportError:
    class GroqService:
        def __init__(self):
            raise ValueError("Groq SDK not installed. Install with: pip install groq")