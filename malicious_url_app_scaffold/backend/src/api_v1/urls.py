from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register_user, me, predict_url, health

urlpatterns = [
    path("register/", register_user, name="register"),
    path("me/", me, name="me"),
    path("protected/", me, name="protected"),  # alias if frontend calls /protected
    path("predict/", predict_url, name="predict"),
    path("health/", health, name="health"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]