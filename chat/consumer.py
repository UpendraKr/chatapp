from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        print("Connected")

        await self.accept()

    async def disconnect(self, close_code):

        print("Disconnected")

    async def receive(self, text_data):

        print(text_data)

        await self.send(text_data=text_data)