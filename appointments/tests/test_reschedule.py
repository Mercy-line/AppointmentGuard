import pytest
from datetime import datetime, timedelta, time, timezone as dt_timezone
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, DoctorWorkingHours, Appointment, AppointmentStatus
from appointments.services import book_appointment, cancel_appointment, reschedule_appointment, get_doctor_available_slots

User = get_user_model()


@pytest.mark.django_db
class TestAppointmentReschedule:
    """
    Test suite verifying appointment rescheduling, new slot validation, original slot liberation,
    and prohibition of rescheduling cancelled appointments.
    """

    @pytest.fixture
    def setup_reschedule_context(self):
        patient = User.objects.create_user(
            username='patient_reschedule',
            email='patient.r@test.com',
            password='Password123!',
            role=UserRole.PATIENT
        )
        doc_user = User.objects.create_user(
            username='dr_reschedule',
            email='dr.r@test.com',
            password='Password123!',
            role=UserRole.DOCTOR
        )
        doctor = Doctor.objects.create(
            user=doc_user,
            specialization='Orthopedics',
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

        original_start = timezone.make_aware(
            datetime.combine(target_date, time(10, 0)),
            dt_timezone.utc
        )
        new_start = timezone.make_aware(
            datetime.combine(target_date, time(14, 0)),
            dt_timezone.utc
        )

        appointment = book_appointment(
            patient=patient,
            doctor_id=doctor.id,
            start_time=original_start
        )

        return patient, doctor, appointment, target_date, original_start, new_start

    def test_successful_reschedule_liberates_old_slot(self, setup_reschedule_context):
        patient, doctor, appointment, target_date, original_start, new_start = setup_reschedule_context

        rescheduled_appt = reschedule_appointment(
            appointment_id=appointment.id,
            user=patient,
            new_start_time=new_start
        )

        assert rescheduled_appt.start_time == new_start
        assert rescheduled_appt.status == AppointmentStatus.BOOKED

        available_slots = get_doctor_available_slots(doctor.id, target_date)
        slot_starts = [s['start_time'] for s in available_slots]

        assert original_start.isoformat() in slot_starts
        assert new_start.isoformat() not in slot_starts

    def test_cannot_reschedule_cancelled_appointment(self, setup_reschedule_context):
        patient, _, appointment, _, _, new_start = setup_reschedule_context

        cancel_appointment(appointment_id=appointment.id, user=patient, reason="Changing plans")

        with pytest.raises(ValidationError) as excinfo:
            reschedule_appointment(
                appointment_id=appointment.id,
                user=patient,
                new_start_time=new_start
            )

        assert "Cannot reschedule an appointment that has been cancelled" in str(excinfo.value)

    def test_reschedule_fails_on_already_booked_slot(self, setup_reschedule_context):
        patient, doctor, appointment, target_date, _, new_start = setup_reschedule_context
        patient2 = User.objects.create_user(username='p2_reschedule', email='p2r@test.com', password='Password123!')

        book_appointment(patient=patient2, doctor_id=doctor.id, start_time=new_start)

        with pytest.raises(ValidationError) as excinfo:
            reschedule_appointment(
                appointment_id=appointment.id,
                user=patient,
                new_start_time=new_start
            )

        assert "already booked" in str(excinfo.value)
