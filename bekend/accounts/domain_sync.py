from __future__ import annotations

from dataclasses import dataclass
from typing import Optional
import re
from datetime import date

from django.contrib.auth.models import User
from django.db import transaction

from .models import Vlasnik
from .models import Setac


@dataclass(frozen=True)
class VlasnikPayload:
    """Podaci koje želimo zapisati u tablicu "Vlasnik"."""
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


def ensure_vlasnik_row(user: User, payload: Optional[VlasnikPayload] = None) -> Vlasnik:
    """Osiguraj da za danog Django user-a postoji red u tablici "Vlasnik".

    Mapiranje je po email-u (jer domena trenutno nema FK na auth_user).
    - Ako red ne postoji: kreira se.
    - Ako postoji: dopune se prazna polja (ime/prezime/telefon) kad su dostupna.
    """
    if payload is None:
        payload = VlasnikPayload(
            email=user.email,
            first_name=user.first_name or None,
            last_name=user.last_name or None,
            phone=None,
        )

    email_norm = (payload.email or "").strip().lower()
    if not email_norm:
        raise ValueError("Ne mogu kreirati Vlasnik bez email-a.")

    defaults = {
        "emailVlasnik": email_norm,
        "imeVlasnik": payload.first_name,
        "prezimeVlasnik": payload.last_name,
        "telefonVlasnik": payload.phone,
    }

    with transaction.atomic():
        vlasnik, _created = Vlasnik.objects.get_or_create(
            emailVlasnik__iexact=email_norm,
            defaults=defaults,
        )

        changed = False

        if payload.first_name and not vlasnik.imeVlasnik:
            vlasnik.imeVlasnik = payload.first_name
            changed = True
        if payload.last_name and not vlasnik.prezimeVlasnik:
            vlasnik.prezimeVlasnik = payload.last_name
            changed = True
        if payload.phone and not vlasnik.telefonVlasnik:
            vlasnik.telefonVlasnik = payload.phone
            changed = True

        if vlasnik.emailVlasnik != email_norm:
            vlasnik.emailVlasnik = email_norm
            changed = True

        if changed:
            vlasnik.save(update_fields=["emailVlasnik", "imeVlasnik", "prezimeVlasnik", "telefonVlasnik"])

    return vlasnik



@dataclass(frozen=True)
class SetacPayload:
    """Podaci koje želimo zapisati u tablici "Setac"."""
    email: str
    username: Optional[str] = None  # ako se ne pošalje, generira se
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    idClanarine: Optional[int] = None
    idProfilne: Optional[int] = None


def _normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _slug_username(base: str) -> str:
    """
    usernameSetac u tvojoj bazi je varchar(20) NOT NULL.
    Dozvolimo samo [a-z0-9_], ostalo maknemo.
    """
    base = (base or "").strip().lower()
    base = re.sub(r"[^a-z0-9_]", "", base)
    return base or "setac"


def _generate_unique_username(base: str) -> str:
    """
    Vrati usernameSetac <= 20 znakova i unikatan u tablici "Setac".
    """
    base = _slug_username(base)[:20]
    candidate = base
    i = 1

    while Setac.objects.filter(usernameSetac__iexact=candidate).exists():
        suffix = f"_{i}"
        candidate = (base[: 20 - len(suffix)] + suffix)
        i += 1

    return candidate


def ensure_setac_row(user: User, payload: Optional[SetacPayload] = None) -> Setac:
    """Osiguraj da za danog Django user-a postoji red u tablici "Setac".

    Mapiranje je po email-u.
    - Ako red ne postoji: kreira se (uz obavezni usernameSetac).
    - Ako postoji: dopune se prazna polja (ime/prezime/telefon/datRegSetac...) kad su dostupna.
    """
    if payload is None:
        payload = SetacPayload(
            email=user.email,
            username=None,  # generiramo iz email prefixa
            first_name=user.first_name or None,
            last_name=user.last_name or None,
            phone=None,
            idClanarine=None,
            idProfilne=None,
        )

    email_norm = _normalize_email(payload.email)
    if not email_norm:
        raise ValueError("Ne mogu kreirati Setac bez email-a.")

    # username: ako nije dan, generiraj iz dijela prije @
    username_candidate = (payload.username or "").strip()
    if username_candidate:
        # skrati i očisti
        username_candidate = _slug_username(username_candidate)[:20]
    else:
        username_candidate = _generate_unique_username(email_norm.split("@")[0])

    defaults = {
        "emailSetac": email_norm,
        "usernameSetac": username_candidate,
        "imeSetac": payload.first_name,
        "prezimeSetac": payload.last_name,
        "telefonSetac": payload.phone,
        "datRegSetac": date.today(),
        "idClanarine": payload.idClanarine,
        "idProfilne": payload.idProfilne,
        # avgOcjena ostaje NULL dok nema ocjena
    }

    with transaction.atomic():
        setac, created = Setac.objects.get_or_create(
            emailSetac__iexact=email_norm,
            defaults=defaults,
        )

        changed = False

        # Ako je setac već postojao, a usernameSetac je prazan (ne bi smio biti),
        # ili ga želiš dopuniti:
        if not setac.usernameSetac:
            # mora biti unikatan
            setac.usernameSetac = _generate_unique_username(email_norm.split("@")[0])
            changed = True

        if payload.first_name and not setac.imeSetac:
            setac.imeSetac = payload.first_name
            changed = True
        if payload.last_name and not setac.prezimeSetac:
            setac.prezimeSetac = payload.last_name
            changed = True
        if payload.phone and not setac.telefonSetac:
            setac.telefonSetac = payload.phone
            changed = True

        # dopuni datRegSetac ako je NULL
        if not setac.datRegSetac:
            setac.datRegSetac = date.today()
            changed = True

        # idClanarine / idProfilne (dopuni ako je prazno i payload ima vrijednost)
        if payload.idClanarine is not None and setac.idClanarine is None:
            setac.idClanarine = payload.idClanarine
            changed = True
        if payload.idProfilne is not None and setac.idProfilne is None:
            setac.idProfilne = payload.idProfilne
            changed = True

        # email normalizacija (ako je u bazi drugačiji casing)
        if _normalize_email(setac.emailSetac) != email_norm:
            setac.emailSetac = email_norm
            changed = True

        if changed:
            setac.save(update_fields=[
                "emailSetac",
                "usernameSetac",
                "imeSetac",
                "prezimeSetac",
                "telefonSetac",
                "datRegSetac",
                "idClanarine",
                "idProfilne",
            ])

    return setac
