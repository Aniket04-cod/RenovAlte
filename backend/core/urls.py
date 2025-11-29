from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    path("offers/upload/<uuid:token>/", views.upload_offer, name="upload_offer"),
]
