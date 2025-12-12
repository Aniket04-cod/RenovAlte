from django.urls import path, include


urlpatterns = [
	path("", include("core.api.projects.urls")),
	path("", include("core.api.auth.urls")),
	path("contracting/", include("core.api.contracting.urls")),
	path("gmail/", include("core.api.gmail.urls")),
]


