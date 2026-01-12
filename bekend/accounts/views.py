from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.urls import reverse
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample, OpenApiParameter
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Profile 
from .serializers import EnableWalkerSerializer
from .domain_sync import ensure_setac_row, SetacPayload



from accounts.authentication import CsrfExemptSessionAuthentication

@extend_schema(responses={200: OpenApiResponse(description='CSRF token')})
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    return Response({"csrfToken": get_token(request)})


@extend_schema(
    request=RegisterSerializer,
    responses={
        201: OpenApiResponse(description="Registered successfully."),
        400: OpenApiResponse(description="Validation error.")
    },
    examples=[
        OpenApiExample(
            'Register example',
            value={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User',
                'password': 'tajna123',
                'is_walker': True
            }
        )
    ]
)
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"success": 1, "message": "Registered successfully."}, status=status.HTTP_201_CREATED)
    return Response({"success": 0, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(description="Logged in."),
        401: OpenApiResponse(description="Invalid credentials."),
        400: OpenApiResponse(description="Validation error.")
    },
    examples=[
        OpenApiExample('Login example', value={'email':'test@example.com','password':'tajna123'})
    ]
)

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"success": 0, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"success": 0, "message": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
    user = authenticate(request, username=user.username, password=password)
    if user is None:
        return Response({"success": 0, "message": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
    login(request, user)
    return Response({"success": 1, "message": "Logged in."})


@csrf_exempt
@extend_schema(responses={200: OpenApiResponse(description='Logged out.')})
@api_view(["POST"])
@permission_classes([AllowAny])  
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out"}, status=status.HTTP_200_OK)

@csrf_exempt
@extend_schema(responses={200: OpenApiResponse(description='Current user info')})
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)
    return Response({
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_walker": profile.is_walker,
        "has_notifications_on": profile.has_notifications_on,
    }, status=status.HTTP_200_OK)

@extend_schema(
    responses={200: OpenApiResponse(description="Google login URL")}
)
@api_view(["GET"])
@permission_classes([AllowAny])
def google_login_url(request):
    # naziv rute "google_login" dolazi iz allauth-a
    url = request.build_absolute_uri(reverse("google_login"))
    return Response({"url": url})


@extend_schema(
    responses={200: OpenApiResponse(description="Toggled notifications")},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_notifications(request):
    # osiguraj da profil SIGURNO postoji (i za Google i za stare user-e)
    profile, _ = Profile.objects.get_or_create(user=request.user)

    profile.has_notifications_on = not profile.has_notifications_on
    profile.save()

    return Response({
        "has_notifications_on": profile.has_notifications_on
    })


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def enable_walker(request):
    serializer = EnableWalkerSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"success": 0, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    phone = (serializer.validated_data.get("phone") or "").strip() or None

    with transaction.atomic():
        profile, _ = Profile.objects.get_or_create(user=request.user)
        setac = ensure_setac_row(
            request.user,
            payload=SetacPayload(
            email=request.user.email,
            username=None,  # neka se generira
            first_name=request.user.first_name or None,
            last_name=request.user.last_name or None,
            phone=phone,
            idClanarine=None,
            idProfilne=None,
            ),
        )
        profile.is_walker = True
        profile.save(update_fields=["is_walker"])

    return Response({
        "success": 1,
        "message": "Walker enabled.",
        "is_walker": True,
        "idSetac": setac.idSetac,
        "usernameSetac": setac.usernameSetac,
    }, status=status.HTTP_200_OK)