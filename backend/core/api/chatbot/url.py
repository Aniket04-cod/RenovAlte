# from django.urls import path
# from .views import ChatbotMessageView, ExtractAndGeneratePlanView


# urlpatterns = [
# 	path("message/", ChatbotMessageView.as_view(), name="chatbot-message"),
#     path("generate-from-chat/", ExtractAndGeneratePlanView.as_view(), name="generate-from-chat"),
# ]
from django.urls import path
from .views import (
    ChatbotMessageView,
    ChatSessionListView,
    ChatSessionDetailView,
    ExtractAndGeneratePlanView,
    UserMemoryView,
)

urlpatterns = [
    # Send message to chatbot
    path('message/', ChatbotMessageView.as_view(), name='chatbot-message'),
    
    # Chat sessions
    path('sessions/', ChatSessionListView.as_view(), name='chat-sessions'),
    path('sessions/<int:session_id>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),
    
    # Extract data and generate plan
    path('extract-and-generate/', ExtractAndGeneratePlanView.as_view(), name='extract-and-generate'),
    
    # User memory
    path('memory/', UserMemoryView.as_view(), name='user-memory'),
]