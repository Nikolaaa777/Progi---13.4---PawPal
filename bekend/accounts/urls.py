from django.urls import path
from . import views
from .views import google_login_url 
from .views import toggle_notifications

urlpatterns = [
    path("auth/csrf/", views.csrf, name="csrf"),
    path("auth/register/", views.register, name="register"),
    path("auth/login/", views.login_view, name="login"),
    path("auth/logout/", views.logout_view, name="logout"),
    path("auth/me/", views.me, name="me"),
    path("auth/google/login-url/", google_login_url, name="google_login_url"),
    path("notifications/toggle/", toggle_notifications),
    path("walker/enable/", views.enable_walker, name="enable_walker"),
]
