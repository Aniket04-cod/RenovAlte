from django.contrib import admin
from .models import Project, Contractor, RenovationPlan


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
	list_display = ("id", "name")


@admin.register(Contractor)
class ContractorAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "city", "state", "rating")
	list_filter = ("kfw_eligible", "state")
	search_fields = ("name", "city", "email", "project_types")

@admin.register(RenovationPlan)
class RenovationPlanAdmin(admin.ModelAdmin):
    list_display = ['id', 'plan_name', 'user', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
