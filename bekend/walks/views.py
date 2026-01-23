from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.authentication import CsrfExemptSessionAuthentication
from .models import Setnja
from .serializers import SetnjaSerializer
from .utils import get_current_setac_id
from reservations.models import Rezervacija


# =========================
# WALKER'S OWN WALKS
# =========================

@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walks_list(request):
    setac_id = get_current_setac_id(request.user)

    qs = Setnja.objects.filter(
        idSetac=setac_id
    ).order_by("terminSetnje", "idSetnje")

    return Response({
        "success": 1,
        "count": qs.count(),
        "data": SetnjaSerializer(qs, many=True).data
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walks_create(request):
    setac_id = get_current_setac_id(request.user)

    serializer = SetnjaSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"success": 0, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    trajanje = serializer.validated_data.get("trajanjeSetnje")
    if isinstance(trajanje, str):
        from datetime import timedelta
        try:
            h, m, s = map(int, trajanje.split(":"))
            trajanje = timedelta(hours=h, minutes=m, seconds=s)
        except Exception:
            pass

    grad = (
        request.data.get("gradSetnje")
        or request.data.get("city")
        or request.data.get("location")
        or ""
    ).strip() or None

    walk = Setnja.objects.create(
        idSetac=setac_id,
        terminSetnje=serializer.validated_data.get("terminSetnje"),
        tipSetnje=serializer.validated_data.get("tipSetnje"),  # 1 = Individual, 2 = Group
        cijenaSetnje=serializer.validated_data.get("cijenaSetnje"),
        trajanjeSetnje=trajanje,
        gradSetnje=grad,
    )

    return Response({
        "success": 1,
        "message": "Šetnja uspješno kreirana.",
        **SetnjaSerializer(walk).data
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walk_detail(request, walk_id: int):
    setac_id = get_current_setac_id(request.user)

    walk = get_object_or_404(
        Setnja,
        idSetnje=walk_id,
        idSetac=setac_id
    )

    return Response(
        SetnjaSerializer(walk).data,
        status=status.HTTP_200_OK
    )


@api_view(["PATCH", "PUT"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walk_update(request, walk_id: int):
    setac_id = get_current_setac_id(request.user)

    walk = get_object_or_404(
        Setnja,
        idSetnje=walk_id,
        idSetac=setac_id
    )

    partial = request.method == "PATCH"
    serializer = SetnjaSerializer(
        walk,
        data=request.data,
        partial=partial
    )

    if not serializer.is_valid():
        return Response(
            {"success": 0, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    for field, value in serializer.validated_data.items():
        setattr(walk, field, value)

    walk.save()

    return Response(
        SetnjaSerializer(walk).data,
        status=status.HTTP_200_OK
    )


@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def walk_delete(request, walk_id: int):
    setac_id = get_current_setac_id(request.user)

    walk = get_object_or_404(
        Setnja,
        idSetnje=walk_id,
        idSetac=setac_id
    )

    walk.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# =========================
# ADMIN / DEBUG
# =========================

@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_AllWalks(request):
    qs = Setnja.objects.all().order_by(
        "terminSetnje",
        "idSetnje"
    )

    return Response(
        SetnjaSerializer(qs, many=True).data,
        status=status.HTTP_200_OK
    )


# =========================
# AVAILABLE WALKS (FIXED)
# =========================

@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_available_walks(request):
    """
    Rules:
    - future walks only
    - individual walks (tipSetnje=1) are hidden ONLY if they have
      an active reservation (pending or accepted)
    - declined reservations do NOT hide the walk
    """

    future_walks = Setnja.objects.filter(
        terminSetnje__gte=timezone.now()
    )

    # Active reservations = pending (None) or accepted (True)
    active_reserved_walk_ids = Rezervacija.objects.filter(
        potvrdeno__in=[True, None]
    ).values_list(
        "idSetnje",
        flat=True
    )

    available_walks = future_walks.exclude(
        tipSetnje=1,                      # Individual
        idSetnje__in=active_reserved_walk_ids
    ).order_by(
        "terminSetnje",
        "idSetnje"
    )

    serializer = SetnjaSerializer(available_walks, many=True)

    return Response({
        "success": 1,
        "count": available_walks.count(),
        "data": serializer.data
    }, status=status.HTTP_200_OK)
