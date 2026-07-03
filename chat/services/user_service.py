from django.contrib.auth.models import User


class UserService:

    @staticmethod
    def get_all_users_except(current_user):

        return User.objects.exclude(
            id=current_user.id
        ).order_by("username")