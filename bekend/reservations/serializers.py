from rest_framework import serializers
from .models import Rezervacija
from dogs.models import Pas
from accounts.models import Vlasnik, Setac
from walks.models import Setnja


class RezervacijaSerializer(serializers.ModelSerializer):
    # alias for frontend
    city = serializers.CharField(
        source="gradSetnje",
        required=False,
        allow_null=True,
        allow_blank=True
    )

    dog_name = serializers.SerializerMethodField()
    walker_name = serializers.SerializerMethodField()
    walker_email = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    walk_details = serializers.SerializerMethodField()

    class Meta:
        model = Rezervacija
        fields = [
            "idRezervacije",
            "idVlasnik",
            "idSetac",
            "idSetnje",
            "idPsa",
            "gradSetnje",
            "city",
            "potvrdeno",
            "odradena",
            "dog_name",
            "walker_name",
            "walker_email",
            "owner_name",
            "walk_details",
        ]
        read_only_fields = ["idRezervacije", "idVlasnik"]

    # ---------- READ HELPERS ----------

    def get_dog_name(self, obj):
        try:
            return Pas.objects.get(idPsa=obj.idPsa).imePsa
        except Pas.DoesNotExist:
            return None

    def get_walker_name(self, obj):
        try:
            s = Setac.objects.get(idSetac=obj.idSetac)
            if s.imeSetac and s.prezimeSetac:
                return f"{s.imeSetac} {s.prezimeSetac}"
            return s.usernameSetac or s.emailSetac
        except Setac.DoesNotExist:
            return None

    def get_walker_email(self, obj):
        try:
            return Setac.objects.get(idSetac=obj.idSetac).emailSetac
        except Setac.DoesNotExist:
            return None

    def get_owner_name(self, obj):
        try:
            v = Vlasnik.objects.get(idVlasnik=obj.idVlasnik)
            if v.imeVlasnik and v.prezimeVlasnik:
                return f"{v.imeVlasnik} {v.prezimeVlasnik}"
            return v.emailVlasnik
        except Vlasnik.DoesNotExist:
            return None

    def get_walk_details(self, obj):
        if not getattr(obj, "idSetnje", None):
            return None
        walk = Setnja.objects.filter(idSetnje=obj.idSetnje).first()
        if not walk:
            return None

        return {
            "idSetnje": walk.idSetnje,
            "terminSetnje": walk.terminSetnje,
            "cijenaSetnje": float(walk.cijenaSetnje) / 100 if walk.cijenaSetnje else None,
            "trajanjeSetnje": str(walk.trajanjeSetnje) if walk.trajanjeSetnje else None,
            "tipSetnje": walk.tipSetnje,
            "city": walk.gradSetnje,
        }

    # ---------- VALIDATION ----------

    def validate(self, data):
        vlasnik = self.context.get("vlasnik")
        if not vlasnik:
            raise serializers.ValidationError("Owner context missing.")

        pas_id = data.get("idPsa")
        try:
            pas = Pas.objects.get(idPsa=int(pas_id))
        except (Pas.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError({"idPsa": "Pas nije pronađen."})

        if pas.vlasnik.idVlasnik != vlasnik.idVlasnik:
            raise serializers.ValidationError({"idPsa": "Ovaj pas ne pripada vama."})

        data["idPsa"] = pas.idPsa
        return data

    # ---------- CREATE ----------

    def create(self, validated_data):
        vlasnik = self.context.get("vlasnik")
        if not vlasnik:
            raise serializers.ValidationError("Owner missing.")

        validated_data["idVlasnik"] = vlasnik.idVlasnik
        return Rezervacija.objects.create(**validated_data)
