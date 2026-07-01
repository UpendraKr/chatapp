from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db.models import Q

from .models import Message
from .serializers import MessageSerializer


class SendMessage(APIView):

    def post(self, request):

        sender = User.objects.get(username=request.data["sender"])

        receiver = User.objects.get(
            username=request.data["receiver"]
        )

        message = Message.objects.create(
            sender=sender,
            receiver=receiver,
            message=request.data["message"]
        )

        serializer = MessageSerializer(message)

        return Response(serializer.data)


class ChatHistory(APIView):

    def get(self, request):

        username1 = request.GET.get("user1")

        username2 = request.GET.get("user2")

        user1 = User.objects.get(username=username1)

        user2 = User.objects.get(username=username2)

        messages = Message.objects.filter(

            Q(sender=user1, receiver=user2)

            |

            Q(sender=user2, receiver=user1)

        )

        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data)



def chat_page(request):

    return render(request,"chat.html")