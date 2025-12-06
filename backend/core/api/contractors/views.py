import json
from rest_framework import generics, permissions
from core.services.gemini_service import get_gemini_service
from .serializers import ContractorSerializer


class ContractorListView(generics.ListAPIView):
	serializer_class = ContractorSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		"""
		Fetch nearby contractors using Gemini API based on project location and type.
		"""
		# Get query parameters
		project_type = self.request.query_params.get("project_type", "renovation")
		city = self.request.query_params.get("city", "")
		state = self.request.query_params.get("state", "")
		postal_code = self.request.query_params.get("postal_code", "")

		# Build location string
		location_parts = [part for part in [city, postal_code, state] if part]
		location = ", ".join(location_parts) or "Germany"

		# Create prompt for Gemini to fetch nearby contractors
		prompt = f"""
		Generate a JSON array of 5-10 nearby professional {project_type} contractors in {location}.
		For each contractor, provide the following details:
		- name: Full contractor/company name
		- address: Street address
		- city: {city}
		- postal_code: Postal code
		- state: {state}
		- phone: Contact phone number
		- website: Website URL (if available)
		- email: Email address
		- price_range: Estimated price range (e.g., "€500-€2000")
		- service_area: Service area (e.g., "Frankfurt, surrounding areas")
		- business_size: Team size (e.g., "5-15 employees")
		- years_in_business: Years in business (number)
		- services: Main services offered
		- description: Brief description
		- specializations: Specializations (comma-separated)
		- rating: Customer rating (0-5)
		- reviews_count: Number of reviews
		- certifications: Relevant certifications
		- kfw_eligible: Whether KfW eligible (true/false)
		- source: Set to "gemini"
		- additional_info: Any additional notes
		- project_types: {project_type}
		
		Return ONLY valid JSON array, no other text. Each contractor must have all fields.
		"""

		try:
			gemini_service = get_gemini_service()
			gemini_response = gemini_service.model.generate_content(prompt)
			
			if hasattr(gemini_response, "text"):
				# Extract JSON from response (Gemini may include extra text)
				response_text = gemini_response.text.strip()
				
				# Try to find JSON array in response
				start_idx = response_text.find("[")
				end_idx = response_text.rfind("]") + 1
				
				if start_idx != -1 and end_idx > start_idx:
					json_str = response_text[start_idx:end_idx]
					contractors = json.loads(json_str)
					
					# Ensure all contractors have required fields
					for contractor in contractors:
						if not isinstance(contractor, dict):
							continue
						# Set missing fields to defaults
						contractor.setdefault("id", hash(contractor.get("name", "")) % 10000)
						contractor.setdefault("name", "Unknown Contractor")
						contractor.setdefault("address", "")
						contractor.setdefault("city", city)
						contractor.setdefault("postal_code", postal_code)
						contractor.setdefault("state", state)
						contractor.setdefault("phone", "")
						contractor.setdefault("website", "")
						contractor.setdefault("email", "")
						contractor.setdefault("price_range", "")
						contractor.setdefault("service_area", "")
						contractor.setdefault("business_size", "")
						contractor.setdefault("years_in_business", 0)
						contractor.setdefault("services", "")
						contractor.setdefault("description", "")
						contractor.setdefault("specializations", "")
						contractor.setdefault("rating", 0)
						contractor.setdefault("reviews_count", 0)
						contractor.setdefault("certifications", "")
						contractor.setdefault("kfw_eligible", False)
						contractor.setdefault("source", "gemini")
						contractor.setdefault("additional_info", "")
						contractor.setdefault("project_types", project_type)
					
					return contractors
		except Exception as e:
			print(f"Error fetching contractors from Gemini: {str(e)}")

		# Return empty list if Gemini fails
		return []

