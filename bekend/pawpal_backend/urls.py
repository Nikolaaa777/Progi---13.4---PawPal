from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("api/", include("accounts.urls")),
    path("api/", include("walks.urls")),
    path("api/", include("payments.urls")),
    path("api/", include("dogs.urls")),
    path("api/", include("chat.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    path("api/admin/", include("admin_api.urls")),
    path("api/reservations/", include("reservations.urls")),
    path("api/reviews/", include("reviews.urls")),
    path("api/", include("membership.urls")),

]
