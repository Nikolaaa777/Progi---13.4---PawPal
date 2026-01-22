from django.db import models


class Rezervacija(models.Model):
    """Reservation model mapped to Rezervacija table"""
    idRezervacije = models.BigAutoField(primary_key=True, db_column="idRezervacije")
    idVlasnik = models.BigIntegerField(db_column="idVlasnik")
    idSetac = models.BigIntegerField(db_column="idSetac")
    idPsa = models.BigIntegerField(db_column="idPsa")
    potvrdeno = models.BooleanField(null=True, blank=True, db_column="potvrdeno")
    odradena = models.BooleanField(null=True, blank=True, db_column="odradena")
    gradSetnje = models.CharField(max_length=20, null=True, blank=True, db_column="gradSetnje") # Dodano polje
    idSetnje = models.BigIntegerField(null=True, blank=True, db_column="idSetnje")


    class Meta:
        managed = False
        db_table = '"Rezervacija"'

    def __str__(self):
        return f"Rezervacija<{self.idRezervacije}> vlasnik={self.idVlasnik} setac={self.idSetac}"
