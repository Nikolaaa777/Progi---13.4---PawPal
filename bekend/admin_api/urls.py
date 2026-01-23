from django.urls import path
from . import views

urlpatterns = [
    path("users/", views.users_list),
    path("users/<int:user_id>/disable/", views.user_disable),
    path("users/<int:user_id>/enable/", views.user_enable),

    path("clanarina/", views.clanarina_get),
    path("clanarina/update/", views.clanarina_update)]
