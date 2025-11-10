from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_project_city_project_postal_code_project_state"),
    ]

    operations = [
        migrations.RenameField(
            model_name="project",
            old_name="location",
            new_name="address",
        ),
        migrations.AlterField(
            model_name="project",
            name="address",
            field=models.CharField(max_length=200, verbose_name="Address"),
        ),
    ]

