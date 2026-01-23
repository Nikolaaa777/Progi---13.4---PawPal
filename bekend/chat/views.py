from accounts.authentication import CsrfExemptSessionAuthentication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db.models import Q, Max
from django.views.decorators.csrf import csrf_exempt
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer, 
    MessageSerializer, 
    CreateMessageSerializer,
    UserSerializer
)
from drf_spectacular.utils import extend_schema, OpenApiResponse
from reservations.models import Rezervacija
from accounts.models import Vlasnik, Setac


@extend_schema(
    responses={200: OpenApiResponse(description='List of conversations')}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    """Get all conversations for the current user"""
    user = request.user
    conversations = Conversation.objects.filter(
        Q(participant1=user) | Q(participant2=user)
    ).annotate(
        last_message_time=Max('messages__created_at')
    ).order_by('-updated_at')
    
    serializer = ConversationSerializer(conversations, many=True, context={'request': request})
    return Response(serializer.data)


@extend_schema(
    responses={200: OpenApiResponse(description='Conversation details with messages')}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversation(request, conversation_id):
    """Get a specific conversation with its messages"""
    try:
        conversation = Conversation.objects.get(
            Q(id=conversation_id) & (Q(participant1=request.user) | Q(participant2=request.user))
        )
    except Conversation.DoesNotExist:
        return Response(
            {"error": "Conversation not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Mark messages as read
    Message.objects.filter(
        conversation=conversation,
        sender__id=conversation.get_other_participant(request.user).id,
        read=False
    ).update(read=True)
    
    messages = conversation.messages.all()
    conversation_data = ConversationSerializer(conversation, context={'request': request}).data
    messages_data = MessageSerializer(messages, many=True).data
    
    return Response({
        'conversation': conversation_data,
        'messages': messages_data
    })


@extend_schema(
    responses={200: OpenApiResponse(description='Conversation created or retrieved')}
)
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_or_create_conversation(request, user_id):
    """Get or create a conversation with another user"""
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if other_user == request.user:
        return Response(
            {"error": "Cannot create conversation with yourself"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Try to find existing conversation (order doesn't matter)
    conversation = Conversation.objects.filter(
        (Q(participant1=request.user) & Q(participant2=other_user)) |
        (Q(participant1=other_user) & Q(participant2=request.user))
    ).first()
    
    if not conversation:
        # Create new conversation (ensure consistent ordering)
        if request.user.id < other_user.id:
            conversation = Conversation.objects.create(
                participant1=request.user,
                participant2=other_user
            )
        else:
            conversation = Conversation.objects.create(
                participant1=other_user,
                participant2=request.user
            )
    
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data)


@extend_schema(
    request=CreateMessageSerializer,
    responses={201: OpenApiResponse(description='Message created')}
)
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Send a message in a conversation"""
    serializer = CreateMessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"errors": serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    conversation_id = serializer.validated_data.get('conversation_id')
    content = serializer.validated_data['content']
    
    if conversation_id:
        try:
            conversation = Conversation.objects.get(
                Q(id=conversation_id) & (Q(participant1=request.user) | Q(participant2=request.user))
            )
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        return Response(
            {"error": "conversation_id is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    message = Message.objects.create(
        conversation=conversation,
        sender=request.user,
        content=content
    )
    
    # Update conversation's updated_at timestamp
    conversation.save()
    
    serializer_response = MessageSerializer(message)
    return Response(serializer_response.data, status=status.HTTP_201_CREATED)


@extend_schema(
    responses={200: OpenApiResponse(description='List of users')}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_users(request):
    """Get list of users (excluding current user)"""
    users = User.objects.exclude(id=request.user.id)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@extend_schema(
    responses={200: OpenApiResponse(description='Conversation created or retrieved from reservation')}
)
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_or_create_conversation_from_reservation(request, reservation_id):
    """Get or create a conversation from a reservation (only if confirmed)"""
    try:
        reservation = Rezervacija.objects.get(idRezervacije=reservation_id)
    except Rezervacija.DoesNotExist:
        return Response(
            {"error": "Reservation not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if reservation is confirmed
    if not reservation.potvrdeno:
        return Response(
            {"error": "Reservation must be confirmed before starting a conversation"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get the other user (vlasnik or setac) based on current user
    current_user_email = request.user.email
    
    # Determine if current user is vlasnik or setac
    try:
        vlasnik = Vlasnik.objects.get(emailVlasnik=current_user_email)
        is_vlasnik = True
        other_id = reservation.idSetac
    except Vlasnik.DoesNotExist:
        try:
            setac = Setac.objects.get(emailSetac=current_user_email)
            is_vlasnik = False
            other_id = reservation.idVlasnik
        except Setac.DoesNotExist:
            return Response(
                {"error": "User profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    # Verify user is part of this reservation
    if is_vlasnik and reservation.idVlasnik != vlasnik.idVlasnik:
        return Response(
            {"error": "You are not authorized to access this reservation"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    elif not is_vlasnik and reservation.idSetac != setac.idSetac:
        return Response(
            {"error": "You are not authorized to access this reservation"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get the other user's email
    if is_vlasnik:
        try:
            other_setac = Setac.objects.get(idSetac=other_id)
            other_user_email = other_setac.emailSetac
        except Setac.DoesNotExist:
            return Response(
                {"error": "Walker not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        try:
            other_vlasnik = Vlasnik.objects.get(idVlasnik=other_id)
            other_user_email = other_vlasnik.emailVlasnik
        except Vlasnik.DoesNotExist:
            return Response(
                {"error": "Owner not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    # Get the other user
    try:
        other_user = User.objects.get(email=other_user_email)
    except User.DoesNotExist:
        return Response(
            {"error": "Other user not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get or create conversation
    conversation = Conversation.objects.filter(
        (Q(participant1=request.user) & Q(participant2=other_user)) |
        (Q(participant1=other_user) & Q(participant2=request.user))
    ).first()
    
    if not conversation:
        # Create new conversation (ensure consistent ordering)
        if request.user.id < other_user.id:
            conversation = Conversation.objects.create(
                participant1=request.user,
                participant2=other_user
            )
        else:
            conversation = Conversation.objects.create(
                participant1=other_user,
                participant2=request.user
            )
    
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data)
