from django.contrib import admin
from .models import PredictionLog


@admin.register(PredictionLog)
class PredictionLogAdmin(admin.ModelAdmin):
	list_display = ('url', 'malicious', 'malicious_prob', 'model_version', 'created_at')
	list_filter = ('malicious', 'model_version', 'created_at')
	search_fields = ('url',)

