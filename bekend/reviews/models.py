from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from accounts.models import Vlasnik, Setac

class Recenzija(models.Model):
    idRecenzije = models.AutoField(primary_key=True)
    idVlasnik = models.ForeignKey(Vlasnik, on_delete=models.CASCADE, db_column='idVlasnik')
    idSetac = models.ForeignKey(Setac, on_delete=models.CASCADE, db_column='idSetac')
    ocjena = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    class Meta:
        db_table = 'Recenzija'