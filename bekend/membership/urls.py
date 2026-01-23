from django.urls import path
from . import views

urlpatterns = [
    path("membership/fee/", views.get_membership_fee, name="get_membership_fee"),
    path("membership/status/", views.get_membership_status, name="get_membership_status"),
    path("membership/paypal/create/", views.create_membership_paypal_payment, name="create_membership_paypal_payment"),
    path("membership/paypal/confirm/", views.confirm_membership_paypal_payment, name="confirm_membership_paypal_payment"),
]
