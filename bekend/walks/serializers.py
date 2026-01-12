from rest_framework import serializers
from .models import Setnja


class SetnjaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setnja
        fields = [
            "idSetnje",
            "terminSetnje",
            "tipSetnje",
            "cijenaSetnje",
            "trajanjeSetnje",
            "idSetac",
        ]
        read_only_fields = ["idSetnje","idSetac"]
