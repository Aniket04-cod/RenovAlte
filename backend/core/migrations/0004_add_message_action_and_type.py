# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_contractingplanning_current_step'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='message_type',
            field=models.CharField(
                choices=[
                    ('user', 'User Message'),
                    ('ai', 'AI Response'),
                    ('ai_action_request', 'AI Action Request'),
                    ('ai_action_executed', 'AI Action Executed')
                ],
                default='user',
                help_text='Type of message for rendering purposes',
                max_length=30,
                verbose_name='Message Type'
            ),
        ),
        migrations.CreateModel(
            name='MessageAction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action_type', models.CharField(
                    choices=[
                        ('send_email', 'Send Email'),
                        ('draft_email', 'Draft Email')
                    ],
                    help_text='Type of action to perform',
                    max_length=20,
                    verbose_name='Action Type'
                )),
                ('action_status', models.CharField(
                    choices=[
                        ('pending', 'Pending User Approval'),
                        ('approved', 'Approved'),
                        ('rejected', 'Rejected'),
                        ('executed', 'Executed'),
                        ('failed', 'Failed')
                    ],
                    default='pending',
                    help_text='Current status of the action',
                    max_length=20,
                    verbose_name='Action Status'
                )),
                ('action_data', models.JSONField(help_text='Action-specific data (e.g., email subject, body, recipient)', verbose_name='Action Data')),
                ('action_summary', models.TextField(help_text='Human-readable summary for conversation context', verbose_name='Action Summary')),
                ('execution_result', models.JSONField(blank=True, help_text='Results after action execution (e.g., Gmail message_id)', null=True, verbose_name='Execution Result')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('message', models.OneToOneField(
                    help_text='The message this action is associated with',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='action',
                    to='core.message'
                )),
            ],
            options={
                'verbose_name': 'Message Action',
                'verbose_name_plural': 'Message Actions',
                'ordering': ['-created_at'],
            },
        ),
    ]
