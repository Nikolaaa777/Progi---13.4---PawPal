from accounts.authentication import CsrfExemptSessionAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
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
    UserSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiResponse
from reservations.models import Rezervacija
from accounts.models import Vlasnik, Setac


def _as_int(x):
    """
    Normalizira vrijednost u int.
    - ako je FK objekt, izvuče njegov PK
    - ako je string broj, pretvori u int
    - ako je None/"" ostavi None
    """
    if x is None:
        return None

    # FK objekti (ako ikad budu)
    if hasattr(x, "idVlasnik"):
        x = x.idVlasnik
    if hasattr(x, "idSetac"):
        x = x.idSetac

    if isinstance(x, str):
        x = x.strip()
        if x == "":
            return None

    try:
        return int(x)
    except (TypeError, ValueError):
        return x


@extend_schema(responses={200: OpenApiResponse(description="List of conversations")})
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    user = request.user
    conversations = (
        Conversation.objects.filter(Q(participant1=user) | Q(participant2=user))
        .annotate(last_message_time=Max("messages__created_at"))
        .order_by("-updated_at")
    )
    serializer = ConversationSerializer(conversations, many=True, context={"request": request})
    return Response(serializer.data)


@extend_schema(responses={200: OpenApiResponse(description="Conversation details with messages")})
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversation(request, conversation_id):
    try:
        conversation = Conversation.objects.get(
            Q(id=conversation_id)
            & (Q(participant1=request.user) | Q(participant2=request.user))
        )
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    Message.objects.filter(
        conversation=conversation,
        sender__id=conversation.get_other_participant(request.user).id,
        read=False,
    ).update(read=True)

    messages = conversation.messages.all()
    conversation_data = ConversationSerializer(conversation, context={"request": request}).data
    messages_data = MessageSerializer(messages, many=True).data

    return Response({"conversation": conversation_data, "messages": messages_data})


@extend_schema(responses={200: OpenApiResponse(description="Conversation created or retrieved")})
@csrf_exempt
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_or_create_conversation(request, user_id):
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    if other_user == request.user:
        return Response(
            {"error": "Cannot create conversation with yourself"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    conversation = Conversation.objects.filter(
        (Q(participant1=request.user) & Q(participant2=other_user))
        | (Q(participant1=other_user) & Q(participant2=request.user))
    ).first()

    if not conversation:
        if request.user.id < other_user.id:
            conversation = Conversation.objects.create(participant1=request.user, participant2=other_user)
        else:
            conversation = Conversation.objects.create(participant1=other_user, participant2=request.user)

    serializer = ConversationSerializer(conversation, context={"request": request})
    return Response(serializer.data)


@extend_schema(
    request=CreateMessageSerializer,
    responses={201: OpenApiResponse(description="Message created")},
)
@csrf_exempt
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def send_message(request):
    serializer = CreateMessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    conversation_id = serializer.validated_data.get("conversation_id")
    content = serializer.validated_data["content"]

    if not conversation_id:
        return Response({"error": "conversation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(
            Q(id=conversation_id)
            & (Q(participant1=request.user) | Q(participant2=request.user))
        )
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    message = Message.objects.create(conversation=conversation, sender=request.user, content=content)
    conversation.save()

    serializer_response = MessageSerializer(message)
    return Response(serializer_response.data, status=status.HTTP_201_CREATED)


@extend_schema(responses={200: OpenApiResponse(description="List of users")})
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_users(request):
    users = User.objects.exclude(id=request.user.id)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@extend_schema(
    responses={200: OpenApiResponse(description="Conversation created or retrieved from reservation")}
)
@csrf_exempt
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_or_create_conversation_from_reservation(request, reservation_id):
    try:
        reservation = Rezervacija.objects.get(idRezervacije=reservation_id)
    except Rezervacija.DoesNotExist:
        return Response({"error": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND)

    if not reservation.potvrdeno:
        return Response(
            {"error": "Reservation must be confirmed before starting a conversation"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    current_user_email = (request.user.email or "").strip()

    # rezervacija ID-evi iz baze mogu biti int, bigint, str, ili FK objekt -> normaliziraj
    res_vlasnik_id = _as_int(reservation.idVlasnik)
    res_setac_id = _as_int(reservation.idSetac)

    # tko je trenutni user u "domeni"
    vlasnik = Vlasnik.objects.filter(emailVlasnik__iexact=current_user_email).first()
    setac = Setac.objects.filter(emailSetac__iexact=current_user_email).first()

    if not vlasnik and not setac:
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    if vlasnik:
        # vlasnik mora odgovarati rezervaciji
        if res_vlasnik_id != _as_int(vlasnik.idVlasnik):
            return Response(
                {"error": "You are not authorized to access this reservation"},
                status=status.HTTP_403_FORBIDDEN,
            )

        other_setac = Setac.objects.filter(idSetac=res_setac_id).first()
        if not other_setac:
            return Response({"error": "Walker not found"}, status=status.HTTP_404_NOT_FOUND)

        other_user_email = other_setac.emailSetac

    else:
        # šetač mora biti dodijeljen i mora odgovarati rezervaciji
        if res_setac_id in (None, 0):
            return Response(
                {"error": "Reservation has no walker assigned"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if res_setac_id != _as_int(setac.idSetac):
            return Response(
                {"error": "You are not authorized to access this reservation"},
                status=status.HTTP_403_FORBIDDEN,
            )

        other_vlasnik = Vlasnik.objects.filter(idVlasnik=res_vlasnik_id).first()
        if not other_vlasnik:
            return Response({"error": "Owner not found"}, status=status.HTTP_404_NOT_FOUND)

        other_user_email = other_vlasnik.emailVlasnik

    # nađi Django auth user druge strane
    other_user = User.objects.filter(email__iexact=(other_user_email or "").strip()).first()
    if not other_user:
        return Response({"error": "Other user not found"}, status=status.HTTP_404_NOT_FOUND)

    conversation = Conversation.objects.filter(
        (Q(participant1=request.user) & Q(participant2=other_user))
        | (Q(participant1=other_user) & Q(participant2=request.user))
    ).first()

    if not conversation:
        if request.user.id < other_user.id:
            conversation = Conversation.objects.create(participant1=request.user, participant2=other_user)
        else:
            conversation = Conversation.objects.create(participant1=other_user, participant2=request.user)

    serializer = ConversationSerializer(conversation, context={"request": request})
    return Response(serializer.data)
