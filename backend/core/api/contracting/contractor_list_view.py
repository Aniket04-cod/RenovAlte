from rest_framework import generics, permissions
from core.models import Contractor
from .contractor_serializer import ContractorSerializer


class ContractorListView(generics.ListAPIView):
	"""
	List contractors with optional filtering
	"""
	serializer_class = ContractorSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Contractor.objects.all().order_by("-rating", "name")

