from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_reservation, name='create_reservation'),
    path('create-from-walk/<int:walk_id>/', views.create_reservation_from_walk, name='create_reservation_from_walk'),
    path('my-reservations/', views.get_my_reservations, name='get_my_reservations'),
    path('accept/<int:reservation_id>/', views.accept_reservation, name='accept_reservation'),
    path('reject/<int:reservation_id>/', views.reject_reservation, name='reject_reservation'),
    path('mark-done/<int:reservation_id>/', views.mark_walk_done, name='mark_walk_done'),
    path('delete/<int:reservation_id>/', views.delete_reservation, name='delete_reservation'),
]