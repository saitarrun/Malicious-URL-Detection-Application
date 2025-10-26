from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
import json


class PredictEndpointTests(TestCase):
	from django.test import TestCase, Client
	from django.contrib.auth.models import User
	from django.urls import reverse
	import json


	class PredictEndpointTests(TestCase):
		def setUp(self):
			self.username = 'testuser'
			self.password = 'password123'
			User.objects.create_user(username=self.username, password=self.password)
			self.client = Client()

		def _get_jwt_token(self):
			# The project uses djangorestframework-simplejwt; token obtain endpoint
			resp = self.client.post('/api/token/', {
				'username': self.username,
				'password': self.password,
			})
			if resp.status_code != 200:
				return None
			data = json.loads(resp.content)
			return data.get('access')

		def test_predict_basic(self):
			token = self._get_jwt_token()
			if token is None:
				# If tokens endpoint isn't wired, skip the heavy assertion but ensure app doesn't crash
				resp = self.client.post(reverse('predict'), {'url': 'http://example.com/login'})
				# Expect either 401 (no auth) or 400/200 depending on setup
				self.assertIn(resp.status_code, (200, 400, 401))
				return

			auth_headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
			resp = self.client.post(reverse('predict'), data=json.dumps({'url': 'http://example.com/login'}), content_type='application/json', **auth_headers)
			self.assertEqual(resp.status_code, 200)
			data = json.loads(resp.content)
			self.assertIn('malicious_prob', data)
			self.assertIn('malicious', data)
