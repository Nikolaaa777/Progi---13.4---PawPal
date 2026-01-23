from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    is_walker = models.BooleanField(default=False)  # True=šetač pasa, False=vlasnik
    has_notifications_on = models.BooleanField(default=False)  # da li je pretplaćen na obavijesti
    city = models.CharField(max_length=20, blank=True, default="")

    def __str__(self):
        return f"{self.user.email} | walker={self.is_walker} | notif={self.has_notifications_on}"
    
    

class Vlasnik(models.Model):
    idVlasnik = models.BigAutoField(primary_key=True, db_column="idVlasnik")
    emailVlasnik = models.CharField(max_length=50, db_column="emailVlasnik")
    telefonVlasnik = models.CharField(max_length=15, null=True, blank=True, db_column="telefonVlasnik")
    idPretplate = models.BigIntegerField(null=True, blank=True, db_column="idPretplate")
    imeVlasnik = models.CharField(max_length=20, null=True, blank=True, db_column="imeVlasnik")
    prezimeVlasnik = models.CharField(max_length=20, null=True, blank=True, db_column="prezimeVlasnik")
    class Meta:
        managed = True
        db_table = '"Vlasnik"'

    def __str__(self):
        return f"Vlasnik<{self.idVlasnik}> {self.emailVlasnik}"
    


class Setac(models.Model):
    idSetac = models.BigAutoField(primary_key=True, db_column="idSetac")

    avgOcjena = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True, db_column="avgOcjena"
    )
    imeSetac = models.CharField(max_length=20, null=True, blank=True, db_column="imeSetac")
    prezimeSetac = models.CharField(max_length=20, null=True, blank=True, db_column="prezimeSetac")
    telefonSetac = models.CharField(max_length=15, null=True, blank=True, db_column="telefonSetac")

    gradSetac = models.CharField(max_length=20, null=True, blank=True, db_column="gradSetac")

    usernameSetac = models.CharField(max_length=20, db_column="usernameSetac")
    emailSetac = models.CharField(max_length=50, db_column="emailSetac")

    datRegSetac = models.DateField(null=True, blank=True, db_column="datRegSetac")
    idClanarine = models.BigIntegerField(null=True, blank=True, db_column="idClanarine")
    idProfilne = models.BigIntegerField(null=True, blank=True, db_column="idProfilne")

    class Meta:
        managed = True
        db_table = '"Setac"'

    def __str__(self):
        return f"Setac<{self.idSetac}> {self.usernameSetac}"


class WalkerRegistrationEvent(models.Model):
    """Tracks when a new walker registers for notification purposes"""
    walker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="registration_events")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Walker registration: {self.walker.email} at {self.created_at}"



#AUTOMATSKA KREACIJA PROFILE-A ZA SVAKI NOVI USER
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


