from django.db import models
from django.contrib.auth.models import User
from .chat_session import ChatSession


class MemoryType(models.TextChoices):
    PREFERENCE = "preference", "User Preference"
    FACT = "fact", "Extracted Fact"
    PROJECT_DETAIL = "project_detail", "Project Detail"
    BUILDING_INFO = "building_info", "Building Information"
    BUDGET = "budget", "Budget Information"
    MATERIAL = "material", "Material Preference"
    TIMELINE = "timeline", "Timeline Information"


class UserMemory(models.Model):
    """
    Stores long-term extracted facts and preferences per user.
    This persists across sessions and helps personalize future conversations.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='memories'
    )
    source_session = models.ForeignKey(
        ChatSession,
        on_delete=models.SET_NULL,
        related_name='extracted_memories',
        null=True,
        blank=True,
        help_text="The session this memory was extracted from"
    )
    memory_type = models.CharField(
        max_length=30,
        choices=MemoryType.choices,
        default=MemoryType.FACT
    )
    key = models.CharField(
        max_length=100,
        help_text="Memory identifier, e.g., 'preferred_tiles', 'building_age'"
    )
    value = models.TextField(
        help_text="The actual memory content"
    )
    confidence = models.FloatField(
        default=1.0,
        help_text="Confidence score 0-1 for extracted memories"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Inactive memories are not used in context"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = "User Memory"
        verbose_name_plural = "User Memories"
        unique_together = ['user', 'key']

    def __str__(self):
        return f"{self.user.username} - {self.key}: {self.value[:30]}"