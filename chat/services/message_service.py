from django.contrib.auth.models import User

from chat.models import Message

from .conversation_service import ConversationService


class MessageService:

    @staticmethod
    def send_message(
        sender,
        receiver,
        message
    ):

        conversation = ConversationService.get_or_create(sender,receiver)
        return Message.objects.create(
            conversation=conversation,
            sender=sender,
            message=message
        )

    @staticmethod
    def get_messages(user1, user2):

        conversation = ConversationService.get_conversation(
            user1,
            user2
        )

        if conversation is None:
            return Message.objects.none()

        return conversation.messages.all()