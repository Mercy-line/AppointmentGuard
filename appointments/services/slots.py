from datetime import datetime, timedelta, timezone as dt_timezone
from django.utils import timezone
from django.core.exceptions import ValidationError
from ..models import Doctor, DoctorWorkingHours, DoctorTimeOff, Appointment, AppointmentStatus


def calculate_30_min_slots(doctor, target_date):
    """
    Computes available 30-minute grid slots for a doctor on a given target date.
    """
    day_of_week = target_date.weekday()
    try:
        working_hours = DoctorWorkingHours.objects.get(doctor=doctor, day_of_week=day_of_week)
    except DoctorWorkingHours.DoesNotExist:
        return []

    shift_start = timezone.make_aware(
        datetime.combine(target_date, working_hours.start_time),
        dt_timezone.utc
    )
    shift_end = timezone.make_aware(
        datetime.combine(target_date, working_hours.end_time),
        dt_timezone.utc
    )

    slot_duration = timedelta(minutes=doctor.slot_duration_minutes)
    now = timezone.now()
    min_allowed_booking_time = now + timedelta(hours=1)

    booked_appointments = list(Appointment.objects.filter(
        doctor=doctor,
        status=AppointmentStatus.BOOKED,
        start_time__lt=shift_end,
        end_time__gt=shift_start
    ))

    time_offs = list(DoctorTimeOff.objects.filter(
        doctor=doctor,
        start_datetime__lt=shift_end,
        end_datetime__gt=shift_start
    ))

    available_slots = []
    current_slot_start = shift_start

    while current_slot_start + slot_duration <= shift_end:
        current_slot_end = current_slot_start + slot_duration

        if current_slot_start < min_allowed_booking_time:
            current_slot_start += slot_duration
            continue

        is_booked = any(
            appt.start_time < current_slot_end and appt.end_time > current_slot_start
            for appt in booked_appointments
        )
        if is_booked:
            current_slot_start += slot_duration
            continue

        is_time_off = any(
            to.start_datetime < current_slot_end and to.end_datetime > current_slot_start
            for to in time_offs
        )
        if is_time_off:
            current_slot_start += slot_duration
            continue

        available_slots.append({
            'start_time': current_slot_start.isoformat(),
            'end_time': current_slot_end.isoformat(),
            'duration_minutes': doctor.slot_duration_minutes
        })

        current_slot_start += slot_duration

    return available_slots
