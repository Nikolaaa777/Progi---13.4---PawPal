from rest_framework import serializers
from .models import Recenzija

class RecenzijaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recenzija
        fields = ['idRecenzije', 'idVlasnik', 'idSetac', 'ocjena'] # Only keep these 4
        read_only_fields = ['idRecenzije', 'idVlasnik']
        
    def validate_ocjena(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Ocjena mora biti između 1 i 5.")
        return value