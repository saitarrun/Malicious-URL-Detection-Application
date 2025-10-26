from django.urls import path
from .views import PredictView, register_user

urlpatterns = [
    path('predict/', PredictView.as_view(), name='predict'),
    path('register/', register_user, name='register'),
]
