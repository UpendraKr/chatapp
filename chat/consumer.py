from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from chat.helper import get_user_from_token

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

        print(text_data)

        await self.send(text_data=text_data)