import requests
from decimal import Decimal

from django.conf import settings
from django.db import transaction

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import stripe

from accounts.authentication import CsrfExemptSessionAuthentication
from dogs.utils import get_current_vlasnik
from reservations.models import Rezervacija

from .models import (
    PlacanjeSetnje,
    PaymentTracking,
    PAYMENT_TYPE_PAYPAL,
    PAYMENT_TYPE_CARD,
    PAYMENT_TYPE_CASH,
    PAYMENT_STATUS_PENDING,
    PAYMENT_STATUS_COMPLETED,
    PAYMENT_STATUS_FAILED,
)
from .serializers import (
    PaymentSerializer,
    CreatePaymentIntentSerializer,
)


PAYPAL_CLIENT_ID = getattr(settings, "PAYPAL_CLIENT_ID", None)
PAYPAL_CLIENT_SECRET = getattr(settings, "PAYPAL_CLIENT_SECRET", None)
PAYPAL_MODE = getattr(settings, "PAYPAL_MODE", "sandbox")

PAYPAL_BASE_URL = (
    "https://api-m.sandbox.paypal.com"
    if PAYPAL_MODE == "sandbox"
    else "https://api-m.paypal.com"
)

STRIPE_SECRET_KEY = getattr(settings, "STRIPE_SECRET_KEY", None)
STRIPE_PUBLISHABLE_KEY = getattr(settings, "STRIPE_PUBLISHABLE_KEY", None)

stripe.api_key = STRIPE_SECRET_KEY

print("PAYPAL MODE:", PAYPAL_MODE)


def get_paypal_access_token():
    response = requests.post(
        f"{PAYPAL_BASE_URL}/v1/oauth2/token",
        headers={"Accept": "application/json"},
        data={"grant_type": "client_credentials"},
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None



@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    serializer = CreatePaymentIntentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"success": 0, "errors": serializer.errors}, status=400)

    reservation_id = serializer.validated_data["reservation_id"]
    amount = Decimal(serializer.validated_data["amount"])
    payment_method = serializer.validated_data["payment_method"]

    vlasnik = get_current_vlasnik(request.user)

    try:
        reservation = Rezervacija.objects.get(
            idRezervacije=reservation_id,
            idVlasnik=vlasnik.idVlasnik,
        )
    except Rezervacija.DoesNotExist:
        return Response({"success": 0, "error": "Reservation not found"}, status=404)

    amount_cents = int(amount * 100)

    # paypal
    if payment_method == "paypal":
        token = get_paypal_access_token()
        if not token:
            return Response({"success": 0, "error": "PayPal auth failed"}, status=500)

        response = requests.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "EUR",
                        "value": str(amount),
                    }
                }],
                "application_context": {
                    "return_url": "http://localhost:5173/paypal-success",
                    "cancel_url": "http://localhost:5173/placanje",
                    "user_action": "PAY_NOW"
                }
            }
        )

        if response.status_code != 201:
            return Response({"success": 0, "error": response.text}, status=500)

        data = response.json()

        payment = PlacanjeSetnje.objects.create(
            tipPlacanja=PAYMENT_TYPE_PAYPAL,
            cijenaSetnje=amount_cents,
            idRezervacije=reservation_id,
            idVlasnik=vlasnik.idVlasnik,
            idSetac=reservation.idSetac,
        )

        PaymentTracking.objects.create(
            payment=payment,
            payment_status=PAYMENT_STATUS_PENDING,
            transaction_id=data["id"],
            payment_method="paypal",
        )

        approval_url = next(
            link["href"] for link in data["links"] if link["rel"] == "approve"
        )

        return Response({
            "success": 1,
            "payment_id": payment.idPlacanja,
            "approval_url": approval_url,
        })

    # stripe
    if payment_method == "stripe":
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="eur",
        )

        payment = PlacanjeSetnje.objects.create(
            tipPlacanja=PAYMENT_TYPE_CARD,
            cijenaSetnje=amount_cents,
            idRezervacije=reservation_id,
            idVlasnik=vlasnik.idVlasnik,
            idSetac=reservation.idSetac,
        )

        PaymentTracking.objects.create(
            payment=payment,
            payment_status=PAYMENT_STATUS_PENDING,
            transaction_id=intent.id,
            payment_method="stripe",
        )

        return Response({
            "success": 1,
            "payment_id": payment.idPlacanja,
            "client_secret": intent.client_secret,
            "publishable_key": STRIPE_PUBLISHABLE_KEY,
        })

    # gotovina
    if payment_method == "cash":
        payment = PlacanjeSetnje.objects.create(
            tipPlacanja=PAYMENT_TYPE_CASH,
            cijenaSetnje=amount_cents,
            idRezervacije=reservation_id,
            idVlasnik=vlasnik.idVlasnik,
            idSetac=reservation.idSetac,
        )

        PaymentTracking.objects.create(
            payment=payment,
            payment_status=PAYMENT_STATUS_COMPLETED,
            transaction_id=f"CASH-{payment.idPlacanja}",
            payment_method="cash",
        )

        return Response({
            "success": 1,
            "payment_id": payment.idPlacanja,
        })

    return Response({"success": 0, "error": "Invalid payment method"}, status=400)



@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def confirm_paypal_payment(request):
    order_id = request.data.get("order_id")
    payment_id = request.data.get("payment_id")

    if not order_id or not payment_id:
        return Response({"error": "Missing order_id or payment_id"}, status=400)

    token = get_paypal_access_token()

    capture = requests.post(
        f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )

    if capture.status_code != 201:
        return Response({"error": "PayPal capture failed"}, status=400)

    tracking = PaymentTracking.objects.get(payment_id=payment_id)
    tracking.payment_status = PAYMENT_STATUS_COMPLETED
    tracking.save()

    return Response({"success": 1})


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def confirm_stripe_payment(request):
    payment_id = request.data.get("payment_id")

    if not payment_id:
        return Response({"error": "Missing payment_id"}, status=400)

    tracking = PaymentTracking.objects.get(payment_id=payment_id)
    intent = stripe.PaymentIntent.retrieve(tracking.transaction_id)

    if intent.status != "succeeded":
        return Response({"error": "Stripe payment not completed"}, status=400)

    with transaction.atomic():
        tracking.payment_status = PAYMENT_STATUS_COMPLETED
        tracking.save()

    return Response({"success": 1})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_payment_status(request, payment_id):
    payment = PlacanjeSetnje.objects.get(idPlacanja=payment_id)
    tracking = PaymentTracking.objects.get(payment=payment)

    return Response({
        "payment_id": payment.idPlacanja,
        "status": tracking.payment_status,
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_payments(request):
    vlasnik = get_current_vlasnik(request.user)
    payments = PlacanjeSetnje.objects.filter(idVlasnik=vlasnik.idVlasnik)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)
