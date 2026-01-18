from rest_framework import serializers
from .models import Pas


class PasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pas
        fields = [
            "idPsa",
            "imePsa",
            "starostPsa",
            "pasminaPsa",
            "energijaPsa",
            "zdravPas",
            "posPsa",
            "socPsa",
        ]
        read_only_fields = ["idPsa"]
