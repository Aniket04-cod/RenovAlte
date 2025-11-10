from django.db import migrations, models


def set_default_budget(apps, schema_editor):
    Project = apps.get_model("core", "Project")
    Project.objects.filter(budget__isnull=True).update(budget=0)


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0009_alter_project_additional_information_and_more"),
    ]

    operations = [
        migrations.RunPython(set_default_budget, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="project",
            name="budget",
            field=models.DecimalField(
                verbose_name="Budget",
                max_digits=12,
                decimal_places=2,
                default=0,
            ),
        ),
    ]

