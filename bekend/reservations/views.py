from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication

from accounts.models import Vlasnik, Setac
from walks.models import Setnja
from dogs.models import Pas

from .models import Rezervacija
from .serializers import RezervacijaSerializer


# --------------------------------------------------
# CSRF EXEMPT AUTH (REQUIRED)
# --------------------------------------------------
class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


# --------------------------------------------------
# CREATE reservation (manual)
# --------------------------------------------------
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_reservation(request):
    try:
        vlasnik = Vlasnik.objects.get(emailVlasnik=request.user.email)
    except Vlasnik.DoesNotExist:
        return Response(
            {"success": 0, "message": "Samo vlasnici mogu kreirati rezervaciju."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = RezervacijaSerializer(
        data=request.data,
        context={"vlasnik": vlasnik}
    )

    if serializer.is_valid():
        serializer.save(potvrdeno=None)  # PENDING
        return Response(
            {"success": 1, "data": serializer.data},
            status=status.HTTP_201_CREATED
        )

    return Response(
        {"success": 0, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )


# --------------------------------------------------
# CREATE reservation FROM WALK
# --------------------------------------------------
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_reservation_from_walk(request, walk_id):
    try:
        vlasnik = Vlasnik.objects.get(emailVlasnik=request.user.email)
    except Vlasnik.DoesNotExist:
        return Response(
            {"success": 0, "message": "Samo vlasnici mogu."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        walk = Setnja.objects.get(idSetnje=walk_id)
    except Setnja.DoesNotExist:
        return Response(
            {"success": 0, "message": "Šetnja ne postoji."},
            status=status.HTTP_404_NOT_FOUND
        )

    dog_id = request.data.get("idPsa")
    if not dog_id:
        return Response(
            {"success": 0, "message": "idPsa je obavezan."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        pas = Pas.objects.get(idPsa=int(dog_id), vlasnik=vlasnik)
    except (Pas.DoesNotExist, ValueError):
        return Response(
            {"success": 0, "message": "Pas nije pronađen ili ne pripada vama."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = RezervacijaSerializer(
        data={
            "idSetnje": walk.idSetnje,
            "idSetac": walk.idSetac,
            "idPsa": pas.idPsa
        },
        context={"vlasnik": vlasnik}
    )

    if serializer.is_valid():
        serializer.save(potvrdeno=None)  # PENDING
        return Response(
            {"success": 1, "data": serializer.data},
            status=status.HTTP_201_CREATED
        )

    return Response(
        {"success": 0, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )


# --------------------------------------------------
# GET my reservations (OWNER or WALKER)
# --------------------------------------------------
@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_my_reservations(request):
    email = request.user.email

    vlasnik = Vlasnik.objects.filter(emailVlasnik=email).first()
    setac = Setac.objects.filter(emailSetac=email).first()

    if not vlasnik and not setac:
        return Response(
            {"success": 0, "message": "Profil nije pronađen."},
            status=status.HTTP_403_FORBIDDEN
        )

    qs = Rezervacija.objects.none()

    if vlasnik:
        qs = qs | Rezervacija.objects.filter(idVlasnik=vlasnik.idVlasnik)

    if setac:
        qs = qs | Rezervacija.objects.filter(idSetac=setac.idSetac)

    serializer = RezervacijaSerializer(qs.distinct(), many=True)
    return Response({"success": 1, "data": serializer.data})


# --------------------------------------------------
# ACCEPT reservation (WALKER ONLY)
# --------------------------------------------------
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def accept_reservation(request, reservation_id):
    try:
        r = Rezervacija.objects.get(idRezervacije=reservation_id)
    except Rezervacija.DoesNotExist:
        return Response({"success": 0, "message": "Rezervacija ne postoji."}, status=404)

    try:
        setac = Setac.objects.get(emailSetac=request.user.email)
    except Setac.DoesNotExist:
        return Response(
            {"success": 0, "message": "Samo šetač može prihvatiti rezervaciju."},
            status=403
        )

    if r.idSetac != setac.idSetac:
        return Response(
            {"success": 0, "message": "Nemate pravo na ovu rezervaciju."},
            status=403
        )

    r.potvrdeno = True
    r.save()

    return Response({"success": 1, "message": "Rezervacija prihvaćena."})


# --------------------------------------------------
# REJECT reservation (WALKER ONLY)
# --------------------------------------------------
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def reject_reservation(request, reservation_id):
    try:
        r = Rezervacija.objects.get(idRezervacije=reservation_id)
    except Rezervacija.DoesNotExist:
        return Response({"success": 0, "message": "Rezervacija ne postoji."}, status=404)

    try:
        setac = Setac.objects.get(emailSetac=request.user.email)
    except Setac.DoesNotExist:
        return Response(
            {"success": 0, "message": "Samo šetač može odbiti rezervaciju."},
            status=403
        )

    if r.idSetac != setac.idSetac:
        return Response(
            {"success": 0, "message": "Nemate pravo na ovu rezervaciju."},
            status=403
        )

    r.potvrdeno = False
    r.save()

    return Response({"success": 1, "message": "Rezervacija odbijena."})


# --------------------------------------------------
# MARK walk done (WALKER ONLY)
# --------------------------------------------------
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def mark_walk_done(request, reservation_id):
    try:
        r = Rezervacija.objects.get(idRezervacije=reservation_id)
    except Rezervacija.DoesNotExist:
        return Response({"success": 0, "message": "Rezervacija ne postoji."}, status=404)

    if r.potvrdeno is not True:
        return Response(
            {"success": 0, "message": "Rezervacija mora biti prihvaćena."},
            status=400
        )

    r.odradena = True
    r.save()

    return Response({"success": 1, "message": "Šetnja označena kao odrađena."})


# --------------------------------------------------
# DELETE reservation (OWNER or WALKER)
# --------------------------------------------------
@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def delete_reservation(request, reservation_id):
    r = Rezervacija.objects.filter(idRezervacije=reservation_id).first()
    if not r:
        return Response({"success": 0, "message": "Rezervacija ne postoji."}, status=404)

    email = request.user.email
    vlasnik = Vlasnik.objects.filter(emailVlasnik=email).first()
    setac = Setac.objects.filter(emailSetac=email).first()

    if not (
        (vlasnik and r.idVlasnik == vlasnik.idVlasnik) or
        (setac and r.idSetac == setac.idSetac)
    ):
        return Response(
            {"success": 0, "message": "Nemate pravo obrisati ovu rezervaciju."},
            status=403
        )

    r.delete()
    return Response({"success": 1, "message": "Rezervacija obrisana."})
