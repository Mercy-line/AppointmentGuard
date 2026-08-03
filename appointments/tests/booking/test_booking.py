import pytest
from datetime import datetime, timedelta, date, time, timezone as dt_timezone
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, DoctorWorkingHours, Appointment, AppointmentStatus
from appointments.services import book_appointment, cancel_appointment, reschedule_appointment

User = get_user_model()


@pytest.mark.django_db
class TestAppointmentBooking:
    """
    Test suite verifying booking logic, 1-hour advance buffer rule, working hours validation,
    cancellation, and rescheduling.
    """

    @pytest.fixture
    def setup_booking_context(self):
        patient = User.objects.create_user(
            username='patient_booking',
            email='patient.b@test.com',
            password='Password123!',
            role=UserRole.PATIENT
        )
        doc_user = User.objects.create_user(
            username='dr_booking',
            email='dr.b@test.com',
            password='Password123!',
            role=UserRole.DOCTOR
        )
        doctor = Doctor.objects.create(
            user=doc_user,
            specialization='Dermatology',
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

        valid_start_time = timezone.make_aware(
            datetime.combine(target_date, time(10, 0)),
            dt_timezone.utc
        )

        return patient, doctor, valid_start_time, target_date

    def test_successful_booking(self, setup_booking_context):
        patient, doctor, valid_start_time, _ = setup_booking_context
        appointment = book_appointment(
            patient=patient,
            doctor_id=doctor.id,
            start_time=valid_start_time
        )
        assert appointment.status == AppointmentStatus.BOOKED
        assert appointment.patient == patient
        assert appointment.doctor == doctor
        assert appointment.end_time == valid_start_time + timedelta(minutes=30)

    def test_booking_fails_within_1_hour_of_current_time(self, setup_booking_context):
        patient, doctor, _, _ = setup_booking_context
        invalid_start_time = timezone.now() + timedelta(minutes=30)

        with pytest.raises(ValidationError) as excinfo:
            book_appointment(patient=patient, doctor_id=doctor.id, start_time=invalid_start_time)

        assert "at least 1 hour in advance" in str(excinfo.value)

    def test_booking_fails_outside_working_hours(self, setup_booking_context):
        patient, doctor, valid_start_time, _ = setup_booking_context
        outside_time = timezone.make_aware(
            datetime.combine(valid_start_time.date(), time(18, 0)),
            dt_timezone.utc
        )

        with pytest.raises(ValidationError) as excinfo:
            book_appointment(patient=patient, doctor_id=doctor.id, start_time=outside_time)

        assert "outside doctor's working hours" in str(excinfo.value)

    def test_cancellation_and_reschedule(self, setup_booking_context):
        patient, doctor, valid_start_time, target_date = setup_booking_context
        appointment = book_appointment(patient=patient, doctor_id=doctor.id, start_time=valid_start_time)

        # Reschedule active appointment
        new_start = timezone.make_aware(datetime.combine(target_date, time(14, 0)), dt_timezone.utc)
        rescheduled = reschedule_appointment(appointment_id=appointment.id, user=patient, new_start_time=new_start)
        assert rescheduled.start_time == new_start

        # Cancel appointment
        cancelled = cancel_appointment(appointment_id=appointment.id, user=patient, reason="Changing plans")
        assert cancelled.status == AppointmentStatus.CANCELLED
