from rest_framework import serializers
from .models import Rezervacija
from dogs.models import Pas

class RezervacijaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rezervacija
        fields = ['idRezervacije', 'idVlasnik', 'idSetac', 'idPsa', 'potvrdeno', 'odradena']
        read_only_fields = ['idRezervacije']

    def validate(self, data):
        """
        Validate that the dog belongs to the owner making the reservation.
        """
        vlasnik_obj = self.context.get('vlasnik')
        pas_obj = data.get('idPsa')

        if not vlasnik_obj:
            raise serializers.ValidationError("Owner profile context is missing.") #


        if pas_obj.vlasnik.idVlasnik != vlasnik_obj.idVlasnik:
            raise serializers.ValidationError({
                "idPsa": "Ovaj pas ne pripada vama."
            })
        return data