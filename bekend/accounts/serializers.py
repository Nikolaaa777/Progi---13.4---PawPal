from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import Profile
from .models import Vlasnik, Setac
from .domain_sync import ensure_vlasnik_row, ensure_setac_row, VlasnikPayload, SetacPayload

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    is_walker = serializers.BooleanField(default=False)
    city = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        is_walker = validated_data.pop("is_walker", False)
        phone = validated_data.pop("phone", "")
        username = validated_data["email"]

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=validated_data["email"],
                first_name=validated_data["first_name"],
                last_name=validated_data["last_name"],
                password=validated_data["password"],
                is_active=True,
            )
            city = (validated_data.get("city") or "").strip() or None

            profile, _ = Profile.objects.get_or_create(user=user)
            profile.is_walker = is_walker
            if city is not None:
                profile.city = city
            profile.save()

            # VLASNIK: upiši u domensku tablicu
            ensure_vlasnik_row(
                    user,
                    payload=VlasnikPayload(
                        email=user.email,
                        first_name=user.first_name or None,
                        last_name=user.last_name or None,
                        phone=(phone or None) if (phone and phone.strip()) else None,
                    ),
                )
            
            # ako je šetač -> upiši i setaca
            if is_walker:
                ensure_setac_row(
        user,
        payload=SetacPayload(
            email=user.email,
            username=None,  # neka se generira
            first_name=user.first_name or None,
            last_name=user.last_name or None,
            phone=phone,
            city=city, 
            idClanarine=None,
            idProfilne=None,
        )
    )
                # Create walker registration event for notifications (only if not already exists)
                from .models import WalkerRegistrationEvent
                if not WalkerRegistrationEvent.objects.filter(walker=user).exists():
                    WalkerRegistrationEvent.objects.create(walker=user)
        return user
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class EnableWalkerSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    
class MeUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True)

    def update(self, user, validated_data):
        old_email = (user.email or "").strip().lower()

        # update auth_user
        if "first_name" in validated_data:
            user.first_name = validated_data["first_name"]
        if "last_name" in validated_data:
            user.last_name = validated_data["last_name"]

        if "email" in validated_data:
            new_email = validated_data["email"].strip().lower()
            user.email = new_email
            user.username = new_email  # kod vas username = email

        user.save()

        # update phone + names in domain tables
        phone = validated_data.get("phone", None)
        if phone is not None:
            phone = "".join(ch for ch in phone if ch.isdigit())

        # Vlasnik (uvijek postoji ili ga imate kroz register)
        Vlasnik.objects.filter(emailVlasnik__iexact=old_email).update(
            emailVlasnik=user.email,
            imeVlasnik=user.first_name or None,
            prezimeVlasnik=user.last_name or None,
            telefonVlasnik=(phone or None) if (phone is not None) else None,
        )

        # Setac (samo ako postoji)
        Setac.objects.filter(emailSetac__iexact=old_email).update(
            emailSetac=user.email,
            imeSetac=user.first_name or None,
            prezimeSetac=user.last_name or None,
            telefonSetac=(phone or None) if (phone is not None) else None,
        )

        return user

