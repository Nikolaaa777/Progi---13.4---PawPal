from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from .domain_sync import ensure_vlasnik_row

@receiver(user_signed_up)
def on_allauth_user_signed_up(request, user, **kwargs):
    ensure_vlasnik_row(user)
