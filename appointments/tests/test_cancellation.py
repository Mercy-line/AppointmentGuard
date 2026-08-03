import pytest
from datetime import datetime, timedelta, time
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, DoctorWorkingHours, Appointment, AppointmentStatus
from appointments.services import book_appointment, cancel_appointment, get_doctor_available_slots

User = get_user_model()


@pytest.mark.django_db
class TestAppointmentCancellation:
    """
    Test suite verifying appointment cancellation rules, slot freeing, reason requirement,
    and authorization checks.
    """

    @pytest.fixture
    def setup_booked_appointment(self):
        patient = User.objects.create_user(
            username='patient_cancel',
            email='patient.c@test.com',
            password='Password123!',
            role=UserRole.PATIENT
        )
        doc_user = User.objects.create_user(
            username='dr_cancel',
            email='dr.c@test.com',
            password='Password123!',
            role=UserRole.DOCTOR
        )
        doctor = Doctor.objects.create(
            user=doc_user,
            specialization='Pediatrics',
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
            datetime.combine(target_date, time(11, 0)),
            timezone.utc
        )

        appointment = book_appointment(
            patient=patient,
            doctor_id=doctor.id,
            start_time=start_time
        )

        return patient, doctor, appointment, target_date, start_time

    def test_successful_cancellation_frees_slot(self, setup_booked_appointment):
        patient, doctor, appointment, target_date, start_time = setup_booked_appointment
        
        # Cancel appointment with reason
        reason = "Patient developed high fever and cannot travel."
        cancelled_appt = cancel_appointment(
            appointment_id=appointment.id,
            user=patient,
            reason=reason
        )

        assert cancelled_appt.status == AppointmentStatus.CANCELLED
        assert cancelled_appt.cancellation_reason == reason

        # Verify that the cancelled slot becomes available again in availability calculations
        available_slots = get_doctor_available_slots(doctor.id, target_date)
        slot_starts = [s['start_time'] for s in available_slots]
        assert start_time.isoformat() in slot_starts

    def test_cancellation_fails_if_already_cancelled(self, setup_booked_appointment):
        patient, _, appointment, _, _ = setup_booked_appointment
        
        # First cancellation succeeds
        cancel_appointment(appointment_id=appointment.id, user=patient, reason="Initial reason")

        # Second cancellation attempt fails
        with pytest.raises(ValidationError) as excinfo:
            cancel_appointment(appointment_id=appointment.id, user=patient, reason="Second attempt")

        assert "already been cancelled" in str(excinfo.value)

    def test_cancellation_fails_without_reason(self, setup_booked_appointment):
        patient, _, appointment, _, _ = setup_booked_appointment

        with pytest.raises(ValidationError) as excinfo:
            cancel_appointment(appointment_id=appointment.id, user=patient, reason="   ")

        assert "reason is required" in str(excinfo.value)

    def test_unauthorized_user_cannot_cancel(self, setup_booked_appointment):
        _, _, appointment, _, _ = setup_booked_appointment
        other_user = User.objects.create_user(
            username='stranger',
            email='stranger@test.com',
            password='Password123!',
            role=UserRole.PATIENT
        )

        with pytest.raises(ValidationError) as excinfo:
            cancel_appointment(appointment_id=appointment.id, user=other_user, reason="Malicious cancel")

        assert "do not have permission" in str(excinfo.value)
