from django.contrib.auth.models import User
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
import requests

@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})

@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password") or ""
    password2 = request.data.get("password2") or ""

    if not username:
        return Response({"detail": "Username is required"}, status=400)
    if password != password2:
        return Response({"detail": "Passwords do not match"}, status=400)
    if len(password) < 8:
        return Response({"detail": "Password must be at least 8 characters"}, status=400)

    try:
        user = User.objects.create_user(username=username, password=password)
    except IntegrityError:
        return Response({"detail": "Username already exists"}, status=400)

    return Response({"id": user.id, "username": user.username}, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({"id": request.user.id, "username": request.user.username})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def predict_url(request):
    url = request.data.get("url")
    if not url:
        return Response({"detail": "url is required"}, status=400)

    base = getattr(settings, "URL_CHECKER_URL", "http://url-checker-service:8080")
    try:
        r = requests.post(f"{base}/predict", json={"url": url}, timeout=5)
        r.raise_for_status()
        data = r.json()
    except requests.RequestException as e:
        return Response(
            {"detail": "url-checker-service unavailable", "error": str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(data, status=200)