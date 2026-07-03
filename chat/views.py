from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db.models import Q

from .models import Message
from .serializers import MessageSerializer
from .services.message_service import MessageService
from rest_framework.permissions import IsAuthenticated


class SendMessage(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver = User.objects.get(username=request.data["receiver"])
        message = MessageService.send_message(
            sender=request.user,
            receiver=receiver,
            message=request.data["message"]
        )

        serializer = MessageSerializer(message)

        return Response(serializer.data)


class ChatHistory(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        receiver = User.objects.get(
            username=request.GET["receiver"]
        )

        messages = MessageService.get_messages(
            request.user,
            receiver
        )

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)



def chat_page(request):

    return render(request, "chat.html")


def register_page(request):

    return render(request, "register.html")


def login_page(request):

    return render(request, "login.html")