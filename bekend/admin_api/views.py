from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from membership.models import Clanarina

from .permissions import IsAdmin

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAdmin])
def users_list(request):
    qs = User.objects.all().order_by("-id")
    return Response([
        {
            "id": u.id,
            "email": getattr(u, "email", ""),
            "is_active": u.is_active,
            "is_staff": u.is_staff,
        }
        for u in qs
    ])

@api_view(["PATCH"])
@permission_classes([IsAdmin])
def user_disable(request, user_id):
    updated = User.objects.filter(id=user_id).update(is_active=False)
    if updated == 0:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"ok": True})

@api_view(["PATCH"])
@permission_classes([IsAdmin])
def user_enable(request, user_id):
    updated = User.objects.filter(id=user_id).update(is_active=True)
    if updated == 0:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"ok": True})



def get_clanarina():
    obj = Clanarina.objects.first()
    if obj is None:
        obj = Clanarina.objects.create(iznos=0)
    return obj


@api_view(["GET"])
@permission_classes([IsAdmin])
def clanarina_get(request):
    c = get_clanarina()
    return Response({
        "iznos": str(c.iznos),
        "updated_at": c.updated_at,
    })


@api_view(["PATCH"])
@permission_classes([IsAdmin])
def clanarina_update(request):
    c = get_clanarina()

    iznos = request.data.get("iznos", None)
    if iznos is None:
        return Response(
            {"detail": "Field 'iznos' is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        c.iznos = iznos
        c.save()
    except Exception:
        return Response(
            {"detail": "Invalid value for iznos"},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response({
        "iznos": str(c.iznos),
        "updated_at": c.updated_at,
    })