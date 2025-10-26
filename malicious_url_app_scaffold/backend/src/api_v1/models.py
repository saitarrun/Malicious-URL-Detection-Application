from django.db import models


class PredictionLog(models.Model):
	"""Store requests to the prediction API and the model output.

	Fields:
		url: the original URL string
		malicious: boolean label (True if malicious)
		malicious_prob: predicted probability (0.0 - 1.0)
		model_version: optional model identifier
		created_at: timestamp of request
	"""
	url = models.TextField()
	malicious = models.BooleanField()
	malicious_prob = models.FloatField()
	model_version = models.CharField(max_length=64, default='v1')
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.url} -> {self.malicious} ({self.malicious_prob:.3f})"

