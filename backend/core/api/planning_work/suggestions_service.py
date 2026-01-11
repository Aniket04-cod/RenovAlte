import google.generativeai as genai
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)


class SuggestionsService:
    """Service to generate dynamic AI suggestions based on user inputs"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def generate_suggestions(self, context: dict) -> list:
        """
        Generate AI suggestions based on current renovation context.
        
        Args:
            context: Dictionary containing current user inputs like:
                - building_type
                - budget
                - location (bundesland)
                - goals
                - renovation_specification
                - current_question (if in dynamic flow)
                - dynamic_answers (accumulated answers)
        
        Returns:
            List of suggestion dictionaries with id, icon, text, priority, color
        """
        
        prompt = f"""You are a German renovation planning assistant. Based on the user's current inputs, generate 4 helpful, actionable suggestions.

## Current User Context:
- Building Type: {context.get('building_type', 'Not specified')}
- Budget: €{context.get('budget', 'Not specified')}
- Location: {context.get('location', 'Germany')}
- Renovation Goals: {', '.join(context.get('goals', [])) or 'Not specified'}
- Renovation Specification: {context.get('renovation_specification', 'Not specified')}
- Renovation Standard: {context.get('renovation_standard', 'Not specified')}
- Current Question Being Asked: {context.get('current_question', 'None')}
- Previous Answers: {json.dumps(context.get('dynamic_answers', {}), indent=2)}

## IMPORTANT RULES:
1. Respond ONLY in English
2. Keep each suggestion SHORT - maximum 10-12 words
3. Be specific to their renovation type and goals
4. Focus on German regulations, permits, and funding (KfW, BAFA)
5. Make suggestions actionable and practical

## Examples of good short suggestions:
- "Apply for KfW 261 funding before starting work"
- "Schedule energy audit within 2 weeks"
- "Check Hessen permit requirements for facade work"
- "Compare heat pump vs gas heating costs"
- "Get 3 contractor quotes for insulation work"

## Response Format (JSON array):
[
  {{
    "id": 1,
    "icon": "AlertCircle",
    "text": "Short suggestion here (max 12 words)",
    "priority": "high",
    "color": "text-rose-600",
    "bgColor": "bg-rose-50"
  }},
  {{
    "id": 2,
    "icon": "Lightbulb",
    "text": "Short suggestion here (max 12 words)",
    "priority": "medium",
    "color": "text-amber-600",
    "bgColor": "bg-amber-50"
  }},
  {{
    "id": 3,
    "icon": "TrendingUp",
    "text": "Short suggestion here (max 12 words)",
    "priority": "high",
    "color": "text-emerald-600",
    "bgColor": "bg-emerald-50"
  }},
  {{
    "id": 4,
    "icon": "Sparkles",
    "text": "Short suggestion here (max 12 words)",
    "priority": "medium",
    "color": "text-blue-600",
    "bgColor": "bg-blue-50"
  }}
]

## Icon Options:
- "AlertCircle" - for urgent/deadlines (rose/red)
- "Lightbulb" - for tips/ideas (amber/yellow)
- "TrendingUp" - for funding/financial (emerald/green)
- "Sparkles" - for general recommendations (blue)
- "Clock" - for timeline related
- "FileText" - for documentation/permits
- "Euro" - for budget/cost related

Return ONLY the JSON array, no other text. Keep suggestions SHORT and in ENGLISH.
"""

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up response
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            suggestions = json.loads(response_text.strip())
            return suggestions
            
        except Exception as e:
            logger.error(f"Error generating suggestions: {str(e)}")
            # Return default suggestions on error
            return self._get_default_suggestions()
    
    def _get_default_suggestions(self) -> list:
        """Return default suggestions if AI generation fails"""
        return [
            {
                "id": 1,
                "icon": "AlertCircle",
                "text": "Check permit requirements for your Bundesland",
                "priority": "high",
                "color": "text-rose-600",
                "bgColor": "bg-rose-50"
            },
            {
                "id": 2,
                "icon": "Lightbulb",
                "text": "Consider energy efficiency upgrades for grants",
                "priority": "medium",
                "color": "text-amber-600",
                "bgColor": "bg-amber-50"
            },
            {
                "id": 3,
                "icon": "TrendingUp",
                "text": "Explore KfW funding programs",
                "priority": "high",
                "color": "text-emerald-600",
                "bgColor": "bg-emerald-50"
            },
            {
                "id": 4,
                "icon": "Sparkles",
                "text": "Schedule an energy audit",
                "priority": "medium",
                "color": "text-blue-600",
                "bgColor": "bg-blue-50"
            }
        ]