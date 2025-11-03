from django.db import models


class Project(models.Model):
	name = models.CharField("Project Name", max_length=200)

	def __str__(self) -> str:
		return self.name


