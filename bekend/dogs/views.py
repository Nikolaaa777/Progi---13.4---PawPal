from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
from django.views.decorators.csrf import csrf_exempt

from .models import Pas
from .serializers import PasSerializer
from .utils import get_current_vlasnik

from accounts.authentication import CsrfExemptSessionAuthentication


@extend_schema(
    responses={200: PasSerializer(many=True)},
)

@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_AllDogs(request):
    vlasnik = get_current_vlasnik(request.user)
    dogs = Pas.objects.filter(vlasnik=vlasnik).order_by("idPsa")
    return Response(PasSerializer(dogs, many=True).data, status=status.HTTP_200_OK)


@extend_schema(
    request=PasSerializer,
    responses={
        201: PasSerializer,
        400: OpenApiResponse(description="Validation error."),
        403: OpenApiResponse(description="Forbidden."),
    },
    examples=[
        OpenApiExample(
            "Create dog example",
            value={
                "imePsa": "Rex",
                "starostPsa": 4,
                "pasminaPsa": "Labrador",
                "energijaPsa": "visoka",
                "zdravPas": "dobro",
                "posPsa": "mirno",
                "socPsa": "društven",
            },
        )
    ],
)

@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def dogs_create(request):
    vlasnik = get_current_vlasnik(request.user)

    serializer = PasSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"success": 0, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    dog: Pas = Pas.objects.create(
        vlasnik=vlasnik,
        imePsa=serializer.validated_data.get("imePsa"),
        starostPsa=serializer.validated_data.get("starostPsa"),
        pasminaPsa=serializer.validated_data.get("pasminaPsa"),
        energijaPsa=serializer.validated_data.get("energijaPsa"),
        zdravPas=serializer.validated_data.get("zdravPas"),
        posPsa=serializer.validated_data.get("posPsa"),
        socPsa=serializer.validated_data.get("socPsa"),
    )

    return Response(PasSerializer(dog).data, status=status.HTTP_201_CREATED)


@extend_schema(
    responses={
        200: PasSerializer,
        404: OpenApiResponse(description="Not found."),
    }
)
@csrf_exempt
@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def dog_detail(request, dog_id: int):
    vlasnik = get_current_vlasnik(request.user)
    dog = Pas.objects.filter(idPsa=dog_id, vlasnik_id=vlasnik.idVlasnik).first()
    if not dog:
        return Response({"message": "Dog not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(PasSerializer(dog).data, status=status.HTTP_200_OK)


@extend_schema(
    request=PasSerializer,
    responses={
        200: PasSerializer,
        400: OpenApiResponse(description="Validation error."),
        404: OpenApiResponse(description="Not found."),
    }
)
@csrf_exempt
@api_view(["PUT", "PATCH"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def dog_update(request, dog_id: int):
    vlasnik = get_current_vlasnik(request.user)
    dog = Pas.objects.filter(idPsa=dog_id, vlasnik_id=vlasnik.idVlasnik).first()
    if not dog:
        return Response({"message": "Dog not found."}, status=status.HTTP_404_NOT_FOUND)

    partial = request.method == "PATCH"
    serializer = PasSerializer(dog, data=request.data, partial=partial)
    if not serializer.is_valid():
        return Response({"success": 0, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # ručno assign jer managed=False (ali save() radi normalno za update)
    for field, value in serializer.validated_data.items():
        setattr(dog, field, value)

    dog.save()
    return Response(PasSerializer(dog).data, status=status.HTTP_200_OK)


@extend_schema(
    responses={
        204: OpenApiResponse(description="Deleted."),
        404: OpenApiResponse(description="Not found."),
    }
)
@csrf_exempt
@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def dog_delete(request, dog_id: int):
    vlasnik = get_current_vlasnik(request.user)
    dog = Pas.objects.filter(idPsa=dog_id, vlasnik_id=vlasnik.idVlasnik).first()
    if not dog:
        return Response({"message": "Dog not found."}, status=status.HTTP_404_NOT_FOUND)

    dog.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
