from rest_framework import serializers
from datetime import timedelta
from .models import Setnja
from accounts.models import Setac
from reservations.models import Rezervacija


class SetnjaSerializer(serializers.ModelSerializer):
    walker_name = serializers.SerializerMethodField()
    walker_email = serializers.SerializerMethodField()
    is_reserved = serializers.SerializerMethodField()
    
    class Meta:
        model = Setnja
        fields = [
            "idSetnje",
            "terminSetnje",
            "tipSetnje",
            "cijenaSetnje",
            "trajanjeSetnje",
            "idSetac",
            "walker_name",
            "walker_email",
            "is_reserved",
        ]
        read_only_fields = ["idSetnje","idSetac", "walker_name", "walker_email", "is_reserved"]
    
    def validate_trajanjeSetnje(self, value):
        """Convert string duration to timedelta if needed"""
        if isinstance(value, str):
            # Parse HH:MM:SS format
            try:
                parts = value.split(':')
                if len(parts) == 3:
                    hours = int(parts[0])
                    minutes = int(parts[1])
                    seconds = int(parts[2])
                    return timedelta(hours=hours, minutes=minutes, seconds=seconds)
            except (ValueError, IndexError):
                pass
        return value
    
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
    
    def get_is_reserved(self, obj):
        # Check if there's a confirmed or pending reservation for this walk
        return Rezervacija.objects.filter(
            idSetac=obj.idSetac,
            potvrdeno__isnull=False
        ).exists()
    
    def to_representation(self, instance):
        """Override to convert cijenaSetnje from cents to decimal"""
        data = super().to_representation(instance)
        if data.get('cijenaSetnje') is not None:
            # Convert from cents (stored as bigint) to decimal
            try:
                # If it's already a float (from previous conversion), don't convert again
                if isinstance(data['cijenaSetnje'], (int, str)):
                    data['cijenaSetnje'] = float(data['cijenaSetnje']) / 100.0
            except (ValueError, TypeError):
                data['cijenaSetnje'] = None
        return data
