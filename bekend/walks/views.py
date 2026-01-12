from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.authentication import CsrfExemptSessionAuthentication
from .models import Setnja
from .serializers import SetnjaSerializer
from .utils import get_current_setac_id


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walks_list(request):
    setac_id = get_current_setac_id(request.user)
    qs = Setnja.objects.filter(idSetac=setac_id).order_by("terminSetnje", "idSetnje")
    return Response(SetnjaSerializer(qs, many=True).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walks_create(request):
    setac_id = get_current_setac_id(request.user)

    serializer = SetnjaSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"success": 0, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    walk = Setnja.objects.create(
        idSetac=setac_id,
        terminSetnje=serializer.validated_data.get("terminSetnje"),
        tipSetnje=serializer.validated_data.get("tipSetnje"),
        cijenaSetnje=serializer.validated_data.get("cijenaSetnje"),
        trajanjeSetnje=serializer.validated_data.get("trajanjeSetnje"),
    )

    return Response(SetnjaSerializer(walk).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walk_detail(request, walk_id: int):
    setac_id = get_current_setac_id(request.user)
    walk = get_object_or_404(Setnja, idSetnje=walk_id, idSetac=setac_id)
    return Response(SetnjaSerializer(walk).data, status=status.HTTP_200_OK)


@api_view(["PATCH", "PUT"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walk_update(request, walk_id: int):
    setac_id = get_current_setac_id(request.user)
    walk = get_object_or_404(Setnja, idSetnje=walk_id, idSetac=setac_id)

    partial = request.method == "PATCH"
    serializer = SetnjaSerializer(walk, data=request.data, partial=partial)
    if not serializer.is_valid():
        return Response({"success": 0, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    for field, value in serializer.validated_data.items():
        setattr(walk, field, value)

    walk.save()
    return Response(SetnjaSerializer(walk).data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walk_delete(request, walk_id: int):
    setac_id = get_current_setac_id(request.user)
    walk = get_object_or_404(Setnja, idSetnje=walk_id, idSetac=setac_id)
    walk.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)




@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_AllWalks(request):
    qs = Setnja.objects.all().order_by("terminSetnje", "idSetnje")
    return Response(SetnjaSerializer(qs, many=True).data, status=status.HTTP_200_OK)
