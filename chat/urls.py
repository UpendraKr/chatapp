from django.urls import path
from .views import SendMessage, ChatHistory
from chat.api.auth import RegisterAPIView

urlpatterns = [
    path("register/", RegisterAPIView.as_view()),
    path("send-message/", SendMessage.as_view()),
    path("chat-history/", ChatHistory.as_view()),
]