import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'malicious_url_backend.settings')

app = Celery('malicious_url_backend')
# Read config from Django settings, using a CELERY_ namespace
app.config_from_object('django.conf:settings', namespace='CELERY')
# Auto-discover tasks from installed apps
app.autodiscover_tasks()

# Default retry / task settings can be added in settings.py
