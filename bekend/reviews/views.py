from django.db.models import Avg, Count
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from accounts.models import Vlasnik
from accounts.authentication import CsrfExemptSessionAuthentication
from .models import Recenzija
from .serializers import RecenzijaSerializer

@extend_schema(
    request=RecenzijaSerializer,
    responses={
        201: OpenApiResponse(description="Recenzija uspješno objavljena."),
        400: OpenApiResponse(description="Greška u podacima."),
        404: OpenApiResponse(description="Vlasnik nije pronađen.")
    }
)
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_review(request):
    try:
        vlasnik = Vlasnik.objects.get(emailVlasnik=request.user.email)
    except Vlasnik.DoesNotExist:
        return Response({"success": 0, "message": "Vlasnik nije pronađen."}, status=404)

    serializer = RecenzijaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(idVlasnik=vlasnik)
        return Response({
            "success": 1,
            "message": "Recenzija uspješno objavljena.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({"success": 0, "errors": serializer.errors}, status=400)

@extend_schema(
    responses={
        200: RecenzijaSerializer(many=True),
        404: OpenApiResponse(description="Vlasnik nije pronađen.")
    }
)
@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_my_reviews(request):
    try:
        vlasnik = Vlasnik.objects.get(emailVlasnik=request.user.email)
        reviews = Recenzija.objects.filter(idVlasnik=vlasnik)
        serializer = RecenzijaSerializer(reviews, many=True)
        return Response({
            "success": 1,
            "count": reviews.count(),
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Vlasnik.DoesNotExist:
        return Response({"success": 0, "message": "Vlasnik nije pronađen."}, status=404)

@extend_schema(
    responses={
        200: OpenApiResponse(description="Recenzija uspješno obrisana."),
        403: OpenApiResponse(description="Nemate ovlasti za brisanje ove recenzije."),
        404: OpenApiResponse(description="Recenzija nije pronađena.")
    }
)
@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):
    try:
        recenzija = Recenzija.objects.get(idRecenzije=review_id)
        vlasnik = Vlasnik.objects.get(emailVlasnik=request.user.email)
        
        if recenzija.idVlasnik != vlasnik:
            return Response({"success": 0, "message": "Nemate ovlasti za brisanje."}, status=403)
            
        recenzija.delete()
        return Response({"success": 1, "message": "Recenzija obrisana."}, status=200)
    except Recenzija.DoesNotExist:
        return Response({"success": 0, "message": "Recenzija nije pronađena."}, status=404)
    except Vlasnik.DoesNotExist:
        return Response({"success": 0, "message": "Vlasnik nije pronađen."}, status=404)

@extend_schema(
    responses={200: OpenApiResponse(description="Prosječna ocjena šetača.")},
    parameters=[OpenApiParameter(name='setac_id', type=int, location=OpenApiParameter.PATH, description='ID šetača')]
)
@api_view(['GET'])
def get_walker_average(request, setac_id):
    stats = Recenzija.objects.filter(idSetac=setac_id).aggregate(
        prosek=Avg('ocjena'),
        ukupno=Count('idRecenzije')
    )
    avg_rating = stats['prosek']
    total_reviews = stats['ukupno']
    if avg_rating is None:
        return Response({"idSetac": setac_id, "average_rating": 0.00, "total_reviews": 0})
    return Response({
        "idSetac": setac_id, 
        "average_rating": round(float(avg_rating), 2),
        "total_reviews": total_reviews
    })