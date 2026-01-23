from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Clanarina(models.Model):
    iznos = models.DecimalField(max_digits=8, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.iznos} EUR"


class MembershipSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="membership_subscription")
    # When the subscription was last activated/renewed (i.e., the start of the latest paid period).
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_active(self):
        return self.valid_until is not None and self.valid_until >= timezone.now()

    def __str__(self):
        vf = self.valid_from.isoformat() if self.valid_from else "None"
        vu = self.valid_until.isoformat() if self.valid_until else "None"
        return f"MembershipSubscription<{self.user.email}> valid_from={vf} valid_until={vu}"


MEMBERSHIP_PAYMENT_STATUS_PENDING = "pending"
MEMBERSHIP_PAYMENT_STATUS_COMPLETED = "completed"
MEMBERSHIP_PAYMENT_STATUS_FAILED = "failed"

MEMBERSHIP_PAYMENT_STATUS_CHOICES = [
    (MEMBERSHIP_PAYMENT_STATUS_PENDING, "Pending"),
    (MEMBERSHIP_PAYMENT_STATUS_COMPLETED, "Completed"),
    (MEMBERSHIP_PAYMENT_STATUS_FAILED, "Failed"),
]


class MembershipPayment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="membership_payments")
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    paypal_order_id = models.CharField(max_length=128, db_index=True)
    status = models.CharField(max_length=20, choices=MEMBERSHIP_PAYMENT_STATUS_CHOICES, default=MEMBERSHIP_PAYMENT_STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"MembershipPayment<{self.id}> user={self.user.email} amount={self.amount} status={self.status}"
