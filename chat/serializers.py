from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    receiver = serializers.SerializerMethodField()  

    class Meta:
        model = Message
        fields = "__all__"

    def get_sender(self, obj):
        return obj.sender.username  

    
    def get_receiver(self, obj):
        return obj.receiver.username