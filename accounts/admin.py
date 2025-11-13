from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "is_walker", "has_notifications_on")
    list_filter = ("is_walker",)
    search_fields = ("user__email", "user__username")