from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
import os
from core.services.gemini_service import GeminiService
from core.services.prompt_builder import PromptBuilder
from core.services.gemini_image_service import GeminiImageService


@method_decorator(csrf_exempt, name='dispatch')
class CostEstimationView(APIView):
	"""
	API endpoint for generating cost estimation using Gemini AI
	Receives user's financing form data and returns cost estimate
	"""
	authentication_classes = []
	permission_classes = [AllowAny]

	def post(self, request):
		"""
		Generate cost estimation based on user's Q&A responses

		Request body should contain:
		- renovationType: string
		- bathroomSize: string (optional, if bathroom renovation)
		- bathroomElements: list (optional, if bathroom renovation)
		- bathroomAccessibility: string (optional, if bathroom renovation)
		- bathroomPlumbing: string (optional, if bathroom renovation)
		- bathroomCondition: string (optional, if bathroom renovation)
		"""
		try:
			import sys
			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("STEP 1: RECEIVE FORM DATA FROM FRONTEND", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()

			# Get form data from request
			form_data = request.data
			print(f"Received form data: {form_data}", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Validate required fields
			if not form_data.get('renovationType'):
				return Response(
					{'error': 'renovationType is required'},
					status=status.HTTP_400_BAD_REQUEST
				)

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("STEP 2: CONSTRUCT PROMPT FOR GEMINI", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()

			# Build the prompt from form data
			prompt_builder = PromptBuilder()
			prompt = prompt_builder.build_cost_estimation_prompt(form_data)

			print("\n>>> FULL PROMPT BEING SENT TO GEMINI API <<<", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print(prompt, flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Get Gemini API key from environment
			api_key = os.environ.get('GEMINI_API_KEY')
			if not api_key:
				return Response(
					{'error': 'Gemini API key not configured on server'},
					status=status.HTTP_500_INTERNAL_SERVER_ERROR
				)

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("STEP 3: SEND REQUEST TO GEMINI API", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print("Calling Gemini API with the constructed prompt...", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Call Gemini API
			gemini_service = GeminiService(api_key)
			cost_estimate = gemini_service.generate_cost_estimate(prompt)

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("STEP 4: RECEIVE AI OUTPUT FROM GEMINI", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print(">>> COST ESTIMATE RESPONSE FROM GEMINI <<<", flush=True)
			sys.stdout.flush()
			print(cost_estimate, flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("STEP 5: RETURN RESULT TO FRONTEND", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print("Sending cost estimate back to frontend...", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Return both the cost estimate AND the original prompt for future use
			response_data = {
				**cost_estimate,
				'_originalPrompt': prompt,  # Store original prompt for subsequent API calls
				'_formData': form_data  # Store form data for context
			}

			return Response(response_data, status=status.HTTP_200_OK)

		except Exception as e:
			error_message = str(e)
			print(f"\n[ERROR] Cost estimation failed: {error_message}\n")

			# Check if it's a rate limit error
			if "RATE_LIMIT_ERROR" in error_message:
				return Response(
					{
						'error': 'API Rate Limit Exceeded',
						'message': 'Your Gemini API key has exceeded its quota limit.',
						'details': error_message.replace("RATE_LIMIT_ERROR: ", ""),
						'suggestions': [
							'Wait a few minutes before trying again',
							'Check your Google AI Studio quota at https://aistudio.google.com/',
							'Consider upgrading to a paid plan for higher quotas',
							'Verify your API key is correctly configured'
						]
					},
					status=status.HTTP_429_TOO_MANY_REQUESTS
				)

			# Generic error
			return Response(
				{
					'error': 'Failed to generate cost estimation',
					'message': 'An error occurred while processing your request',
					'details': error_message
				},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)


@method_decorator(csrf_exempt, name='dispatch')
class FinancingOptionsView(APIView):
	"""
	API endpoint for generating financing options based on cost estimate
	Receives original prompt and cost estimate response
	"""
	authentication_classes = []
	permission_classes = [AllowAny]

	def post(self, request):
		"""
		Generate financing options based on cost estimate

		Request body should contain:
		- original_prompt: string (the prompt sent to Gemini for cost estimation)
		- cost_estimate: object (the cost estimate response from Gemini)
		- form_data: object (original form data for context)
		"""
		try:
			import sys
			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("FINANCING OPTIONS - STEP 1: RECEIVE DATA FROM FRONTEND", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()

			# Get request data
			original_prompt = request.data.get('original_prompt', '')
			cost_estimate = request.data.get('cost_estimate', {})
			form_data = request.data.get('form_data', {})

			print(f"Original Prompt Length: {len(original_prompt)} characters", flush=True)
			sys.stdout.flush()
			print(f"Cost Estimate Total: €{cost_estimate.get('totalEstimatedCost', 0)}", flush=True)
			sys.stdout.flush()
			print(f"Form Data Keys: {list(form_data.keys())}", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Validate required fields
			if not original_prompt or not cost_estimate:
				return Response(
					{'error': 'original_prompt and cost_estimate are required'},
					status=status.HTTP_400_BAD_REQUEST
				)

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("FINANCING OPTIONS - STEP 2: CONSTRUCT PROMPT FOR GEMINI", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()

			# Build the financing options prompt
			prompt_builder = PromptBuilder()
			financing_prompt = prompt_builder.build_financing_options_prompt(
				original_prompt,
				cost_estimate,
				form_data
			)

			print("\n>>> FULL PROMPT BEING SENT TO GEMINI API FOR FINANCING OPTIONS <<<", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print(financing_prompt, flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Get Gemini API key from environment
			api_key = os.environ.get('GEMINI_API_KEY')
			if not api_key:
				return Response(
					{'error': 'Gemini API key not configured on server'},
					status=status.HTTP_500_INTERNAL_SERVER_ERROR
				)

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("FINANCING OPTIONS - STEP 3: SEND REQUEST TO GEMINI API", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print("Calling Gemini API with the constructed prompt...", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Call Gemini API
			gemini_service = GeminiService(api_key)
			financing_options = gemini_service.generate_financing_options(financing_prompt)

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("FINANCING OPTIONS - STEP 4: RECEIVE AI OUTPUT FROM GEMINI", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print(">>> FINANCING OPTIONS RESPONSE FROM GEMINI <<<", flush=True)
			sys.stdout.flush()
			print(financing_options, flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("FINANCING OPTIONS - STEP 5: RETURN RESULT TO FRONTEND", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print("Sending financing options back to frontend...", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			return Response(financing_options, status=status.HTTP_200_OK)

		except Exception as e:
			error_message = str(e)
			print(f"\n[ERROR] Financing options generation failed: {error_message}\n")

			# Check if it's a rate limit error
			if "RATE_LIMIT_ERROR" in error_message:
				return Response(
					{
						'error': 'API Rate Limit Exceeded',
						'message': 'Your Gemini API key has exceeded its quota limit.',
						'details': error_message.replace("RATE_LIMIT_ERROR: ", ""),
						'suggestions': [
							'Wait a few minutes before trying again',
							'Check your Google AI Studio quota at https://aistudio.google.com/',
							'Consider upgrading to a paid plan for higher quotas'
						]
					},
					status=status.HTTP_429_TOO_MANY_REQUESTS
				)

			# Generic error
			return Response(
				{
					'error': 'Failed to generate financing options',
					'message': 'An error occurred while processing your request',
					'details': error_message
				},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)


@method_decorator(csrf_exempt, name='dispatch')
class ImageGenerationView(APIView):
	"""
	API endpoint for generating renovation visualization images
	"""
	authentication_classes = []
	permission_classes = [AllowAny]

	def post(self, request):
		"""
		Generate image based on renovation details

		Request body should contain:
		- original_prompt: string
		- cost_estimate: object
		- form_data: object
		"""
		try:
			import sys
			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("IMAGE GENERATION - STEP 1: RECEIVE DATA FROM FRONTEND", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()

			original_prompt = request.data.get('original_prompt', '')
			cost_estimate = request.data.get('cost_estimate', {})
			form_data = request.data.get('form_data', {})

			print(f"Original Prompt Length: {len(original_prompt)} characters", flush=True)
			sys.stdout.flush()
			print(f"Renovation Type: {form_data.get('renovationType', 'N/A')}", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			if not original_prompt or not cost_estimate:
				return Response(
					{'error': 'original_prompt and cost_estimate are required'},
					status=status.HTTP_400_BAD_REQUEST
				)

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("IMAGE GENERATION - STEP 2: CONSTRUCT PROMPT FOR GEMINI", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()

			# Build the image generation prompt
			prompt_builder = PromptBuilder()
			image_prompt = prompt_builder.build_image_generation_prompt(
				original_prompt,
				cost_estimate,
				form_data
			)

			print("\n>>> FULL PROMPT BEING SENT TO GEMINI API FOR IMAGE GENERATION <<<", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print(image_prompt, flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Get Gemini API key
			api_key = os.environ.get('GEMINI_API_KEY')
			if not api_key:
				return Response(
					{'error': 'Gemini API key not configured on server'},
					status=status.HTTP_500_INTERNAL_SERVER_ERROR
				)

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("IMAGE GENERATION - STEP 3: GENERATE HIGH-QUALITY IMAGE (FREE)", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print("Using Hugging Face Stable Diffusion XL (FREE)...", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Initialize Image Service
			image_service = GeminiImageService()

			# Generate actual image
			image_result = image_service.generate_image(image_prompt)

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("IMAGE GENERATION - STEP 4: RECEIVE IMAGE FROM API", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print(">>> IMAGE GENERATED SUCCESSFULLY <<<", flush=True)
			sys.stdout.flush()
			print(f"Image size: {image_result.get('width')}x{image_result.get('height')}", flush=True)
			sys.stdout.flush()
			print(f"Format: {image_result.get('image_format')}", flush=True)
			sys.stdout.flush()
			print(f"Base64 length: {len(image_result.get('image_base64', ''))} characters", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			# Create a clean user-friendly description
			renovation_type = form_data.get('renovationType', 'Renovation')
			design_style = form_data.get('designStyle', 'modern')

			# Extract color scheme
			color_scheme = form_data.get('colorScheme', {})
			main_color = color_scheme.get('main', '')
			accent_color = color_scheme.get('accent', '')

			color_text = ""
			if main_color and accent_color:
				color_text = f" with {main_color.lower()} and {accent_color.lower()} tones"
			elif main_color:
				color_text = f" with {main_color.lower()} tones"

			user_friendly_description = f"Professional {design_style.lower()} {renovation_type.lower()} renovation visualization{color_text}"

			# Replace the raw prompt with user-friendly description
			image_result['prompt'] = user_friendly_description
			image_result['description'] = user_friendly_description

			print("\n" + "="*80, flush=True)
			sys.stdout.flush()
			print("IMAGE GENERATION - STEP 5: RETURN RESULT TO FRONTEND", flush=True)
			sys.stdout.flush()
			print("="*80, flush=True)
			sys.stdout.flush()
			print("Sending generated image back to frontend...", flush=True)
			sys.stdout.flush()
			print(f"Description: {user_friendly_description}", flush=True)
			sys.stdout.flush()
			print("="*80 + "\n", flush=True)
			sys.stdout.flush()

			return Response(image_result, status=status.HTTP_200_OK)

		except Exception as e:
			error_message = str(e)
			print(f"\n[ERROR] Image generation failed: {error_message}\n")

			if "RATE_LIMIT_ERROR" in error_message:
				return Response(
					{
						'error': 'API Rate Limit Exceeded',
						'message': 'Your Gemini API key has exceeded its quota limit.',
						'details': error_message.replace("RATE_LIMIT_ERROR: ", "")
					},
					status=status.HTTP_429_TOO_MANY_REQUESTS
				)

			return Response(
				{
					'error': 'Failed to generate image description',
					'message': error_message
				},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)


@method_decorator(csrf_exempt, name='dispatch')
class AIChatView(APIView):
	"""
	API endpoint for AI chat assistant
	Receives user messages and returns AI responses with full logging
	"""
	authentication_classes = []
	permission_classes = [AllowAny]

	def post(self, request):
		"""
		Handle AI chat messages

		Request body should contain:
		- message: string (user's message)
		- conversation_history: list (optional, previous messages)
		"""
		try:
			print("\n" + "="*80)
			print("AI CHAT REQUEST RECEIVED")
			print("="*80)

			# Get request data
			user_message = request.data.get('message', '')
			conversation_history = request.data.get('conversation_history', [])

			print(f"User Message: {user_message}")
			print(f"Conversation History Length: {len(conversation_history)} messages")
			print("="*80 + "\n")

			if not user_message:
				return Response(
					{'error': 'Message is required'},
					status=status.HTTP_400_BAD_REQUEST
				)

			# Get Gemini API key from environment
			api_key = os.environ.get('GEMINI_API_KEY')
			if not api_key:
				return Response(
					{'error': 'Gemini API key not configured on server'},
					status=status.HTTP_500_INTERNAL_SERVER_ERROR
				)

			print("\n" + "="*80)
			print("BUILDING CHAT PROMPT FOR GEMINI")
			print("="*80)

			# Build the full prompt with knowledge base
			knowledge_base = """
You are a helpful German home renovation financing advisor. You help users understand financing options for home renovations in Germany.

# Main Financing Options in Germany

## 1. Modernisierungskredit (Modernisation Loan)
- Personal loan for home renovations, usually unsecured
- Up to €50,000–€80,000
- Used for: Bathroom/kitchen upgrades, energy-efficient windows, heating, insulation

## 2. Baufinanzierung / Nachfinanzierung
- Mortgage-based financing
- For larger renovations and structural work
- Can extend existing mortgage or take a second one

## 3. KfW Förderkredite (State-Subsidised Loans)
- Low-interest loans via KfW Bank
- Distributed through local banks
- For: Energy-efficient renovations, renewable energy, barrier-free conversions

## 4. BAFA Zuschüsse (Cash Grants)
- Direct subsidies from BAFA
- For: Heating systems, renewable energy (heat pumps, solar thermal)
- No repayment required

# Key Programmes (2025)

## KfW Programme 261 / BEG WG
- Energy-efficient house renovations or partial upgrades
- Covers: Insulation, windows, heating
- Requirement: Apply before construction starts, energy consultant required
- Interest rate: 0.01% - 1.5%
- Max amount: €150,000

## KfW Programme 262 - BEG Renovation Grant
- Direct grant for energy-efficient renovations
- Up to €75,000 (up to 50% subsidy)
- No repayment needed
- Can be combined with loans

## KfW Programme 159 – Barrier-Free Conversion
- For accessibility improvements
- Bathrooms, stairs, ramps
- No energy efficiency requirement
- Up to €50,000

## BAFA "Heizen mit Erneuerbaren Energien"
- Renewable heating systems
- Heat pumps, biomass, solar thermal
- Up to 40% subsidy
- Max €70,000
- Apply directly via BAFA portal

Provide helpful, accurate information based on this knowledge. Be friendly and encouraging.
"""

			# Build conversation context
			full_prompt = knowledge_base + "\n\n"

			# Add conversation history
			for msg in conversation_history:
				if msg.get('role') == 'user':
					full_prompt += f"User: {msg.get('content', '')}\n"
				elif msg.get('role') == 'assistant':
					full_prompt += f"Assistant: {msg.get('content', '')}\n"

			# Add current user message
			full_prompt += f"User: {user_message}\nAssistant:"

			print("PROMPT BEING SENT TO GEMINI:")
			print("-" * 80)
			# Print first 500 chars of prompt for visibility
			preview = full_prompt[-800:] if len(full_prompt) > 800 else full_prompt
			print(preview)
			print("-" * 80)
			print(f"Total prompt length: {len(full_prompt)} characters")
			print("="*80 + "\n")

			print("\n" + "="*80)
			print("CALLING GEMINI API")
			print("="*80)

			# Call Gemini API
			import requests

			model = "gemini-2.5-flash-lite"
			api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

			payload = {
				"contents": [{"parts": [{"text": full_prompt}]}],
				"generationConfig": {
					"temperature": 0.7,
					"maxOutputTokens": 800,
					"topP": 0.95,
					"topK": 40
				}
			}

			print(f"API URL: {api_url[:80]}...")
			print(f"Model: {model}")
			print("Sending request...")

			response = requests.post(
				api_url,
				json=payload,
				headers={"Content-Type": "application/json"},
				timeout=30
			)

			print(f"Response Status: {response.status_code}")

			if not response.ok:
				error_data = response.json()
				error_msg = error_data.get('error', {}).get('message', 'Unknown error')
				print(f"ERROR: {error_msg}")
				print("="*80 + "\n")

				return Response(
					{'error': f'Gemini API error: {error_msg}'},
					status=status.HTTP_500_INTERNAL_SERVER_ERROR
				)

			data = response.json()
			ai_response = data['candidates'][0]['content']['parts'][0]['text']

			print("\n" + "="*80)
			print("GEMINI API RESPONSE")
			print("="*80)
			print(f"Response Length: {len(ai_response)} characters")
			print("Response Preview:")
			print("-" * 80)
			preview = ai_response[:500] if len(ai_response) > 500 else ai_response
			print(preview)
			if len(ai_response) > 500:
				print("...")
			print("-" * 80)
			print("="*80 + "\n")

			print("\n" + "="*80)
			print("SENDING RESPONSE TO FRONTEND")
			print("="*80 + "\n")

			return Response({'response': ai_response}, status=status.HTTP_200_OK)

		except Exception as e:
			error_message = str(e)
			print(f"\n[ERROR] AI Chat failed: {error_message}\n")

			return Response(
				{
					'error': 'Failed to get AI response',
					'message': error_message
				},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)
