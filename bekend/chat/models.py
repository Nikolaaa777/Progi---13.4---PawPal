from django.db import models
from django.contrib.auth.models import User


class Conversation(models.Model):
    """Represents a conversation between two users"""
    participant1 = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='conversations_as_participant1'
    )
    participant2 = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='conversations_as_participant2'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['participant1', 'participant2']
        ordering = ['-updated_at']

    def __str__(self):
        return f"Conversation between {self.participant1.email} and {self.participant2.email}"

    def get_other_participant(self, user):
        """Get the other participant in the conversation"""
        if self.participant1 == user:
            return self.participant2
        return self.participant1


class Message(models.Model):
    """Represents a message in a conversation"""
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.email} in conversation {self.conversation.id}"
