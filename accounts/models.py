from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    is_walker = models.BooleanField(default=False)  # True=šetač pasa, False=vlasnik

    def __str__(self):
        return f"{self.user.email} | walker={self.is_walker}"