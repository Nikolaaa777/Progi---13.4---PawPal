from django.urls import path
from . import views

urlpatterns = [
    path("chat/conversations/", views.list_conversations, name="list_conversations"),
    path("chat/conversations/<int:conversation_id>/", views.get_conversation, name="get_conversation"),
    path("chat/conversations/user/<int:user_id>/", views.get_or_create_conversation, name="get_or_create_conversation"),
    path("chat/conversations/reservation/<int:reservation_id>/", views.get_or_create_conversation_from_reservation, name="get_or_create_conversation_from_reservation"),
    path("chat/messages/", views.send_message, name="send_message"),
    path("chat/users/", views.list_users, name="list_users"),
]
