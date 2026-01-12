from django.db import models
from accounts.models import Vlasnik


class Pas(models.Model):
    idPsa = models.BigAutoField(primary_key=True, db_column="idPsa")

    vlasnik = models.ForeignKey(
        Vlasnik,
        to_field="idVlasnik",
        db_column="idVlasnik",
        on_delete=models.DO_NOTHING,
        related_name="psi",
    )

    energijaPsa = models.CharField(max_length=20, null=True, blank=True, db_column="energijaPsa")
    zdravPas = models.CharField(max_length=20, null=True, blank=True, db_column="zdravPas")
    posPsa = models.CharField(max_length=20, null=True, blank=True, db_column="posPsa")
    socPsa = models.CharField(max_length=20, null=True, blank=True, db_column="socPsa")
    imePsa = models.CharField(max_length=20, null=True, blank=True, db_column="imePsa")
    starostPsa = models.BigIntegerField(null=True, blank=True, db_column="starostPsa")
    pasminaPsa = models.CharField(max_length=20, null=True, blank=True, db_column="pasminaPsa")

    class Meta:
        managed = False
        db_table = '"Pas"'

    def __str__(self):
        return f"Pas<{self.idPsa}> {self.imePsa}"
