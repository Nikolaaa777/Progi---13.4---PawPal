from django.db import models


class Setnja(models.Model):
    idSetnje = models.BigAutoField(primary_key=True, db_column="idSetnje")

    terminSetnje = models.DateTimeField(null=True, blank=True, db_column="terminSetnje")
    idSetac = models.BigIntegerField(db_column="idSetac")

    tipSetnje = models.BigIntegerField(null=True, blank=True, db_column="tipSetnje")
    cijenaSetnje = models.BigIntegerField(null=True, blank=True, db_column="cijenaSetnje")

    trajanjeSetnje = models.DurationField(null=True, blank=True, db_column="trajanjeSetnje")

    class Meta:
        managed = False
        db_table = '"Setnja"'

    def __str__(self):
        return f"Setnja<{self.idSetnje}> setac={self.idSetac}"
