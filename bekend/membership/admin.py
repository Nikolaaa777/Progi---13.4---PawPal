from django.contrib import admin
from .models import Clanarina

@admin.register(Clanarina)
class ClanarinaAdmin(admin.ModelAdmin):
    list_display = ("iznos", "updated_at")

    def has_add_permission(self, request):
        return not Clanarina.objects.exists()