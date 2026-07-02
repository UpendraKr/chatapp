from django.db.models import Q
from chat.models import Conversation
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model



def get_or_create_conversation(user1, user2):

    conversation = Conversation.objects.filter(
        Q(user1=user1, user2=user2) |
        Q(user1=user2, user2=user1)
    ).first()

    if conversation:
        return conversation

    return Conversation.objects.create(
        user1=user1,
        user2=user2
    )


def normalize_users(user1, user2):

    if user1.id < user2.id:
        return user1, user2

    return user2, user1




def get_user_from_token(token):
    User = get_user_model()
    
    access = AccessToken(token)
    user_id = access["user_id"]
    return User.objects.get(id=user_id)