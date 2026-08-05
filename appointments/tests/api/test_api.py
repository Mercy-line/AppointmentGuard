import pytest
from datetime import datetime, timedelta, time, timezone as dt_timezone
from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, DoctorWorkingHours, Appointment, AppointmentStatus

User = get_user_model()


@pytest.mark.django_db
class TestRESTAPIEndpoints:
    """
    Test suite verifying DRF REST API endpoints.
    """

    @pytest.fixture
    def setup_api_data(self):
        client = APIClient()
        patient = User.objects.create_user(
            username='api_patient',
            email='api_p@test.com',
            password='Password123!',
            role=UserRole.PATIENT
        )
        doc_user = User.objects.create_user(
            username='api_doctor',
            email='api_d@test.com',
            password='Password123!',
            role=UserRole.DOCTOR
        )
        doctor = Doctor.objects.create(
            user=doc_user,
            specialization='Cardiology',
            slot_duration_minutes=30
        )

        now = timezone.now()
        days_ahead = (0 - now.weekday() + 7) % 7
        if days_ahead == 0:
            days_ahead = 7
        target_date = (now + timedelta(days=days_ahead)).date()

        DoctorWorkingHours.objects.create(
            doctor=doctor,
            day_of_week=target_date.weekday(),
            start_time=time(9, 0),
            end_time=time(17, 0)
        )

        start_time = timezone.make_aware(
            datetime.combine(target_date, time(10, 0)),
            dt_timezone.utc
        )

        return client, patient, doctor, target_date, start_time

    def test_doctor_list_api(self, setup_api_data):
        client, _, doctor, _, _ = setup_api_data
        url = reverse('appointments:doctor-list')
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_doctor_availability_api(self, setup_api_data):
        client, _, doctor, target_date, _ = setup_api_data
        url = reverse('appointments:doctor-availability', kwargs={'pk': doctor.id})
        response = client.get(f"{url}?date={target_date.isoformat()}")
        assert response.status_code == status.HTTP_200_OK
        assert 'available_slots' in response.data
        assert len(response.data['available_slots']) == 16

    def test_login_api_success(self, setup_api_data):
        client, patient, _, _, _ = setup_api_data
        url = reverse('appointments:api-login')
        response = client.post(url, {'email': 'api_p@test.com', 'password': 'Password123!'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'api_p@test.com'
        assert response.data['role'] == 'PATIENT'

    def test_login_api_invalid(self, setup_api_data):
        client, _, _, _, _ = setup_api_data
        url = reverse('appointments:api-login')
        response = client.post(url, {'email': 'api_p@test.com', 'password': 'WrongPassword'}, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data

    def test_register_api_success(self, setup_api_data):
        client, _, _, _, _ = setup_api_data
        url = reverse('appointments:api-register')
        payload = {
            'name': 'Sarah Connor',
            'email': 'sarah@clinic.com',
            'password': 'NewPassword123!',
            'role': 'PATIENT'
        }
        response = client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['email'] == 'sarah@clinic.com'
        assert response.data['role'] == 'PATIENT'

    def test_patient_list_api(self, setup_api_data):
        client, patient, _, _, _ = setup_api_data
        url = reverse('appointments:api-patient-list')
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert len(response.data) >= 1
