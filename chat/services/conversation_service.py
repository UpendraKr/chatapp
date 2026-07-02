from django.db.models import Q

from chat.models import Conversation
from chat.helper import normalize_users
from django.db import transaction, IntegrityError

class ConversationService:

    @staticmethod
    def get_conversation(user1, user2):

        return Conversation.objects.filter(

            Q(user1=user1, user2=user2)

            |

            Q(user1=user2, user2=user1)

        ).first()


    @staticmethod
    def get_or_create(user1, user2):

        user1, user2 = normalize_users(user1, user2)

        try:

            with transaction.atomic():

                conversation, created = Conversation.objects.get_or_create(

                    user1=user1,

                    user2=user2

                )

                return conversation

        except IntegrityError:

            return Conversation.objects.get(

                user1=user1,

                user2=user2

            )