from django.urls import path
from .views import (
	CostEstimationView,
	FinancingOptionsView,
	ImageGenerationView,
	AIChatView
)


urlpatterns = [
	path("financing/cost-estimate/", CostEstimationView.as_view(), name="financing-cost-estimate"),
	path("financing/financing-options/", FinancingOptionsView.as_view(), name="financing-options"),
	path("financing/image-generation/", ImageGenerationView.as_view(), name="image-generation"),
	path("financing/ai-chat/", AIChatView.as_view(), name="financing-ai-chat"),
]
