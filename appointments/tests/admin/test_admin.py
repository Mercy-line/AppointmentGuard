import pytest
from django.contrib.admin.sites import site
from django.contrib.auth import get_user_model
from appointments.models import CustomUser, Doctor, DoctorWorkingHours, DoctorTimeOff, Appointment

User = get_user_model()


@pytest.mark.django_db
class TestAdminIntegration:
    """
    Verifies Django Admin model registrations and admin panel functionality.
    """

    def test_all_models_registered_in_admin(self):
        registered_models = site._registry
        assert CustomUser in registered_models
        assert Doctor in registered_models
        assert DoctorWorkingHours in registered_models
        assert DoctorTimeOff in registered_models
        assert Appointment in registered_models
