import pytest
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor

User = get_user_model()


@pytest.mark.django_db
class TestAuthenticationAndRoles:
    """
    Test suite verifying CustomUser roles, permissions, and doctor profiles.
    """

    def test_create_patient_user(self):
        patient = User.objects.create_user(
            username='test_patient',
            email='patient@clinic.com',
            password='Password123!',
            role=UserRole.PATIENT,
            timezone='UTC'
        )
        assert patient.role == UserRole.PATIENT
        assert patient.is_patient() is True
        assert patient.is_doctor() is False
        assert patient.check_password('Password123!') is True

    def test_create_doctor_user_and_profile(self):
        doctor_user = User.objects.create_user(
            username='dr_smith',
            email='dr.smith@clinic.com',
            password='Password123!',
            role=UserRole.DOCTOR,
            first_name='John',
            last_name='Smith'
        )
        doctor_profile = Doctor.objects.create(
            user=doctor_user,
            specialization='Cardiology',
            slot_duration_minutes=30
        )
        assert doctor_user.is_doctor() is True
        assert doctor_profile.user == doctor_user
        assert str(doctor_profile) == "Dr. John Smith - Cardiology"

    def test_admin_role_creation(self):
        admin_user = User.objects.create_superuser(
            username='admin_user',
            email='admin@clinic.com',
            password='AdminPassword123!',
            role=UserRole.ADMIN
        )
        assert admin_user.is_staff is True
        assert admin_user.is_superuser is True
        assert admin_user.role == UserRole.ADMIN
