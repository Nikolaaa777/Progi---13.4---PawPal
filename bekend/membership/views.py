import os
import requests
from datetime import timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.authentication import CsrfExemptSessionAuthentication
from .models import (
    Clanarina,
    MembershipSubscription,
    MembershipPayment,
    MEMBERSHIP_PAYMENT_STATUS_PENDING,
    MEMBERSHIP_PAYMENT_STATUS_COMPLETED,
    MEMBERSHIP_PAYMENT_STATUS_FAILED,
)

# PayPal Configuration (isto kao u payments app)
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")  # 'sandbox' or 'live'
PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com" if PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com"


def get_paypal_access_token():
    url = f"{PAYPAL_BASE_URL}/v1/oauth2/token"
    headers = {"Accept": "application/json", "Accept-Language": "en_US"}
    data = {"grant_type": "client_credentials"}
    r = requests.post(url, headers=headers, data=data, auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET), timeout=20)
    if r.status_code == 200:
        return r.json().get("access_token")
    return None


def create_paypal_order(amount: Decimal, return_url: str, cancel_url: str):
    token = get_paypal_access_token()
    if not token:
        return None, "Failed to get PayPal access token"

    url = f"{PAYPAL_BASE_URL}/v2/checkout/orders"
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {"currency_code": "EUR", "value": str(amount)},
                "description": "PawPal membership payment",
            }
        ],
        "application_context": {
            "return_url": return_url,
            "cancel_url": cancel_url,
        },
    }

    r = requests.post(url, headers=headers, json=payload, timeout=20)
    if r.status_code in (200, 201):
        return r.json(), None
    return None, r.text


def capture_paypal_order(order_id: str):
    token = get_paypal_access_token()
    if not token:
        return None, "Failed to get PayPal access token"

    url = f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture"
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    r = requests.post(url, headers=headers, timeout=20)
    if r.status_code in (200, 201):
        return r.json(), None
    return None, r.text


def get_current_fee_amount():
    fee = Clanarina.objects.order_by("-updated_at").first()
    if not fee:
        fee = Clanarina.objects.create(iznos=Decimal("0.00"))
    return fee.iznos


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_membership_fee(request):
    amount = get_current_fee_amount()
    fee = Clanarina.objects.order_by("-updated_at").first()
    return Response(
        {"iznos": str(amount), "updated_at": fee.updated_at.isoformat() if fee else None},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_membership_status(request):
    sub = MembershipSubscription.objects.filter(user=request.user).first()
    if not sub or sub.valid_until is None:
        return Response({"is_active": False, "valid_until": None}, status=status.HTTP_200_OK)

    return Response(
        {"is_active": sub.valid_until >= timezone.now(), "valid_until": sub.valid_until.isoformat()},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_membership_paypal_payment(request):
    amount = get_current_fee_amount()

    # return_url uključuje payment_id, token će PayPal zamijeniti
    frontend = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

    # payment_id još nemamo dok ne napravimo local record -> napravimo prvo order pa record
    # ali nama treba payment_id u return_url -> zato radimo:
    # 1) kreiraj local placeholder record s dummy order_id pa updateaj
    with transaction.atomic():
        placeholder = MembershipPayment.objects.create(
            user=request.user,
            amount=amount,
            paypal_order_id="PENDING",
            status=MEMBERSHIP_PAYMENT_STATUS_PENDING,
        )

        return_url = f"{frontend}/profile/clanarina?membership_payment_id={placeholder.id}&token={{token}}"
        cancel_url = f"{frontend}/profile/clanarina?cancelled=1"

        order_data, err = create_paypal_order(amount, return_url, cancel_url)
        if err:
            placeholder.status = MEMBERSHIP_PAYMENT_STATUS_FAILED
            placeholder.save(update_fields=["status"])
            return Response({"success": 0, "error": err}, status=status.HTTP_400_BAD_REQUEST)

        order_id = order_data.get("id")
        placeholder.paypal_order_id = order_id
        placeholder.save(update_fields=["paypal_order_id"])

    approval_url = None
    for link in order_data.get("links", []):
        if link.get("rel") == "approve":
            approval_url = link.get("href")
            break

    return Response(
        {
            "success": 1,
            "membership_payment_id": placeholder.id,
            "order_id": order_id,
            "approval_url": approval_url,
            "amount": str(amount),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def confirm_membership_paypal_payment(request):
    token = request.data.get("token")  # PayPal order_id
    membership_payment_id = request.data.get("membership_payment_id")

    if not token or not membership_payment_id:
        return Response(
            {"success": 0, "error": "Missing token or membership_payment_id"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        membership_payment_id = int(membership_payment_id)
    except (TypeError, ValueError):
        return Response({"success": 0, "error": "Invalid membership_payment_id"}, status=status.HTTP_400_BAD_REQUEST)

    payment = MembershipPayment.objects.filter(id=membership_payment_id, user=request.user).first()
    if not payment:
        return Response({"success": 0, "error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

    if payment.status == MEMBERSHIP_PAYMENT_STATUS_COMPLETED:
        sub = MembershipSubscription.objects.filter(user=request.user).first()
        return Response(
            {
                "success": 1,
                "message": "Already confirmed",
                "is_active": sub.valid_until >= timezone.now() if sub and sub.valid_until else False,
                "valid_until": sub.valid_until.isoformat() if sub and sub.valid_until else None,
            },
            status=status.HTTP_200_OK,
        )

    # Capture order
    capture_data, err = capture_paypal_order(token)
    if err:
        payment.status = MEMBERSHIP_PAYMENT_STATUS_FAILED
        payment.save(update_fields=["status"])
        return Response({"success": 0, "error": err}, status=status.HTTP_400_BAD_REQUEST)

    if capture_data.get("status") != "COMPLETED":
        payment.status = MEMBERSHIP_PAYMENT_STATUS_FAILED
        payment.save(update_fields=["status"])
        return Response({"success": 0, "error": "PayPal capture not completed"}, status=status.HTTP_400_BAD_REQUEST)

    # Activate/extend subscription by 30 days
    with transaction.atomic():
        now = timezone.now()
        sub, _ = MembershipSubscription.objects.get_or_create(user=request.user)

        base = sub.valid_until if (sub.valid_until and sub.valid_until > now) else now
        sub.valid_until = base + timedelta(days=30)
        sub.save(update_fields=["valid_until", "updated_at"])

        payment.status = MEMBERSHIP_PAYMENT_STATUS_COMPLETED
        payment.completed_at = now
        payment.save(update_fields=["status", "completed_at"])

    return Response(
        {
            "success": 1,
            "message": "Membership activated",
            "valid_until": sub.valid_until.isoformat(),
            "is_active": True,
        },
        status=status.HTTP_200_OK,
    )
