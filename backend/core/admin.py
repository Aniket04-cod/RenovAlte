from django.contrib import admin
from .models import Project, Contractor, RenovationPlan
from .models import Project, Contractor, ContractingPlanning, ContractingPlanningFile, Message, MessageAction, MessageAttachment, RenovationPlan
from .models import ChatSession
from .models import ChatMessage
from .models import UserMemory

@admin.register(UserMemory)
class UserMemoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'memory_type', 'key', 'short_value', 'confidence', 'is_active', 'updated_at']
    list_filter = ['memory_type', 'is_active', 'created_at']
    search_fields = ['user__username', 'key', 'value']
    readonly_fields = ['created_at', 'updated_at']
    
    def short_value(self, obj):
        return obj.value[:40] + "..." if len(obj.value) > 40 else obj.value
    short_value.short_description = "Value"
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
	list_display = ("id", "name")

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'role', 'short_content', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['content']
    readonly_fields = ['created_at']
    
    def short_content(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    short_content.short_description = "Content"
@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'session_type', 'is_active', 'is_plan_generated', 'created_at']
    list_filter = ['session_type', 'is_active', 'is_plan_generated']
    search_fields = ['user__username', 'title']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Contractor)
class ContractorAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "city", "state", "rating")
	list_filter = ("kfw_eligible", "state")
	search_fields = ("name", "city", "email", "project_types")


class ContractingPlanningFileInline(admin.TabularInline):
	model = ContractingPlanningFile
	extra = 0
	readonly_fields = ('uploaded_at',)


@admin.register(ContractingPlanning)
class ContractingPlanningAdmin(admin.ModelAdmin):
	list_display = ("id", "project", "current_step", "created_at", "updated_at")
	list_filter = ("current_step", "created_at", "updated_at")
	search_fields = ("project__name", "description")
	readonly_fields = ("created_at", "updated_at")
	inlines = [ContractingPlanningFileInline]


@admin.register(ContractingPlanningFile)
class ContractingPlanningFileAdmin(admin.ModelAdmin):
	list_display = ("id", "contracting_planning", "filename", "uploaded_at")
	list_filter = ("uploaded_at",)
	search_fields = ("filename", "contracting_planning__project__name")
	readonly_fields = ("uploaded_at",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
	list_display = ("id", "contracting_planning", "contractor_id", "sender", "message_type", "timestamp")
	list_filter = ("sender", "message_type", "timestamp")
	search_fields = ("content", "contracting_planning__project__name")
	readonly_fields = ("timestamp",)
	ordering = ("-timestamp",)


@admin.register(MessageAction)
class MessageActionAdmin(admin.ModelAdmin):
	list_display = ("id", "message", "action_type", "action_status", "created_at", "updated_at")
	list_filter = ("action_type", "action_status", "created_at")
	search_fields = ("action_summary",)
	readonly_fields = ("created_at", "updated_at")
	ordering = ("-created_at",)


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
	list_display = ("id", "message", "filename", "content_type", "file_size", "uploaded_at")
	list_filter = ("content_type", "uploaded_at")
	search_fields = ("filename", "message__content")
	readonly_fields = ("uploaded_at",)
	ordering = ("-uploaded_at",)


@admin.register(RenovationPlan)
class RenovationPlanAdmin(admin.ModelAdmin):
    list_display = ['id', 'plan_name', 'user', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    readonly_fields = ['created_at', 'updated_at']


