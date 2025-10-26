from .celery import app as celery_app

# Expose celery app for `celery -A malicious_url_backend worker`
__all__ = ('celery_app',)
