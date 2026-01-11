import uuid
import google.generativeai as genai
from django.conf import settings
from core.models import ChatSession, ChatMessage, UserMemory, SessionType, MessageRole, MemoryType


class ChatbotService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def get_or_create_session(self, user, session_id=None, project=None):
        """
        Get existing session or create new one for user.
        """
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=user)
                return session
            except ChatSession.DoesNotExist:
                pass
        
        # Create new session
        session = ChatSession.objects.create(
            user=user,
            project=project,
            session_type=SessionType.PLANNING,
            title="New Renovation Chat"
        )
        return session

    def get_conversation_history(self, session):
        """
        Retrieve conversation history from database.
        """
        messages = ChatMessage.objects.filter(session=session).order_by('created_at')
        history = []
        for msg in messages:
            history.append({
                "role": msg.role,
                "content": msg.content
            })
        return history

    def save_message(self, session, role, content, metadata=None):
        """
        Save a single message to database.
        """
        return ChatMessage.objects.create(
            session=session,
            role=role,
            content=content,
            metadata=metadata or {}
        )

    def get_user_memories(self, user):
        """
        Retrieve active memories for user to include in context.
        """
        memories = UserMemory.objects.filter(user=user, is_active=True)
        if not memories.exists():
            return ""
        
        memory_text = "## Known Information About User:\n"
        for mem in memories:
            memory_text += f"- {mem.key}: {mem.value}\n"
        return memory_text

    def generate_response(self, message, user, session_id=None, project=None, image=None):
        """
        Generate AI response for user message.
        Now uses database instead of cache.
        """
        # Get or create session
        session = self.get_or_create_session(user, session_id, project)
        
        # Get conversation history
        history = self.get_conversation_history(session)
        
        # Get user memories for context
        user_memories = self.get_user_memories(user)
        
        system_prompt = """You are a friendly renovation planning assistant for buildings in Germany. Your goal is to have a natural conversation to understand what the user wants to renovate and gather enough details to create a useful renovation plan.

## YOUR APPROACH:
- Be conversational and natural, not like a form or checklist
- Adapt your questions based on what the user wants to do
- If they want to change tiles, ask about tiles. If they want energy efficiency, ask about that.
- Ask follow-up questions that make sense for THEIR specific renovation goals
- One question at a time, but keep it flowing naturally

## CORE INFORMATION TO EVENTUALLY UNDERSTAND:
- What they want to renovate or change (could be anything: tiles, windows, heating, kitchen, bathroom, roof, facade, energy upgrades, full renovation, etc.)
- Basic building info (type, approximate size, age - but only if relevant to their project)
- Location in Germany (Bundesland) - for regulations
- Their budget range
- When they want to do it
- Current state of what they want to change

## ADAPTIVE QUESTIONING EXAMPLES:

If user says "I want to change my bathroom tiles":
- What kind of tiles are you thinking? (floor, wall, both?)
- How big is the bathroom approximately?
- Are the current tiles damaged or just outdated?
- Do you want to change just tiles or also fixtures?

If user says "I want to improve energy efficiency":
- What's your main concern? (heating costs, insulation, windows?)
- How old is your building approximately?
- Do you know your current energy rating?
- What's causing the most heat loss?

If user says "complete renovation":
- What's the building type?
- Which areas are priority for you?
- What's the current condition?
- What's your overall budget range?

## RULES:
1. DO NOT ask robotic checklist questions
2. DO NOT force all 8 data points if they're not relevant
3. DO adapt to what the user actually cares about
4. DO ask relevant follow-up questions for their specific project
5. DO remember what they've told you - don't repeat questions
6. Keep responses concise - 2-3 sentences max, then your question
7. If user uploads an image, analyze it and ask relevant questions about what you see

## WHEN YOU HAVE ENOUGH INFORMATION:
When you feel you understand their project well enough (usually after 4-8 exchanges), summarize what you've learned naturally and tell them to click the "Generate Plan" button.

DO NOT generate the plan yourself. DO NOT offer to create it. Just confirm the details and direct them to the button."""

        # Build conversation context
        conversation_context = "\n".join([
            f"{msg['role'].capitalize()}: {msg['content']}"
            for msg in history
        ])

        full_prompt = f"""{system_prompt}

{user_memories}

Previous conversation:
{conversation_context}

User: {message}
Assistant:"""

        try:
            if image:
                image_bytes = image.read()
                image_part = {"mime_type": image.content_type, "data": image_bytes}
                response = self.model.generate_content([full_prompt, image_part])
            else:
                response = self.model.generate_content(full_prompt)
            ai_response = response.text
        except Exception as e:
            ai_response = f"I'm sorry, I'm having trouble processing your request right now. Error: {str(e)}"

        # Save user message
        self.save_message(session, MessageRole.USER, message)
        
        # Save assistant response
        self.save_message(session, MessageRole.ASSISTANT, ai_response)
        
        # Update session title if first message
        if len(history) == 0:
            title = message[:50] + "..." if len(message) > 50 else message
            session.title = title
            session.save()

        return {
            "response": ai_response,
            "session_id": session.id
        }

    def get_user_sessions(self, user, active_only=True):
        """
        Get all chat sessions for a user.
        """
        queryset = ChatSession.objects.filter(user=user)
        if active_only:
            queryset = queryset.filter(is_active=True)
        return queryset

    def extract_plan_data(self, session_id, user):
        """
        Extract structured renovation plan data from conversation history.
        """
        try:
            session = ChatSession.objects.get(id=session_id, user=user)
        except ChatSession.DoesNotExist:
            return {
                "success": False,
                "error": "Session not found",
                "data": None
            }

        history = self.get_conversation_history(session)

        if not history:
            return {
                "success": False,
                "error": "No conversation history found",
                "data": None
            }

        conversation_text = "\n".join([
            f"{msg['role'].capitalize()}: {msg['content']}"
            for msg in history
        ])

        extraction_prompt = f"""Analyze this conversation and extract ALL renovation-related information the user provided.

Conversation:
{conversation_text}

Extract and return a JSON object with these fields (use null for missing info):
{{
    "building_type": "apartment/house/commercial/other",
    "building_age": "year or decade",
    "building_size": "square meters as number",
    "location": "city or Bundesland",
    "budget": "number in euros",
    "renovation_goals": ["list", "of", "goals"],
    "specific_materials": ["any specific materials mentioned"],
    "rooms_involved": ["list of rooms"],
    "current_condition": "description",
    "timeline": "when they want to start/finish",
    "special_requirements": ["any special needs mentioned"],
    "heating_system": "if mentioned",
    "energy_goals": "if mentioned"
}}

Return ONLY valid JSON, no other text."""

        try:
            response = self.model.generate_content(extraction_prompt)
            response_text = response.text.strip()
            
            # Clean up response
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            import json
            extracted_data = json.loads(response_text.strip())
            
            # Save extracted data to session
            session.extracted_data = extracted_data
            session.save()
            
            # Save key facts to UserMemory
            self._save_to_user_memory(user, session, extracted_data)
            
            return {
                "success": True,
                "data": extracted_data,
                "session_id": session.id
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Extraction failed: {str(e)}",
                "data": None
            }

    def _save_to_user_memory(self, user, session, extracted_data):
        """
        Save extracted facts to UserMemory for long-term storage.
        """
        memory_mappings = [
            ("building_type", MemoryType.BUILDING_INFO),
            ("building_age", MemoryType.BUILDING_INFO),
            ("building_size", MemoryType.BUILDING_INFO),
            ("location", MemoryType.BUILDING_INFO),
            ("budget", MemoryType.BUDGET),
            ("timeline", MemoryType.TIMELINE),
            ("heating_system", MemoryType.BUILDING_INFO),
        ]
        
        for key, memory_type in memory_mappings:
            value = extracted_data.get(key)
            if value and value != "null" and value is not None:
                UserMemory.objects.update_or_create(
                    user=user,
                    key=key,
                    defaults={
                        "value": str(value),
                        "memory_type": memory_type,
                        "source_session": session,
                        "is_active": True
                    }
                )
        
        # Handle list fields
        list_fields = [
            ("specific_materials", MemoryType.MATERIAL),
            ("renovation_goals", MemoryType.PROJECT_DETAIL),
        ]
        
        for key, memory_type in list_fields:
            value = extracted_data.get(key)
            if value and isinstance(value, list) and len(value) > 0:
                UserMemory.objects.update_or_create(
                    user=user,
                    key=key,
                    defaults={
                        "value": ", ".join(str(v) for v in value),
                        "memory_type": memory_type,
                        "source_session": session,
                        "is_active": True
                    }
                )