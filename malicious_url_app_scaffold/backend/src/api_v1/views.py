from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
import joblib
from django.conf import settings
import os
import json
from django.core.cache import caches
from .models import PredictionLog
from .tasks import log_prediction

# Load the model and vectorizer
model_path = os.path.join(settings.BASE_DIR, 'api_v1', 'malicious_url_model.pkl')
vectorizer_path = os.path.join(settings.BASE_DIR, 'api_v1', 'vectorizer.pkl')
try:
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    MODEL_VERSION = getattr(model, 'version', 'v1')
except Exception:
    # Fallback: simple rule-based stub if artifacts missing
    model = None
    vectorizer = None
    MODEL_VERSION = 'stub-v1'


class PredictView(APIView):
    permission_classes = [IsAuthenticated]
    CACHE_KEY_PREFIX = 'pred:'
    CACHE_TTL = int(os.environ.get('PRED_CACHE_TTL', 3600))  # seconds

    def _get_cache(self):
        try:
            return caches['default']
        except Exception:
            return None

    def _predict(self, url: str):
        # If real model is available, use it; otherwise fallback to heuristic
        if model is not None and vectorizer is not None:
            X = vectorizer.transform([url])
            if hasattr(model, 'predict_proba'):
                prob = float(model.predict_proba(X)[0][1])
                label = bool(model.predict(X)[0])
            else:
                label = bool(model.predict(X)[0])
                prob = 1.0 if label else 0.0
        else:
            # Naive heuristic: consider 'login'/'secure'/'bank' as suspicious
            lowered = url.lower()
            score = 0.0
            for token in ('login', 'secure', 'bank', 'update', 'verify'):
                if token in lowered:
                    score += 0.3
            prob = min(1.0, score)
            label = prob >= 0.5
        return prob, label

    def post(self, request):
        url = request.data.get('url')
        if not url:
            return Response({'error': 'URL not provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Simple rate limiter (per IP)
        try:
            ip = request.META.get('REMOTE_ADDR', 'anonymous')
        except Exception:
            ip = 'anonymous'
        rl_cache = self._get_cache()
        if rl_cache is not None:
            try:
                rl_key = f"rl:{ip}"
                count = rl_cache.get(rl_key) or 0
                limit = int(os.environ.get('RATE_LIMIT_PER_MIN', 60))
                if int(count) >= limit:
                    return Response({'error': 'Rate limit exceeded'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
                rl_cache.set(rl_key, int(count) + 1, timeout=60)
            except Exception:
                pass

        cache = self._get_cache()
        cache_key = f"{self.CACHE_KEY_PREFIX}{url}"

        # Try cache
        cached = None
        if cache is not None:
            try:
                cached_raw = cache.get(cache_key)
                if cached_raw:
                    cached = json.loads(cached_raw)
            except Exception:
                cached = None

        if cached is not None:
            # Return cached value without creating a new DB log
            return Response({
                'url': url,
                'malicious_prob': cached['malicious_prob'],
                'malicious': cached['malicious'],
                'cached': True,
                'model_version': cached.get('model_version', MODEL_VERSION),
            })

        # Cache miss -> run prediction
        malicious_prob, malicious = self._predict(url)

        # Persist to DB asynchronously via Celery (best-effort)
        try:
            log_prediction.delay(url, bool(malicious), float(malicious_prob), MODEL_VERSION)
        except Exception:
            # If Celery/broker unavailable, fall back to sync write
            try:
                PredictionLog.objects.create(
                    url=url,
                    malicious=bool(malicious),
                    malicious_prob=float(malicious_prob),
                    model_version=MODEL_VERSION,
                )
            except Exception:
                pass

        # Store in cache
        if cache is not None:
            try:
                cache.set(cache_key, json.dumps({
                    'malicious_prob': malicious_prob,
                    'malicious': malicious,
                    'model_version': MODEL_VERSION,
                }), timeout=self.CACHE_TTL)
            except Exception:
                pass

        return Response({
            'url': url,
            'malicious_prob': malicious_prob,
            'malicious': malicious,
            'cached': False,
            'model_version': MODEL_VERSION,
        })

@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
