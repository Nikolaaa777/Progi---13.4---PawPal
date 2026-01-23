from django.db import models

class Clanarina(models.Model):
    iznos = models.DecimalField(max_digits=8, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.iznos} EUR"