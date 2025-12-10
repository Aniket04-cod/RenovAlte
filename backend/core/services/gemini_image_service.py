"""
AI Image Generation Service
Uses Pollinations.ai with FLUX model for high-quality image generation

Features:
- FLUX model (FREE public API)
- 512x512 resolution (fast generation)
- Professional quality photorealistic images
- Automatic prompt enhancement
- No API key required
"""

import os
import time
import base64
import requests
from typing import Dict, Any


class GeminiImageService:
	"""
	Service for generating high-quality images using Hugging Face SDXL (FREE)

	Uses Stable Diffusion XL 1.0 via Hugging Face's free inference API.
	Includes prompt enhancement and negative prompts for quality control.
	No API key required - completely free!
	"""

	def __init__(self, api_key: str = None):
		"""
		Initialize Image Service - Uses FREE Hugging Face API

		Args:
			api_key (str): Not required - using free public API
		"""
		# Using Pollinations.ai with FLUX model for high quality
		self.model = "flux"
		self.api_url = "https://image.pollinations.ai/prompt"
		self.api_key = None

		print(f"[INFO] Using Pollinations.ai with FLUX model for high-quality image generation")
		print(f"[INFO] FREE - No API key required")

	def generate_image(self, prompt: str, max_retries: int = 3) -> Dict[str, Any]:
		"""
		Generate high-quality image using Segmind SDXL API

		Args:
			prompt (str): The image generation prompt
			max_retries (int): Maximum number of retry attempts

		Returns:
			dict: Contains image data (base64 encoded) and metadata
		"""
		last_error = None

		print(f"\n{'='*80}")
		print(f"HIGH-QUALITY AI IMAGE GENERATION - FLUX MODEL (FREE)")
		print(f"{'='*80}")
		print(f"Model: {self.model}")
		print(f"API Endpoint: {self.api_url}")
		print(f"Prompt: {prompt[:200]}..." if len(prompt) > 200 else f"Prompt: {prompt}")
		print(f"{'='*80}\n")

		for attempt in range(max_retries):
			try:
				if attempt > 0:
					wait_time = 5 * (attempt + 1)  # Longer wait for free API
					print(f"\n   [RETRY {attempt}/{max_retries}] Waiting {wait_time}s before retry...")
					time.sleep(wait_time)

				print(f"   >> Attempt {attempt + 1}/{max_retries}: Calling Pollinations.ai API...")

				# Clean the prompt
				clean_prompt = prompt.replace('\n', ' ').strip()

				# Enhance prompt for MUCH better quality with architectural focus
				enhanced_prompt = f"{clean_prompt}, professional architectural photography, ultra detailed, 8K UHD, photorealistic, award winning, masterpiece, sharp focus, perfect lighting, vivid colors"

				print(f"   >> Enhanced prompt: {enhanced_prompt[:150]}...")

				# Pollinations.ai URL-based API with FLUX model
				encoded_prompt = requests.utils.quote(enhanced_prompt)
				image_url = f"{self.api_url}/{encoded_prompt}?width=512&height=512&model=flux&nologo=true&private=true&enhance=true"

				print(f"   >> URL: {image_url[:80]}...")

				# Make GET request to Pollinations (returns image directly)
				response = requests.get(
					image_url,
					timeout=120
				)

				print(f"   >> Response Status: {response.status_code}")
				print(f"   >> Content-Type: {response.headers.get('Content-Type', 'unknown')}")

				if response.status_code == 200:
					# Pollinations returns image bytes directly
					image_bytes = response.content
					img_base64 = base64.b64encode(image_bytes).decode('utf-8')

					print(f"   >> Image generated successfully!")
					print(f"   >> Image size: {len(image_bytes)} bytes")
					print(f"   >> Base64 length: {len(img_base64)} chars")
					print(f"   [SUCCESS] Image generation completed\n")

					return {
						'success': True,
						'image_base64': img_base64,
						'image_format': 'PNG',
						'width': 512,
						'height': 512,
						'model': self.model,
						'prompt': prompt
					}

				else:
					error_text = response.text[:500] if response.text else "No response body"
					print(f"   >> ERROR: {response.status_code}")
					print(f"   >> Response Body: {error_text}")
					last_error = f"HTTP {response.status_code}: {error_text}"

					if attempt == max_retries - 1:
						raise Exception(last_error)

			except requests.exceptions.Timeout:
				last_error = "Request timeout"
				print(f"\n   [EXCEPTION - Attempt {attempt + 1}/{max_retries}]")
				print(f"   Error: Request timeout")

				if attempt == max_retries - 1:
					raise Exception("Request timeout. Image API took too long to respond.")

			except requests.exceptions.RequestException as e:
				last_error = str(e)
				print(f"\n   [EXCEPTION - Attempt {attempt + 1}/{max_retries}]")
				print(f"   Error type: {type(e).__name__}")
				print(f"   Error message: {str(e)}")

				if attempt == max_retries - 1:
					raise Exception(f"Network error: {str(e)}")

			except Exception as e:
				last_error = str(e)
				print(f"\n   [EXCEPTION - Attempt {attempt + 1}/{max_retries}]")
				print(f"   Error type: {type(e).__name__}")
				print(f"   Error message: {str(e)}")

				if attempt == max_retries - 1:
					print(f"\n   [CRITICAL] All {max_retries} attempts failed!")
					raise Exception(f"Image generation failed after {max_retries} attempts: {last_error}")

		raise Exception(f"Unexpected error in image generation: {last_error}")

	def generate_image_from_description(self, image_description_data: Dict[str, Any]) -> Dict[str, Any]:
		"""
		Generate image from structured image description data

		Args:
			image_description_data (dict): Structured image description

		Returns:
			dict: Image generation result
		"""
		# Extract the main image prompt from the description data
		if 'imagePrompt' in image_description_data:
			prompt = image_description_data['imagePrompt']
		else:
			# Fallback: construct prompt from available data
			prompt = self._construct_prompt_from_data(image_description_data)

		# Generate the image
		return self.generate_image(prompt)

	def _construct_prompt_from_data(self, data: Dict[str, Any]) -> str:
		"""
		Construct image prompt from structured data

		Args:
			data (dict): Image description data

		Returns:
			str: Constructed prompt
		"""
		parts = []

		# Add style
		if 'style' in data:
			parts.append(f"{data['style']} style")

		# Add key features
		if 'keyFeatures' in data and isinstance(data['keyFeatures'], list):
			parts.append(f"featuring {', '.join(data['keyFeatures'][:3])}")

		# Add materials
		if 'materials' in data and isinstance(data['materials'], list):
			parts.append(f"with {', '.join(data['materials'][:2])}")

		# Add color palette
		if 'colorPalette' in data and isinstance(data['colorPalette'], list):
			parts.append(f"in {' and '.join(data['colorPalette'][:2])} colors")

		# Add lighting
		if 'lighting' in data:
			parts.append(f"{data['lighting']}")

		# Add mood
		if 'mood' in data:
			parts.append(f"{data['mood']} atmosphere")

		# Join all parts
		prompt = ", ".join(parts)

		# Add default if empty
		if not prompt:
			prompt = "Modern interior design, photorealistic, 4K quality"

		return prompt
