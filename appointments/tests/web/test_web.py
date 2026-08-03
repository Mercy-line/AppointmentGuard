import pytest
from django.urls import reverse
from django.test import Client
from django.contrib.auth import get_user_model
from appointments.models import UserRole

User = get_user_model()


@pytest.mark.django_db
class TestWebInterfaceViews:
    """
    Verifies web template views (Dashboard, Doctor Dashboard, Login).
    """

    @pytest.fixture
    def client(self):
        return Client()

    def test_dashboard_view_renders_200(self, client):
        url = reverse('appointments:dashboard')
        response = client.get(url)
        assert response.status_code == 200

    def test_login_view_renders_200(self, client):
        url = reverse('appointments:login')
        response = client.get(url)
        assert response.status_code == 200
