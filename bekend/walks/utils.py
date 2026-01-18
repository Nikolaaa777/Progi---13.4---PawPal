from rest_framework.exceptions import PermissionDenied
from accounts.models import Profile, Setac
from accounts.domain_sync import ensure_setac_row

def get_current_setac_id(user) -> int:
    profile, _ = Profile.objects.get_or_create(user=user)
    if not profile.is_walker:
        raise PermissionDenied("Samo šetač može upravljati šetnjama.")

    setac = Setac.objects.filter(emailSetac__iexact=user.email).first()
    if setac:
        return int(setac.idSetac)

    setac = ensure_setac_row(user)
    return int(setac.idSetac)