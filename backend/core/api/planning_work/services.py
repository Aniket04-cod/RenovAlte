import os
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import google.generativeai as genai


class GeminiService:
    """Service for interacting with Google's Gemini AI"""
    
    def __init__(self):
        """Initialize the Gemini service with API key"""
        # SECURITY UPDATE: Prefer environment variable, fallback only for dev/testing
        api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key:
            # Fallback for local dev if env var not set (Note: In production, always use env var)
            # This key should be revoked if exposed publicly
            print('static api')
            api_key = 'AIzaSyAsz-WVpqz_8-NhRIyjrnOW7R9Y9f-NGKo'
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-pro')

    def generate_next_question(self, current_answers: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate the next contextual question based on current answers
        """
        try:
            prompt = self._build_question_generation_prompt(current_answers)
            response = self.model.generate_content(prompt)
            return self._parse_json_response(response.text)
        except Exception as e:
            # Fallback if AI fails
            print(f"Question generation failed: {e}")
            return {
                "question_text": "Are there any other specific details about the property you would like to add?",
                "explanation": "We want to ensure we cover all bases.",
                "input_type": "text",
                "options": []
            }

    def generate_renovation_plan(
        self,
        building_type: str,
        budget: float,
        location: str,
        building_size: int,
        renovation_goals: list,
        # ... keep existing args for backward compatibility if needed ...
        # New argument for dynamic flow:
        dynamic_context: Dict[str, Any] = None,
        **kwargs
    ) -> dict:
        """
        Generate a comprehensive renovation plan using Gemini AI, 
        incorporating both static and dynamic context.
        """
        try:
            # Merge standard args with dynamic context if provided
            context = dynamic_context if dynamic_context else {}
            
            # Ensure core fields are present in context (override if passed explicitly)
            context.update({
                "building_type": building_type,
                "budget": budget,
                "location": location,
                "building_size": building_size,
                "renovation_goals": renovation_goals,
                **kwargs # specific fields like building_age, etc.
            })

            prompt = self._build_renovation_prompt_dynamic(context)
            
            # Generate content using Gemini
            response = self.model.generate_content(prompt)
            
            # Parse the response
            plan_data = self._parse_json_response(response.text)
            
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
            print(f"Plan generation failed: {e}")
            return {
                'success': False,
                'plan': None,
                'building_type': building_type,
                'budget': budget,
                'location': location,
                'error': str(e),
                'generated_at': datetime.now().isoformat()
            }
    
    def _build_question_generation_prompt(self, current_answers: Dict[str, Any]) -> str:
        return f"""
You are an expert renovation consultant in Germany (specializing in GEG, KfW funding, and construction).
The user is planning a renovation. Here is what we know so far:

{json.dumps(current_answers, indent=2)}

Your task: Identify the SINGLE most critical missing piece of information needed to create a precise renovation plan, timeline, or compliance check.
Generate ONE follow-up question to ask the user.

**IMPORTANT LANGUAGE REQUIREMENT:** The "question_text", "explanation", and any "label" in options **MUST BE IN ENGLISH**. 
Do not output German text, even though the context is Germany.

Return EXACT JSON format:
{{
    "question_id": "unique_string_id",
    "question_text": "The question string (in English)",
    "explanation": "Brief reason why this info is needed (e.g., 'Required for KfW 261 eligibility') (in English)",
    "input_type": "select" OR "text" OR "number" OR "date",
    "options": [  // Only if input_type is 'select'
        {{"value": "opt1", "label": "Option Label 1 (in English)"}},
        {{"value": "opt2", "label": "Option Label 2 (in English)"}}
    ]
}}
"""

    def _build_renovation_prompt_dynamic(self, context: Dict[str, Any]) -> str:
        """Build a prompt using the full dynamic context"""
        
        return f"""
You are an expert renovation consultant specializing in German building regulations (GEG), KfW grants, and construction planning.

Generate a comprehensive, structured renovation plan in JSON format based on these project details:

{json.dumps(context, indent=2)}

**IMPORTANT LANGUAGE REQUIREMENT:**
All text content in the JSON (titles, descriptions, tasks, reasons, suggestions) **MUST BE IN ENGLISH**.

**CRITICAL: Follow this EXACT JSON structure for frontend compatibility:**

{{
    "project_summary": {{
        "total_estimated_cost": "€X - €Y",
        "total_duration": "X-Y months",
        "funding_readiness": "Good Match/Partial Match/Needs Review",
        "complexity_level": "Low/Medium/High",
        "key_considerations": ["point1", "point2"]
    }},
    
    "phases": [
        {{
            "id": 1,
            "title": "Phase Title",
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
                    "required_by": "Stakeholder"
                }}
            ],
            "required_documents": ["doc1"],
            "stakeholders": ["role1"]
        }}
        // ... Generate exactly 6 phases ...
    ],
    
    "gantt_chart": [
        {{
            "id": 1,
            "name": "Phase Title",
            "start": 0,
            "duration": 10,
            "color": "bg-emerald-500"
        }}
        // ... Generate exactly 6 items matching phases ...
    ],
    
    "permits": [
        {{
            "id": "geg",
            "name": "GEG Energy Compliance",
            "description": "Compliance with German Building Energy Act",
            "checked": true
        }},
         {{
            "id": "baug",
            "name": "Baugenehmigung",
            "description": "Building permit",
            "checked": false
        }},
        {{
            "id": "architect",
            "name": "Architect Approval",
            "description": "Architect review",
            "checked": false
        }},
        {{
            "id": "energy-cert",
            "name": "Energy Certificate",
            "description": "Energy performance certificate",
            "checked": false
        }},
        {{
            "id": "heritage",
            "name": "Heritage Protection Check",
            "description": "Denkmalschutz check",
            "checked": false
        }}
    ],
    
    "stakeholders": [
        {{
            "name": "Role Name",
            "role": "Description",
            "when_needed": "Phase X",
            "estimated_cost": "€X",
            "how_to_find": "Source"
        }}
    ],

    "ai_suggestions": [
        "Suggestion 1",
        "Suggestion 2",
        "Suggestion 3"
    ]
}}

**RULES:**
1. phases MUST have exactly 6 items (ids 1-6).
2. phases icons must be one of: "Search", "Zap", "FileText", "Users", "Wrench", "CheckCircle2".
3. gantt_chart 'start' is cumulative days from start. 'duration' is days.
4. permits must include the 5 specific IDs listed above.
5. Infer 'checked' status for permits based on the user context (e.g., if heritage protection is 'yes', that permit is likely checked/required).
6. Provide ONLY valid JSON.
"""

    def _parse_json_response(self, response_text: str) -> dict:
        """Helper to parse JSON from AI response, handling markdown blocks"""
        try:
            cleaned_text = response_text.strip()
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith('```'):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            return json.loads(cleaned_text.strip())
        except json.JSONDecodeError:
            return {}