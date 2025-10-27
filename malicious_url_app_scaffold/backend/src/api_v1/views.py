from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import requests
import os

@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({'status': 'ok'})

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''
    password2 = request.data.get('password2') or ''

    if not username:
        return Response({'error': 'Username is required'}, status=400)
    if password != password2:
        return Response({'error': 'Passwords do not match'}, status=400)

    try:
        validate_password(password, user=User(username=username))
    except ValidationError as e:
        return Response({'error': 'Password validation failed', 'reasons': e.messages}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    refresh = RefreshToken.for_user(user)
    return Response(
        {'username': user.username, 'access': str(refresh.access_token), 'refresh': str(refresh)},
        status=status.HTTP_201_CREATED
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({'username': request.user.username})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_url(request):
    url = request.data.get('url')
    if not url:
        return Response({'error': 'url is required'}, status=400)
    svc = os.getenv('URL_CHECKER_BASE', 'http://url-checker-service:8080')
    try:
        r = requests.post(f'{svc}/check', json={'url': url}, timeout=8)
        return Response(r.json(), status=r.status_code)
    except requests.RequestException:
        return Response({'error': 'url-checker-service unavailable'}, status=503)