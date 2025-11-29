from django.db import models
from django.contrib.auth.models import User
from core.models.contractor import Contractor
from core.models.project import Project
import uuid
from django.utils import timezone


class Offer(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("submitted", "Submitted"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    offer_letter = models.FileField(upload_to="offers/")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Optional unique token used to build a one-time upload link for the contractor
    token = models.UUIDField(null=True, blank=True, unique=True, editable=False)

    def generate_upload_token(self):
        """Create and persist a UUID token for this Offer and return its string form."""
        self.token = uuid.uuid4()
        # update only the token field
        self.save(update_fields=["token"])
        return str(self.token)

    def clear_upload_token(self):
        """Clear token to prevent reuse after upload."""
        self.token = None
        self.save(update_fields=["token"])

    def __str__(self):
        return f"Offer from {self.contractor} for {self.project}"
