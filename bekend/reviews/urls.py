from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_review, name='create_review'),
    path('my-reviews/', views.get_my_reviews, name='get_my_reviews'),
    path('delete/<int:review_id>/', views.delete_review, name='delete_review'),
    path('average/<int:setac_id>/', views.get_walker_average, name='walker_average'),
]