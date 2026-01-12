from django.urls import path
from . import views

urlpatterns = [
    path("walks/", views.walks_list, name="walks_list"),
    path("walks/create/", views.walks_create, name="walks_create"),

    path("walks/<int:walk_id>/", views.walk_detail, name="walk_detail"),
    path("walks/<int:walk_id>/update/", views.walk_update, name="walk_update"),
    path("walks/<int:walk_id>/delete/", views.walk_delete, name="walk_delete"),
    path("walks/fromAllWalkers/", views.get_AllWalks, name="get_AllWalks"),
]
