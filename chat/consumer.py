import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from chat.helper import get_user_from_token
from chat.services.message_service import MessageService
from django.contrib.auth.models import User


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("Connection started...")

        # Extract the token from the query string and get the user
        query_string = self.scope["query_string"].decode()
        params = dict(p.split("=") for p in query_string.split("&") if "=" in p)
        token = params.get("token")

        if not token:
            await self.close()
            return

        try:
            user = await database_sync_to_async(get_user_from_token)(token)
        except Exception as exc:
            print(f"Auth failed: {exc}")
            await self.close()
            return

        self.user = user

        # Create a unique group name for the user based on their ID
        self.group_name = f"user_{self.user.id}"

        # add the user to a group based on their user ID
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()

        print(f"{self.user.username} connected")

    async def disconnect(self, close_code):

        print("Disconnected")

    async def receive(self, text_data):

        data = json.loads(text_data)
        print(data)
        receiver = await get_receiver(data["receiver"])
        # print(receiver.username)

        saved_message = await save_message(
            sender=self.user,
            receiver=receiver,
            message=data["message"]
        )

        payload = {
            "type": "chat_message",
            "sender": self.user.username,
            "receiver": receiver.username,
            "message": saved_message.message,
            "created_at": str(saved_message.created_at),
        }

        # await self.send(text_data=text_data)
        await self.channel_layer.group_send(
            f"user_{receiver.id}",
            payload
        )

        await self.channel_layer.group_send(
            self.group_name,
            payload
        )
    
    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps({
                "sender": event["sender"],
                "receiver": event["receiver"],
                "message": event["message"],
                "created_at": event["created_at"],
            })
        )



@database_sync_to_async
def get_receiver(username):
    return User.objects.get(username=username)


@database_sync_to_async
def save_message(sender, receiver, message):

    return MessageService.send_message(
        sender=sender,
        receiver=receiver,
        message=message
    )