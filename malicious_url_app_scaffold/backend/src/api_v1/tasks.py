from celery import shared_task

from .models import PredictionLog


@shared_task(bind=True)
def log_prediction(self, url, malicious, malicious_prob, model_version='v1'):
    """Asynchronously persist a prediction to the DB.

    This is best-effort: exceptions should be allowed to surface in Celery logs.
    """
    PredictionLog.objects.create(
        url=url,
        malicious=bool(malicious),
        malicious_prob=float(malicious_prob),
        model_version=model_version,
    )
