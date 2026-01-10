from django.urls import path, include


urlpatterns = [
	path("", include("core.api.projects.urls")),
	path("", include("core.api.contractors.urls")),
	path("", include("core.api.auth.urls")),
	path("", include("core.api.financing.urls")),
#	path('renovation/', include('core.api.planning_work.urls')),
	path("chatbot/", include("core.api.chatbot.url")),
	path("", include("core.api.auth.urls")),
	path("contracting/", include("core.api.contracting.urls")),
	path("gmail/", include("core.api.gmail.urls")),
    path('renovation/', include('core.api.planning_work.urls')),
    path('chatbot/', include('core.api.chatbot.url')),
]


