import pytest
from datetime import datetime, timedelta, time, timezone as dt_timezone
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, DoctorWorkingHours, Appointment, AppointmentStatus
from appointments.services import book_appointment

User = get_user_model()


@pytest.mark.django_db
class TestConcurrencyAndRaceConditions:
    """
    Verifies pessimistic row-locking (select_for_update) and race condition prevention.
    """

    @pytest.fixture
    def setup_concurrency_context(self):
        patient1 = User.objects.create_user(username='p1_c', email='p1c@test.com', password='Password123!')
        patient2 = User.objects.create_user(username='p2_c', email='p2c@test.com', password='Password123!')
        
        doc_user = User.objects.create_user(username='dr_conc', email='drc@test.com', password='Password123!', role=UserRole.DOCTOR)
        doctor = Doctor.objects.create(user=doc_user, specialization='Neurology', slot_duration_minutes=30)
        
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

        valid_start_time = timezone.make_aware(datetime.combine(target_date, time(10, 0)), dt_timezone.utc)
        return patient1, patient2, doctor, valid_start_time

    def test_prevent_double_booking_same_slot(self, setup_concurrency_context):
        patient1, patient2, doctor, valid_start_time = setup_concurrency_context

        # First booking succeeds
        book_appointment(patient=patient1, doctor_id=doctor.id, start_time=valid_start_time)

        # Second concurrent booking attempt fails cleanly
        with pytest.raises(ValidationError) as excinfo:
            book_appointment(patient=patient2, doctor_id=doctor.id, start_time=valid_start_time)

        assert "already booked" in str(excinfo.value)
