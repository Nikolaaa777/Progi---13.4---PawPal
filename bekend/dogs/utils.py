from django.contrib.auth.models import User
from rest_framework.exceptions import PermissionDenied

from accounts.models import Vlasnik, Profile
from accounts.domain_sync import ensure_vlasnik_row  # ako si ga dodao ranije


def get_current_vlasnik(user: User) -> Vlasnik:
    """
    Vrati Vlasnik zapis za trenutno ulogiranog usera.
    - Ako je user šetač -> zabrani (nema pasa)
    - Ako vlasnik zapis ne postoji -> napravi ga (sigurno)
    """
    profile, _ = Profile.objects.get_or_create(user=user)
    if profile.is_walker:
        raise PermissionDenied("Šetač ne može upravljati psima (samo vlasnik).")

    # Povezujemo po emailu (trenutni dizajn)
    if not user.email:
        raise PermissionDenied("Korisnik nema email — ne mogu mapirati na Vlasnik.")

    vlasnik = Vlasnik.objects.filter(emailVlasnik__iexact=user.email).first()
    if vlasnik:
        return vlasnik

    # fallback: napravi row u "Vlasnik" ako fali
    return ensure_vlasnik_row(user)
