from django.urls import path
from . import views

urlpatterns = [
    path('payments/create/', views.create_payment_intent, name='create_payment_intent'),
    path("payments/paypal/confirm/", views.confirm_paypal_payment),
    path('payments/stripe/confirm/', views.confirm_stripe_payment, name='confirm_stripe_payment'),
    path('payments/<int:payment_id>/', views.get_payment_status, name='get_payment_status'),
    path('payments/user/', views.get_user_payments, name='get_user_payments'),
]
