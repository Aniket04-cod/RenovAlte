from django.contrib import admin
from .models import Project, Contractor


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
	list_display = ("id", "name")


@admin.register(Contractor)
class ContractorAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "city", "state", "rating")
	list_filter = ("kfw_eligible", "state")
	search_fields = ("name", "city", "email", "project_types")


