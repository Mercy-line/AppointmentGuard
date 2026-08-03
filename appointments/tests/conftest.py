import pytest
from datetime import time, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, DoctorWorkingHours

User = get_user_model()


@pytest.fixture
def patient_user(db):
    return User.objects.create_user(
        username='test_patient',
        email='patient@test.com',
        password='Password123!',
        role=UserRole.PATIENT
    )


@pytest.fixture
def doctor_user(db):
    user = User.objects.create_user(
        username='dr_test',
        email='doctor@test.com',
        password='Password123!',
        role=UserRole.DOCTOR
    )
    doctor = Doctor.objects.create(
        user=user,
        specialization='General Practice',
        slot_duration_minutes=30
    )
    
    # Setup working hours for target testing
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
    return doctor, target_date
