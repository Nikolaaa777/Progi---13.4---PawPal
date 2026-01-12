from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile
from .domain_sync import ensure_vlasnik_row, ensure_setac_row, VlasnikPayload, SetacPayload

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    is_walker = serializers.BooleanField(default=False)

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

        user = User.objects.create_user(
            username=username,
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
            is_active=True,
        )

        profile, _ = Profile.objects.get_or_create(user=user)
        profile.is_walker = is_walker
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
        idClanarine=None,
        idProfilne=None,
    )
)
        return user
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class EnableWalkerSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
