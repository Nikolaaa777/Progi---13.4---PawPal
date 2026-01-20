from django.db import models
from django.contrib.auth.models import User

# Payment types: 1 = PayPal, 2 = Card (Stripe)
PAYMENT_TYPE_PAYPAL = 1
PAYMENT_TYPE_CARD = 2

PAYMENT_STATUS_PENDING = 'pending'
PAYMENT_STATUS_COMPLETED = 'completed'
PAYMENT_STATUS_FAILED = 'failed'
PAYMENT_STATUS_CANCELLED = 'cancelled'


class PlacanjeSetnje(models.Model):
    """Payment model mapped to PlacanjeSetnje table
    
    Note: This model uses managed=False, so it maps to an existing database table.
    Additional tracking fields (payment_status, payment_id, etc.) are stored
    in a separate PaymentTracking model or can be added via migration.
    """
    idPlacanja = models.BigAutoField(primary_key=True, db_column="idPlacanja")
    
    tipPlacanja = models.BigIntegerField(db_column="tipPlacanja")  # 1 = PayPal, 2 = Card
    cijenaSetnje = models.BigIntegerField(db_column="cijenaSetnje")  # Note: DB uses bigint, store as cents or use Decimal in app
    idRezervacije = models.BigIntegerField(db_column="idRezervacije")
    idVlasnik = models.BigIntegerField(db_column="idVlasnik")
    idSetac = models.BigIntegerField(db_column="idSetac")
    
    class Meta:
        managed = True
        db_table = "PlacanjeSetnje"
    
    def __str__(self):
        return f"Payment<{self.idPlacanja}> type={self.tipPlacanja} amount={self.cijenaSetnje}"


class PaymentTracking(models.Model):
    """Additional payment tracking information stored separately"""
    payment = models.OneToOneField(
        PlacanjeSetnje, 
        on_delete=models.CASCADE, 
        related_name='tracking',
        primary_key=True,
        db_column='idPlacanja'
    )
    payment_status = models.CharField(
        max_length=20, 
        default=PAYMENT_STATUS_PENDING,
        choices=[
            (PAYMENT_STATUS_PENDING, 'Pending'),
            (PAYMENT_STATUS_COMPLETED, 'Completed'),
            (PAYMENT_STATUS_FAILED, 'Failed'),
            (PAYMENT_STATUS_CANCELLED, 'Cancelled'),
        ]
    )
    transaction_id = models.CharField(max_length=255, null=True, blank=True)  # PayPal/Stripe transaction ID
    payment_method = models.CharField(max_length=50, null=True, blank=True)  # 'paypal' or 'stripe'
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_tracking'  # New table for tracking
    
    def __str__(self):
        return f"Tracking<{self.payment.idPlacanja}> {self.payment_method} - {self.payment_status}"
