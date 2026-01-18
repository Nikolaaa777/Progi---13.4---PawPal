import os
import requests
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from accounts.authentication import CsrfExemptSessionAuthentication
from accounts.models import Vlasnik
from accounts.domain_sync import ensure_vlasnik_row
from dogs.utils import get_current_vlasnik
from reservations.models import Rezervacija
from .models import (
    PlacanjeSetnje, 
    PaymentTracking,
    PAYMENT_TYPE_PAYPAL, 
    PAYMENT_TYPE_CARD, 
    PAYMENT_STATUS_PENDING, 
    PAYMENT_STATUS_COMPLETED, 
    PAYMENT_STATUS_FAILED
)
from .serializers import PaymentSerializer, CreatePaymentIntentSerializer, ConfirmPaymentSerializer


# PayPal Configuration
PAYPAL_CLIENT_ID = os.getenv('PAYPAL_CLIENT_ID', '')
PAYPAL_CLIENT_SECRET = os.getenv('PAYPAL_CLIENT_SECRET', '')
PAYPAL_MODE = os.getenv('PAYPAL_MODE', 'sandbox')  # 'sandbox' or 'live'
PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com' if PAYPAL_MODE == 'sandbox' else 'https://api-m.paypal.com'

# Stripe Configuration
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', '')


def get_paypal_access_token():
    """Get PayPal access token"""
    url = f"{PAYPAL_BASE_URL}/v1/oauth2/token"
    headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
    }
    data = {
        'grant_type': 'client_credentials'
    }
    response = requests.post(
        url,
        headers=headers,
        data=data,
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    )
    if response.status_code == 200:
        return response.json().get('access_token')
    return None


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create a payment intent for PayPal or Stripe"""
    serializer = CreatePaymentIntentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"success": 0, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    reservation_id = serializer.validated_data['reservation_id']
    amount = serializer.validated_data['amount']
    payment_method = serializer.validated_data['payment_method']
    
    # Get current user's vlasnik ID
    vlasnik = get_current_vlasnik(request.user)
    
    # Get reservation to extract setac_id
    try:
        reservation = Rezervacija.objects.get(idRezervacije=reservation_id, idVlasnik=vlasnik.idVlasnik)
        setac_id = reservation.idSetac
    except Rezervacija.DoesNotExist:
        return Response(
            {"success": 0, "error": "Reservation not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if payment_method == 'paypal':
        # Create PayPal order
        access_token = get_paypal_access_token()
        if not access_token:
            return Response(
                {"success": 0, "error": "Failed to authenticate with PayPal"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        url = f"{PAYPAL_BASE_URL}/v2/checkout/orders"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}',
        }
        data = {
            'intent': 'CAPTURE',
            'purchase_units': [{
                'amount': {
                    'currency_code': 'USD',
                    'value': str(amount)
                },
                'description': f'Payment for reservation {reservation_id}'
            }],
            'application_context': {
                'return_url': f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/payment-success?token={{token}}",
                'cancel_url': f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/payment-cancelled",
            }
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 201:
            order_data = response.json()
            order_id = order_data['id']
            
            # Create payment record
            # Note: cijenaSetnje is bigint in DB, so we'll store amount as integer (cents)
            payment = PlacanjeSetnje.objects.create(
                tipPlacanja=PAYMENT_TYPE_PAYPAL,
                cijenaSetnje=int(float(amount) * 100),  # Convert to cents
                idRezervacije=reservation_id,
                idVlasnik=vlasnik.idVlasnik,
                idSetac=setac_id,
            )
            
            # Create tracking record
            PaymentTracking.objects.create(
                payment=payment,
                payment_status=PAYMENT_STATUS_PENDING,
                transaction_id=order_id,
                payment_method='paypal'
            )
            
            # Get approval URL
            approval_url = None
            for link in order_data.get('links', []):
                if link.get('rel') == 'approve':
                    approval_url = link.get('href')
                    break
            
            return Response({
                "success": 1,
                "payment_id": payment.idPlacanja,
                "order_id": order_id,
                "approval_url": approval_url,
                "payment_method": "paypal",
                "return_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/payment-success?token={order_id}&payment_id={payment.idPlacanja}"
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {"success": 0, "error": "Failed to create PayPal order", "details": response.text},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif payment_method == 'stripe':
        # Create Stripe payment intent
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        
        if not stripe.api_key:
            return Response(
                {"success": 0, "error": "Stripe not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(float(amount) * 100),  # Convert to cents
                currency='usd',
                metadata={
                    'reservation_id': reservation_id,
                    'user_id': request.user.id,
                }
            )
            
            # Create payment record
            payment = PlacanjeSetnje.objects.create(
                tipPlacanja=PAYMENT_TYPE_CARD,
                cijenaSetnje=int(float(amount) * 100),  # Convert to cents
                idRezervacije=reservation_id,
                idVlasnik=vlasnik.idVlasnik,
                idSetac=setac_id,
            )
            
            # Create tracking record
            PaymentTracking.objects.create(
                payment=payment,
                payment_status=PAYMENT_STATUS_PENDING,
                transaction_id=intent.id,
                payment_method='stripe'
            )
            
            return Response({
                "success": 1,
                "payment_id": payment.idPlacanja,
                "client_secret": intent.client_secret,
                "publishable_key": STRIPE_PUBLISHABLE_KEY,
                "payment_method": "stripe"
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"success": 0, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(
        {"success": 0, "error": "Invalid payment method"},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def confirm_paypal_payment(request):
    """Confirm PayPal payment after user approval"""
    order_id = request.data.get('order_id')
    payment_id = request.data.get('payment_id')
    
    if not order_id or not payment_id:
        return Response(
            {"success": 0, "error": "Missing order_id or payment_id"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get payment record
    try:
        payment = PlacanjeSetnje.objects.get(idPlacanja=payment_id)
        tracking = payment.tracking
        if tracking.transaction_id != order_id:
            return Response(
                {"success": 0, "error": "Payment ID mismatch"},
                status=status.HTTP_400_BAD_REQUEST
            )
    except PlacanjeSetnje.DoesNotExist:
        return Response(
            {"success": 0, "error": "Payment not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except PaymentTracking.DoesNotExist:
        return Response(
            {"success": 0, "error": "Payment not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Capture PayPal order
    access_token = get_paypal_access_token()
    if not access_token:
        return Response(
            {"success": 0, "error": "Failed to authenticate with PayPal"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    url = f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {access_token}',
    }
    
    response = requests.post(url, headers=headers, json={})
    
    if response.status_code == 201:
        capture_data = response.json()
        if capture_data.get('status') == 'COMPLETED':
            tracking.payment_status = PAYMENT_STATUS_COMPLETED
            tracking.save()
            
            return Response({
                "success": 1,
                "message": "Payment completed successfully",
                "payment": PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)
        else:
            tracking.payment_status = PAYMENT_STATUS_FAILED
            tracking.save()
            return Response(
                {"success": 0, "error": "Payment not completed", "details": capture_data},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        tracking.payment_status = PAYMENT_STATUS_FAILED
        tracking.save()
        return Response(
            {"success": 0, "error": "Failed to capture payment", "details": response.text},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def confirm_stripe_payment(request):
    """Confirm Stripe payment after card processing"""
    payment_intent_id = request.data.get('payment_intent_id')
    payment_id = request.data.get('payment_id')
    
    if not payment_intent_id or not payment_id:
        return Response(
            {"success": 0, "error": "Missing payment_intent_id or payment_id"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get payment record
    try:
        payment = PlacanjeSetnje.objects.get(idPlacanja=payment_id)
        tracking = payment.tracking
        if tracking.transaction_id != payment_intent_id:
            return Response(
                {"success": 0, "error": "Payment ID mismatch"},
                status=status.HTTP_400_BAD_REQUEST
            )
    except PlacanjeSetnje.DoesNotExist:
        return Response(
            {"success": 0, "error": "Payment not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except PaymentTracking.DoesNotExist:
        return Response(
            {"success": 0, "error": "Payment not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Verify payment with Stripe
    import stripe
    stripe.api_key = STRIPE_SECRET_KEY
    
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            tracking.payment_status = PAYMENT_STATUS_COMPLETED
            tracking.save()
            
            return Response({
                "success": 1,
                "message": "Payment completed successfully",
                "payment": PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)
        else:
            tracking.payment_status = PAYMENT_STATUS_FAILED
            tracking.save()
            return Response(
                {"success": 0, "error": f"Payment not succeeded. Status: {intent.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        tracking.payment_status = PAYMENT_STATUS_FAILED
        tracking.save()
        return Response(
            {"success": 0, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_payment_status(request, payment_id):
    """Get payment status"""
    try:
        payment = PlacanjeSetnje.objects.get(idPlacanja=payment_id)
        return Response({
            "success": 1,
            "payment": PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)
    except PlacanjeSetnje.DoesNotExist:
        return Response(
            {"success": 0, "error": "Payment not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_user_payments(request):
    """Get all payments for the current user"""
    vlasnik = get_current_vlasnik(request.user)
    # Order by tracking's created_at if available, otherwise by payment ID (descending for newest first)
    payments = PlacanjeSetnje.objects.filter(idVlasnik=vlasnik.idVlasnik).select_related('tracking').order_by('-tracking__created_at', '-idPlacanja')
    return Response({
        "success": 1,
        "payments": PaymentSerializer(payments, many=True).data
    }, status=status.HTTP_200_OK)
