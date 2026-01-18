from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Conversation, Message


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information in chat"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'created_at', 'read']
        read_only_fields = ['id', 'sender', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations"""
    participant1 = UserSerializer(read_only=True)
    participant2 = UserSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participant1', 'participant2', 'created_at', 'updated_at', 
                 'last_message', 'unread_count', 'other_participant']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        """Get the last message in the conversation"""
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
    
    def get_unread_count(self, obj):
        """Get count of unread messages for the current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                other_user = obj.get_other_participant(request.user)
                return obj.messages.filter(sender=other_user, read=False).count()
            except:
                return 0
        return 0
    
    def get_other_participant(self, obj):
        """Get the other participant in the conversation"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other = obj.get_other_participant(request.user)
            return UserSerializer(other).data
        return None


class CreateMessageSerializer(serializers.Serializer):
    """Serializer for creating a new message"""
    content = serializers.CharField(max_length=5000)
    conversation_id = serializers.IntegerField(required=False)
