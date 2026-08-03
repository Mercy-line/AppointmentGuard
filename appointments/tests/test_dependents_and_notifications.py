import pytest
from datetime import datetime, timedelta, date, time, timezone as dt_timezone
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, DoctorWorkingHours, Appointment, AppointmentStatus
from appointments.services import book_appointment, cancel_appointment

User = get_user_model()


@pytest.mark.django_db
class TestDependentsAndDoctorNotifications:
    """
    Test suite verifying under-18 minor dependent booking rules and doctor-initiated cancellation notifications.
    """

    @pytest.fixture
    def setup_family_context(self):
        parent = User.objects.create_user(
            username='parent_mary',
            email='mary@test.com',
            password='Password123!',
            role=UserRole.PATIENT,
            date_of_birth=date(1991, 5, 10)
        )
        child_minor = User.objects.create_user(
            username='child_tommy',
            email='tommy@test.com',
            password='Password123!',
            role=UserRole.PATIENT,
            date_of_birth=date(2016, 8, 1),
            parent_guardian=parent
        )
        adult_friend = User.objects.create_user(
            username='adult_sam',
            email='sam@test.com',
            password='Password123!',
            role=UserRole.PATIENT,
            date_of_birth=date(2001, 1, 1)
        )
        doc_user = User.objects.create_user(
            username='dr_notifications',
            email='dr.n@test.com',
            password='Password123!',
            role=UserRole.DOCTOR
        )
        doctor = Doctor.objects.create(
            user=doc_user,
            specialization='Family Medicine',
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

        return parent, child_minor, adult_friend, doctor, doc_user, start_time

    def test_parent_can_book_for_under_18_minor_child(self, setup_family_context):
        parent, child_minor, _, doctor, _, start_time = setup_family_context

        appointment = book_appointment(
            patient=child_minor,
            doctor_id=doctor.id,
            start_time=start_time,
            booked_by=parent
        )

        assert appointment.patient == child_minor
        assert appointment.booked_by == parent
        assert appointment.status == AppointmentStatus.BOOKED

    def test_cannot_book_for_adult_relative_or_friend(self, setup_family_context):
        parent, _, adult_sam, doctor, _, start_time = setup_family_context

        with pytest.raises(ValidationError) as excinfo:
            book_appointment(
                patient=adult_sam,
                doctor_id=doctor.id,
                start_time=start_time,
                booked_by=parent
            )

        assert "only book appointments on behalf of minor dependents" in str(excinfo.value)

    def test_doctor_initiated_cancellation_dispatches_notification_flag(self, setup_family_context):
        parent, child_minor, _, doctor, doc_user, start_time = setup_family_context

        appointment = book_appointment(
            patient=child_minor,
            doctor_id=doctor.id,
            start_time=start_time,
            booked_by=parent
        )

        cancelled_appt = cancel_appointment(
            appointment_id=appointment.id,
            user=doc_user,
            reason="Doctor called for emergency surgery duty."
        )

        assert cancelled_appt.status == AppointmentStatus.CANCELLED
        assert cancelled_appt.notification_sent is True
        assert "emergency surgery duty" in cancelled_appt.cancellation_reason
