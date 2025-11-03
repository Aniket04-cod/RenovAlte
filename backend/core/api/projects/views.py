from rest_framework import generics, permissions
from core.models import Project
from .serializers import ProjectSerializer


class ProjectListCreate(generics.ListCreateAPIView):
	queryset = Project.objects.all().order_by("id")
	serializer_class = ProjectSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ProjectDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Project.objects.all()
	serializer_class = ProjectSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]


