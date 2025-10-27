from django.urls import path
from .views import register_user, me, predict_url, health

urlpatterns = [
    path('register/', register_user, name='register'),
    path('me/', me, name='me'),
    path('predict/', predict_url, name='predict'),
    path('health/', health, name='health'),
]