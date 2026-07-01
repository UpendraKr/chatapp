from django.urls import path
from .views import SendMessage, ChatHistory

urlpatterns = [
    path("send-message/", SendMessage.as_view()),
    path("chat-history/", ChatHistory.as_view()),
]