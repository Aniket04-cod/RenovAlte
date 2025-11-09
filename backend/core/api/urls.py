from django.urls import path, include


urlpatterns = [
	path("", include("core.api.projects.urls")),
	path("", include("core.api.contractors.urls")),
	path("", include("core.api.auth.urls")),
]


