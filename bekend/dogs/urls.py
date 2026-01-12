from django.urls import path
from . import views

urlpatterns = [
    path("dogs/", views.get_AllDogs, name="dogs_list"),
    path("dogs/create/", views.dogs_create, name="dogs_create"),

    path("dogs/<int:dog_id>/", views.dog_detail, name="dog_detail"),
    path("dogs/<int:dog_id>/update/", views.dog_update, name="dog_update"),
    path("dogs/<int:dog_id>/delete/", views.dog_delete, name="dog_delete"),
]
