import uuid
from django.core.cache import cache
import google.generativeai as genai
from django.conf import settings


class ChatbotService:
	def __init__(self):
		# Configure Gemini API
		genai.configure(api_key=settings.GEMINI_API_KEY)
		self.model = genai.GenerativeModel('gemini-2.5-pro')
	
	def get_session_key(self, session_id):
		"""Generate cache key for session"""
		return f"chatbot_session_{session_id}"
	
	def get_conversation_history(self, session_id):
		"""Retrieve conversation history from cache"""
		cache_key = self.get_session_key(session_id)
		history = cache.get(cache_key, [])
		return history
	
	def save_conversation_history(self, session_id, history):
		"""Save conversation history to cache (expires in 1 hour)"""
		cache_key = self.get_session_key(session_id)
		# Keep only last 10 messages
		history = history[-10:]
		cache.set(cache_key, history, 3600)  # 1 hour timeout
	
	def generate_response(self, message, session_id=None, image=None):
		"""Generate AI response for user message"""
		# Generate session_id if not provided
		if not session_id:
			session_id = str(uuid.uuid4())
		
		# Get conversation history
		history = self.get_conversation_history(session_id)
		print('Conversation history:', history)
		
		# Build prompt with context
		system_prompt = """You are a helpful AI assistant specializing in home renovation in Germany.
You help users with:
- Renovation planning and cost estimation
- German building regulations (EnEV/GEG)
- KfW funding and financing options
- Contractor selection and coordination
- Energy efficiency improvements

Provide practical, accurate advice specific to German regulations and market conditions.
Keep responses concise and helpful.**MUST BE IN ENGLISH**"""
		
		# Format conversation history
		conversation_context = "\n".join([
			f"User: {msg['user']}\nAssistant: {msg['assistant']}" 
			for msg in history
		])
		
		# Create full prompt
		full_prompt = f"""{system_prompt}

Previous conversation:
{conversation_context}

User: {message}
Assistant:"""
		
		try:
			if image:
			# Read image bytes
				image_bytes = image.read()
				# Create image part for Gemini
				image_part = {"mime_type": image.content_type, "data": image_bytes}
				# Send both text and image
				response = self.model.generate_content([full_prompt, image_part])
			else:
				response = self.model.generate_content(full_prompt)
			# Generate response using Gemini
			# response = self.model.generate_content(full_prompt)
			ai_response = response.text
		except Exception as e:
			# Fallback response if API fails
			ai_response = f"I'm sorry, I'm having trouble processing your request right now. Error: {str(e)}"
		
		# Update conversation history
		history.append({
			"user": message,
			"assistant": ai_response
		})
		self.save_conversation_history(session_id, history)
		
		return {
			"response": ai_response,
			"session_id": session_id
		}


# Mock service for testing without API key
class MockChatbotService:
	def generate_response(self, message, session_id=None):
		"""Mock response for testing"""
		if not session_id:
			session_id = str(uuid.uuid4())
		
		# Simple mock responses based on keywords
		message_lower = message.lower()
		
		if "kfw" in message_lower or "funding" in message_lower:
			response = "KfW offers various funding programs for energy-efficient renovations in Germany. The most popular programs include KfW 261 for residential buildings with grants up to 45% of costs for certain energy efficiency levels."
		elif "cost" in message_lower or "price" in message_lower:
			response = "Renovation costs in Germany vary widely depending on the scope. On average, energy-efficient window replacement costs €400-800 per window, roof insulation €50-100 per m², and heating system upgrades €8,000-15,000."
		elif "permit" in message_lower or "approval" in message_lower:
			response = "Building permits (Baugenehmigung) are required for structural changes, extensions, and changes to the building's appearance. Energy efficiency improvements typically don't require permits unless they affect the building's structure."
		else:
			response = f"Thank you for your question about renovation in Germany. I can help you with planning, costs, regulations, and financing. Could you provide more specific details about what you'd like to know?"
		
		return {
			"response": response,
			"session_id": session_id
		}