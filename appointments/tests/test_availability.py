import pytest
from datetime import datetime, timedelta, time, timezone as dt_timezone
from django.utils import timezone
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, DoctorWorkingHours, DoctorTimeOff, Appointment, AppointmentStatus
from appointments.services import get_doctor_available_slots, audit_working_hours_shift_change

User = get_user_model()


@pytest.mark.django_db
class TestSlotAvailability:
    """
    Test suite verifying 30-minute slot availability calculations and shift change audits.
    """

    @pytest.fixture
    def setup_doctor_and_hours(self):
        doc_user = User.objects.create_user(
            username='dr_availability',
            email='availability@clinic.com',
            password='Password123!',
            role=UserRole.DOCTOR
        )
        doctor = Doctor.objects.create(
            user=doc_user,
            specialization='General Practice',
            slot_duration_minutes=30
        )
        now = timezone.now()
        days_ahead = (0 - now.weekday() + 7) % 7
        if days_ahead == 0:
            days_ahead = 7
        target_date = (now + timedelta(days=days_ahead)).date()

        working_hours = DoctorWorkingHours.objects.create(
            doctor=doctor,
            day_of_week=target_date.weekday(),
            start_time=time(9, 0),
            end_time=time(17, 0)
        )
        return doctor, target_date, working_hours

    def test_get_available_slots_returns_correct_30_min_grid(self, setup_doctor_and_hours):
        doctor, target_date, _ = setup_doctor_and_hours
        slots = get_doctor_available_slots(doctor.id, target_date)
        # Shift 09:00 to 17:00 = 8 hours = 16 slots of 30 mins
        assert len(slots) == 16
        assert slots[0]['duration_minutes'] == 30

    def test_get_available_slots_excludes_booked_appointment(self, setup_doctor_and_hours):
        doctor, target_date, _ = setup_doctor_and_hours
        patient = User.objects.create_user(username='p1', email='p1@test.com', password='Password123!')

        start_dt = timezone.make_aware(datetime.combine(target_date, time(10, 0)), dt_timezone.utc)
        end_dt = start_dt + timedelta(minutes=30)
        Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            start_time=start_dt,
            end_time=end_dt,
            status=AppointmentStatus.BOOKED
        )

        slots = get_doctor_available_slots(doctor.id, target_date)
        assert len(slots) == 15
        slot_starts = [s['start_time'] for s in slots]
        assert start_dt.isoformat() not in slot_starts

    def test_get_available_slots_excludes_doctor_time_off(self, setup_doctor_and_hours):
        doctor, target_date, _ = setup_doctor_and_hours
        
        to_start = timezone.make_aware(datetime.combine(target_date, time(10, 0)), dt_timezone.utc)
        to_end = timezone.make_aware(datetime.combine(target_date, time(11, 0)), dt_timezone.utc)
        DoctorTimeOff.objects.create(
            doctor=doctor,
            start_datetime=to_start,
            end_datetime=to_end,
            reason='Medical Conference'
        )

        slots = get_doctor_available_slots(doctor.id, target_date)
        assert len(slots) == 14

    def test_working_hours_shift_change_flags_conflicting_bookings(self, setup_doctor_and_hours):
        doctor, target_date, working_hours = setup_doctor_and_hours
        patient = User.objects.create_user(username='p_shift', email='pshift@test.com', password='Password123!')

        # Book slot at 16:00 (4:00 PM)
        start_dt = timezone.make_aware(datetime.combine(target_date, time(16, 0)), dt_timezone.utc)
        end_dt = start_dt + timedelta(minutes=30)
        appt = Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            start_time=start_dt,
            end_time=end_dt,
            status=AppointmentStatus.BOOKED
        )

        # Doctor shortens shift to end at 15:00 (3:00 PM)
        flagged_count = audit_working_hours_shift_change(
            doctor=doctor,
            day_of_week=target_date.weekday(),
            new_start_time=time(9, 0),
            new_end_time=time(15, 0)
        )

        appt.refresh_from_db()
        assert flagged_count == 1
        assert appt.status == AppointmentStatus.NEEDS_RESCHEDULE
        assert "Doctor Shift Schedule Change" in appt.cancellation_reason
