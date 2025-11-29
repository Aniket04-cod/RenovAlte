from django.urls import path
from .views import ContractorListView, generate_upload_links

app_name = "contractors"

urlpatterns = [
	path("contractors/", ContractorListView.as_view(), name="contractor-list"),
	path("contractors/generate_upload_links/", generate_upload_links, name="generate-upload-links"),
]

