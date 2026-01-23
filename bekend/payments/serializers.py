from rest_framework import serializers
from .models import PlacanjeSetnje, PaymentTracking, PAYMENT_TYPE_PAYPAL, PAYMENT_TYPE_CARD, PAYMENT_TYPE_CASH


class PaymentSerializer(serializers.ModelSerializer):
    payment_status = serializers.SerializerMethodField()
    payment_id = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    cijenaSetnje = serializers.SerializerMethodField()  # Convert from cents to decimal
    
    class Meta:
        model = PlacanjeSetnje
        fields = [
            'idPlacanja',
            'tipPlacanja',
            'cijenaSetnje',
            'idRezervacije',
            'idVlasnik',
            'idSetac',
            'payment_status',
            'payment_id',
            'payment_method',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['idPlacanja']
    
    def get_payment_status(self, obj):
        try:
            return obj.tracking.payment_status
        except PaymentTracking.DoesNotExist:
            return None
    
    def get_payment_id(self, obj):
        try:
            return obj.tracking.transaction_id
        except PaymentTracking.DoesNotExist:
            return None
    
    def get_payment_method(self, obj):
        try:
            return obj.tracking.payment_method
        except PaymentTracking.DoesNotExist:
            return None
    
    def get_created_at(self, obj):
        try:
            return obj.tracking.created_at
        except PaymentTracking.DoesNotExist:
            return None
    
    def get_updated_at(self, obj):
        try:
            return obj.tracking.updated_at
        except PaymentTracking.DoesNotExist:
            return None
    
    def get_cijenaSetnje(self, obj):
        # Convert from cents (stored as bigint) to decimal
        return float(obj.cijenaSetnje) / 100.0


class CreatePaymentIntentSerializer(serializers.Serializer):
    """Serializer for creating a payment intent"""
    reservation_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=['paypal', 'stripe', 'cash'])


class ConfirmPaymentSerializer(serializers.Serializer):
    """Serializer for confirming a payment"""
    payment_id = serializers.CharField()
    reservation_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['paypal', 'stripe'])
