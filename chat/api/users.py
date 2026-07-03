from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from chat.serializers import UserSerializer
from chat.services.user_service import UserService


class UserListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        users = UserService.get_all_users_except(
            request.user
        )

        serializer = UserSerializer(
            users,
            many=True
        )

        return Response(serializer.data)