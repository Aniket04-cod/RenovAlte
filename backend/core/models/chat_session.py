from django.db import models
from django.contrib.auth.models import User
from .project import Project


class SessionType(models.TextChoices):
    PLANNING = "planning", "Planning Work"
    GENERAL = "general", "General Chat"
    CONTRACTING = "contracting", "Contracting"


class ChatSession(models.Model):
    """
    Stores chat sessions linked to users.
    Replaces the cache-based session storage.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chat_sessions'
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        related_name='chat_sessions',
        null=True,
        blank=True
    )
    session_type = models.CharField(
        max_length=20,
        choices=SessionType.choices,
        default=SessionType.PLANNING
    )
    title = models.CharField(
        max_length=200,
        default="New Conversation",
        blank=True
    )
    is_active = models.BooleanField(default=True)
    is_plan_generated = models.BooleanField(default=False)
    extracted_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Stores extracted renovation data from conversation"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = "Chat Session"
        verbose_name_plural = "Chat Sessions"

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.created_at.strftime('%Y-%m-%d')})"