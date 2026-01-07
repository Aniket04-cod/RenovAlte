"""Merge migration created to resolve branching between renovation plan and message-read migrations."""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0010_renovationplan"),
        ("core", "0012_message_is_read_message_read_at"),
    ]

    operations = []
