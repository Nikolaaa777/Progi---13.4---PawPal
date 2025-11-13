from rest_framework.decorators import api_view, permission_classes
from django.urls import reverse
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer
<<<<<<< HEAD
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
=======
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample, OpenApiParameter
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
>>>>>>> 53ec9db (Popravljen Logout)



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


<<<<<<< HEAD
@extend_schema(responses={200: OpenApiResponse(description='Logged out.')})
@api_view(["POST"])
@permission_classes([IsAuthenticated])  
def logout_view(request):
    logout(request)
    return Response({"success": 1, "message": "Logged out."})
=======
@csrf_exempt
@extend_schema(responses={200: OpenApiResponse(description='Logged out.')})
@api_view(["POST"])
@permission_classes([AllowAny])  
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out"}, status=status.HTTP_200_OK)
>>>>>>> 53ec9db (Popravljen Logout)


@extend_schema(responses={200: OpenApiResponse(description='Current user info')})
@api_view(["GET"])
<<<<<<< HEAD
@permission_classes([AllowAny])  # ili IsAuthenticated i onda ne vraćaš authenticated=False
def me(request):
    u = request.user
    if not u.is_authenticated:
        return Response({"authenticated": False}, status=status.HTTP_200_OK)
    return Response({
        "authenticated": True,
        "user": {
            "id": u.id,
            "email": u.email,
            "firstName": u.first_name,
            "lastName": u.last_name,
            "username": u.username,
            "is_walker": getattr(getattr(u, "profile", None), "is_walker", False),
        }
    })

=======
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }, status=status.HTTP_200_OK)
>>>>>>> 53ec9db (Popravljen Logout)

@extend_schema(
    responses={200: OpenApiResponse(description="Google login URL")}
)
@api_view(["GET"])
@permission_classes([AllowAny])
def google_login_url(request):
    # naziv rute "google_login" dolazi iz allauth-a
    url = request.build_absolute_uri(reverse("google_login"))
    return Response({"url": url})