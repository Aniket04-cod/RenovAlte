from django.db import models
from django.contrib.auth.models import User


class ProjectType(models.TextChoices):
	KITCHEN = "kitchen", "Kitchen Renovation"
	BATHROOM = "bathroom", "Bathroom Renovation"
	BASEMENT = "basement", "Basement Renovation"
	ROOFING = "roofing", "Roofing"
	ELECTRICAL = "electrical", "Electrical"
	PLUMBING = "plumbing", "Plumbing"
	HVAC = "hvac", "HVAC"
	FLOORING = "flooring", "Flooring"
	WINDOWS_DOORS = "windows_doors", "Windows/Doors"
	EXTERIOR = "exterior", "Exterior"
	GENERAL = "general", "General Renovation"


class Project(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
	name = models.CharField("Project Name", max_length=200)
	project_type = models.CharField(
		"Project Type",
		max_length=50,
		choices=ProjectType.choices,
		default=ProjectType.GENERAL,
	)
	address = models.CharField("Address", max_length=200)
	city = models.CharField("City", max_length=100, blank=True)
	postal_code = models.CharField("Postal Code", max_length=20, blank=True)
	state = models.CharField("State", max_length=100, blank=True)
	budget = models.DecimalField(
		"Budget",
		max_digits=12,
		decimal_places=2,
		null=True,
		blank=True,
	)
	additional_information = models.TextField(
		"Additional Information",
		blank=True,
		help_text="Additional information about the project",
	)

	def __str__(self) -> str:
		return self.name


