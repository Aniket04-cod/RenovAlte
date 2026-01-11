from django.db import models
from .chat_session import ChatSession


class MessageRole(models.TextChoices):
    USER = "user", "User"
    ASSISTANT = "assistant", "Assistant"
    SYSTEM = "system", "System"


class ChatMessage(models.Model):
    """
    Stores individual messages within a chat session.
    Replaces the cache-based message storage.
    """
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(
        max_length=20,
        choices=MessageRole.choices
    )
    content = models.TextField()
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Stores additional data like image info, extracted entities, etc."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = "Chat Message"
        verbose_name_plural = "Chat Messages"

    def __str__(self):
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.role}: {preview}"