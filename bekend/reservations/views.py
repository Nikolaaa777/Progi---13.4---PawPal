from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse
from accounts.models import Vlasnik, Setac
from accounts.authentication import CsrfExemptSessionAuthentication
from .models import Rezervacija
from .serializers import RezervacijaSerializer

@extend_schema(
    request=RezervacijaSerializer,
    responses={
        201: OpenApiResponse(description="Rezervacija uspješno kreirana."), 
        400: OpenApiResponse(description="Greška u validaciji."),
        404: OpenApiResponse(description="Vlasnik nije pronađen.")
    }
)
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_reservation(request):
    try:
        vlasnik = Vlasnik.objects.get(emailVlasnik=request.user.email)
    except Vlasnik.DoesNotExist:
        return Response({"success": 0, "message": "Samo vlasnici mogu kreirati rezervacije."}, status=404)

    serializer = RezervacijaSerializer(data=request.data, context={'vlasnik': vlasnik})
    
    if serializer.is_valid():
        serializer.save(idVlasnik=vlasnik) 
        return Response({
            "success": 1,
            "message": "Rezervacija uspješno kreirana.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response({"success": 0, "errors": serializer.errors}, status=400)

@extend_schema(
    responses={
        200: RezervacijaSerializer(many=True),
        403: OpenApiResponse(description="Profil nije pronađen.")
    }
)
@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_my_reservations(request):
    user_email = request.user.email
    
    vlasnik = Vlasnik.objects.filter(emailVlasnik=user_email).first()
    setac = Setac.objects.filter(emailSetac=user_email).first()

    if not vlasnik and not setac:
        return Response({"success": 0, "message": "Korisnički profil nije pronađen."}, status=403)
    
    reservations = Rezervacija.objects.none()

    if vlasnik:
        reservations |= Rezervacija.objects.filter(idVlasnik=vlasnik)
    if setac:
        reservations |= Rezervacija.objects.filter(idSetac=setac)

    serializer = RezervacijaSerializer(reservations.distinct(), many=True)
    
    return Response({
        "success": 1,
        "count": reservations.count(),
        "data": serializer.data
    }, status=status.HTTP_200_OK)

@extend_schema(
    responses={
        200: OpenApiResponse(description="Rezervacija uspješno otkazana."),
        403: OpenApiResponse(description="Nemate ovlasti za otkazivanje ove rezervacije."),
        404: OpenApiResponse(description="Rezervacija nije pronađena.")
    }
)
@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def delete_reservation(request, reservation_id):
    try:
        reservacija = Rezervacija.objects.get(idRezervacije=reservation_id)
        user_email = request.user.email
        
        is_vlasnik = reservacija.idVlasnik.emailVlasnik == user_email
        is_setac = reservacija.idSetac.emailSetac == user_email
        
        if not (is_vlasnik or is_setac):
            return Response({
                "success": 0, 
                "message": "Samo vlasnik ili šetač mogu otkazati ovu rezervaciju."      #možda promijeniti
            }, status=status.HTTP_403_FORBIDDEN)
            
        reservacija.delete()
        return Response({
            "success": 1, 
            "message": "Rezervacija uspješno otkazana."
        }, status=status.HTTP_200_OK)

    except Rezervacija.DoesNotExist:
        return Response({"success": 0, "message": "Rezervacija nije pronađena."}, status=404)