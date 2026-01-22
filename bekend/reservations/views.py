from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse
from accounts.models import Vlasnik, Setac
from accounts.authentication import CsrfExemptSessionAuthentication
from .models import Rezervacija
from .serializers import RezervacijaSerializer
from datetime import timedelta
from walks.models import Setnja

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
        reservation = serializer.save()
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
        # idVlasnik is a BigIntegerField, so we need to compare with the integer ID
        reservations |= Rezervacija.objects.filter(idVlasnik=vlasnik.idVlasnik)
    if setac:
        # idSetac is a BigIntegerField, so we need to compare with the integer ID
        reservations |= Rezervacija.objects.filter(idSetac=setac.idSetac)

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
        
        vlasnik = Vlasnik.objects.filter(emailVlasnik=user_email).first()
        setac = Setac.objects.filter(emailSetac=user_email).first()
        
        is_vlasnik = vlasnik and reservacija.idVlasnik == vlasnik.idVlasnik
        is_setac = setac and reservacija.idSetac == setac.idSetac
        
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


@extend_schema(
    responses={
        200: OpenApiResponse(description="Rezervacija uspješno prihvaćena."),
        403: OpenApiResponse(description="Nemate ovlasti za prihvaćanje ove rezervacije."),
        404: OpenApiResponse(description="Rezervacija nije pronađena.")
    }
)
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def accept_reservation(request, reservation_id):
    """Walker accepts a reservation"""
    try:
        reservacija = Rezervacija.objects.get(idRezervacije=reservation_id)
        user_email = request.user.email
        
        # Check if user is the walker for this reservation
        try:
            setac = Setac.objects.get(emailSetac=user_email)
            if reservacija.idSetac != setac.idSetac:
                return Response({
                    "success": 0,
                    "message": "Samo šetač za ovu rezervaciju može je prihvatiti."
                }, status=status.HTTP_403_FORBIDDEN)
        except Setac.DoesNotExist:
            return Response({
                "success": 0,
                "message": "Samo šetači mogu prihvatiti rezervacije."
            }, status=status.HTTP_403_FORBIDDEN)
        
        reservacija.potvrdeno = True
        reservacija.save()
        
        serializer = RezervacijaSerializer(reservacija)
        return Response({
            "success": 1,
            "message": "Rezervacija uspješno prihvaćena.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Rezervacija.DoesNotExist:
        return Response({"success": 0, "message": "Rezervacija nije pronađena."}, status=404)


@extend_schema(
    responses={
        200: OpenApiResponse(description="Rezervacija uspješno odbijena."),
        403: OpenApiResponse(description="Nemate ovlasti za odbijanje ove rezervacije."),
        404: OpenApiResponse(description="Rezervacija nije pronađena.")
    }
)
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def reject_reservation(request, reservation_id):
    """Walker rejects a reservation"""
    try:
        reservacija = Rezervacija.objects.get(idRezervacije=reservation_id)
        user_email = request.user.email
        
        # Check if user is the walker for this reservation
        try:
            setac = Setac.objects.get(emailSetac=user_email)
            if reservacija.idSetac != setac.idSetac:
                return Response({
                    "success": 0,
                    "message": "Samo šetač za ovu rezervaciju može je odbiti."
                }, status=status.HTTP_403_FORBIDDEN)
        except Setac.DoesNotExist:
            return Response({
                "success": 0,
                "message": "Samo šetači mogu odbiti rezervacije."
            }, status=status.HTTP_403_FORBIDDEN)
        
        reservacija.potvrdeno = False
        reservacija.save()
        
        return Response({
            "success": 1,
            "message": "Rezervacija uspješno odbijena."
        }, status=status.HTTP_200_OK)
        
    except Rezervacija.DoesNotExist:
        return Response({"success": 0, "message": "Rezervacija nije pronađena."}, status=404)


@extend_schema(
    responses={
        200: OpenApiResponse(description="Šetnja označena kao završena."),
        403: OpenApiResponse(description="Nemate ovlasti za označavanje šetnje."),
        404: OpenApiResponse(description="Rezervacija nije pronađena.")
    }
)
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def mark_walk_done(request, reservation_id):
    """Walker marks the walk as done"""
    try:
        reservacija = Rezervacija.objects.get(idRezervacije=reservation_id)
        user_email = request.user.email
        
        # Check if user is the walker for this reservation
        try:
            setac = Setac.objects.get(emailSetac=user_email)
            if reservacija.idSetac != setac.idSetac:
                return Response({
                    "success": 0,
                    "message": "Samo šetač za ovu rezervaciju može označiti šetnju kao završenu."
                }, status=status.HTTP_403_FORBIDDEN)
        except Setac.DoesNotExist:
            return Response({
                "success": 0,
                "message": "Samo šetači mogu označiti šetnju kao završenu."
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not reservacija.potvrdeno:
            return Response({
                "success": 0,
                "message": "Rezervacija mora biti prihvaćena prije nego što se može označiti kao završena."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reservacija.odradena = True
        reservacija.save()
        
        serializer = RezervacijaSerializer(reservacija)
        return Response({
            "success": 1,
            "message": "Šetnja označena kao završena.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Rezervacija.DoesNotExist:
        return Response({"success": 0, "message": "Rezervacija nije pronađena."}, status=404)


@extend_schema(
    request=RezervacijaSerializer,
    responses={
        201: OpenApiResponse(description="Rezervacija uspješno kreirana iz šetnje."), 
        400: OpenApiResponse(description="Greška u validaciji."),
        404: OpenApiResponse(description="Vlasnik ili šetnja nije pronađen.")
    }
)
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_reservation_from_walk(request, walk_id):
    """Owner creates a reservation from an available walk"""
    try:
        vlasnik = Vlasnik.objects.get(emailVlasnik=request.user.email)
    except Vlasnik.DoesNotExist:
        return Response({"success": 0, "message": "Samo vlasnici mogu kreirati rezervacije."}, status=404)
    
    try:
        walk = Setnja.objects.get(idSetnje=walk_id)
    except Setnja.DoesNotExist:
        return Response({"success": 0, "message": "Šetnja nije pronađena."}, status=404)
    
    
    # Get the dog object
    from dogs.models import Pas
    try:
        dog_id = request.data.get('idPsa')
        if not dog_id:
            return Response({"success": 0, "message": "idPsa is required"}, status=400)
        
        # Convert to int if it's a string
        if isinstance(dog_id, str):
            dog_id = int(dog_id)
        
        pas = Pas.objects.get(idPsa=dog_id, vlasnik=vlasnik)
    except Pas.DoesNotExist:
        return Response({"success": 0, "message": "Pas nije pronađen ili ne pripada vama."}, status=404)
    except (ValueError, TypeError):
        return Response({"success": 0, "message": "Nevažeći ID psa."}, status=400)
    
    
    if walk.terminSetnje:
        start_new = walk.terminSetnje
        end_new = walk.terminSetnje + (walk.trajanjeSetnje or timedelta(hours=1))
    
        confirmed = Rezervacija.objects.filter(
            idSetac=walk.idSetac,
            potvrdeno=True
        ).exclude(idSetnje=walk.idSetnje)  # safety
    
        for r in confirmed:
            other = Setnja.objects.filter(idSetnje=r.idSetnje).first()
            if not other or not other.terminSetnje:
                continue
            
            start_old = other.terminSetnje
            end_old = other.terminSetnje + (other.trajanjeSetnje or timedelta(hours=1))
    
            if start_new < end_old and end_new > start_old:
                return Response(
                    {"success": 0, "message": "Šetač već ima potvrđenu rezervaciju u tom terminu."},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
    reservation_data = {
        "idSetnje": walk.idSetnje,
        'idSetac': walk.idSetac,
        'idPsa': pas.idPsa,  
    }
    
    serializer = RezervacijaSerializer(data=reservation_data, context={'vlasnik': vlasnik})
    
    if serializer.is_valid():
        # Save with integer IDs as the model expects
        reservation = serializer.save()
        return Response({
            "success": 1,
            "message": "Rezervacija uspješno kreirana.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({"success": 0, "errors": serializer.errors, "message": "Greška u validaciji podataka."}, status=400)