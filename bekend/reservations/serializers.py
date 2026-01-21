from rest_framework import serializers
from .models import Rezervacija
from dogs.models import Pas
from accounts.models import Vlasnik, Setac
from walks.models import Setnja


class RezervacijaSerializer(serializers.ModelSerializer):
    dog_name = serializers.SerializerMethodField()
    walker_name = serializers.SerializerMethodField()
    walker_email = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    walk_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Rezervacija
        fields = [
            'idRezervacije', 
            'idVlasnik', 
            'idSetac', 
            'idPsa', 
            'potvrdeno', 
            'odradena',
            'dog_name',
            'walker_name',
            'walker_email',
            'owner_name',
            'walk_details',
        ]
        read_only_fields = ['idRezervacije', 'idVlasnik']
        extra_kwargs = {
            'idVlasnik': {'required': False},
        }

    def get_dog_name(self, obj):
        try:
            pas = Pas.objects.get(idPsa=obj.idPsa)
            return pas.imePsa
        except Pas.DoesNotExist:
            return f"Dog ID: {obj.idPsa}"

    def get_walker_name(self, obj):
        try:
            setac = Setac.objects.get(idSetac=obj.idSetac)
            if setac.imeSetac and setac.prezimeSetac:
                return f"{setac.imeSetac} {setac.prezimeSetac}"
            return setac.usernameSetac or setac.emailSetac
        except Setac.DoesNotExist:
            return "Unknown"

    def get_walker_email(self, obj):
        try:
            setac = Setac.objects.get(idSetac=obj.idSetac)
            return setac.emailSetac
        except Setac.DoesNotExist:
            return None

    def get_owner_name(self, obj):
        try:
            vlasnik = Vlasnik.objects.get(idVlasnik=obj.idVlasnik)
            if vlasnik.imeVlasnik and vlasnik.prezimeVlasnik:
                return f"{vlasnik.imeVlasnik} {vlasnik.prezimeVlasnik}"
            return vlasnik.emailVlasnik
        except Vlasnik.DoesNotExist:
            return "Unknown"

    def get_walk_details(self, obj):
        # Try to find a walk (Setnja) for this walker
        try:
            walk = Setnja.objects.filter(idSetac=obj.idSetac).first()
            if walk:
                return {
                    'idSetnje': walk.idSetnje,
                    'terminSetnje': walk.terminSetnje,
                    'cijenaSetnje': float(walk.cijenaSetnje) / 100.0 if walk.cijenaSetnje else None,
                    'trajanjeSetnje': str(walk.trajanjeSetnje) if walk.trajanjeSetnje else None,
                    'tipSetnje': walk.tipSetnje,
                }
        except:
            pass
        return None

    def validate(self, data):
        """
        Validate that the dog belongs to the owner making the reservation.
        """
        vlasnik_obj = self.context.get('vlasnik')
        pas_value = data.get('idPsa')

        if not vlasnik_obj:
            raise serializers.ValidationError("Owner profile context is missing.")

        # idVlasnik is read-only and comes from context, so remove it from validation if present
        data.pop('idVlasnik', None)

        # Handle both Pas object and integer ID
        if isinstance(pas_value, Pas):
            pas_obj = pas_value
        elif isinstance(pas_value, (int, str)):
            try:
                pas_id = int(pas_value)
                pas_obj = Pas.objects.get(idPsa=pas_id)
            except (ValueError, Pas.DoesNotExist):
                raise serializers.ValidationError({
                    "idPsa": "Pas nije pronađen."
                })
        else:
            raise serializers.ValidationError({
                "idPsa": "Nevažeći format ID psa."
            })

        # Check if dog belongs to the owner
        if pas_obj.vlasnik and pas_obj.vlasnik.idVlasnik != vlasnik_obj.idVlasnik:
            raise serializers.ValidationError({
                "idPsa": "Ovaj pas ne pripada vama."
            })
        
        # Replace Pas object with ID for saving
        data['idPsa'] = pas_obj.idPsa
        return data
    
    def create(self, validated_data):
        """
        Create a new reservation with integer IDs.
        """
        # Get vlasnik from context or kwargs
        vlasnik = self.context.get('vlasnik')
        if not vlasnik:
            # Try to get from validated_data if passed as kwarg
            vlasnik = validated_data.pop('idVlasnik', None)
        
        if not vlasnik:
            raise serializers.ValidationError("Owner (vlasnik) is required.")
        
        # Extract integer IDs
        idVlasnik = vlasnik.idVlasnik if hasattr(vlasnik, 'idVlasnik') else vlasnik
        idSetac = validated_data.get('idSetac')
        idPsa = validated_data.get('idPsa')
        
        # Create reservation with integer IDs
        reservation = Rezervacija.objects.create(
            idVlasnik=idVlasnik,
            idSetac=idSetac,
            idPsa=idPsa,
            potvrdeno=None,  # Pending
            odradena=False
        )
        
        return reservation