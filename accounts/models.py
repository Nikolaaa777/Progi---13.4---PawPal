from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    is_walker = models.BooleanField(default=False)  # True=šetač pasa, False=vlasnik
    has_notifications_on = models.BooleanField(default=False)  #da li je pretplaćen na obavijesti

    def __str__(self):
        return f"{self.user.email} | walker={self.is_walker} | notif={self.has_notifications_on}"
    
