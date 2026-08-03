from datetime import datetime, timedelta, timezone as dt_timezone
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from ..models import Doctor, DoctorWorkingHours, DoctorTimeOff, Appointment, AppointmentStatus
from .slots import calculate_30_min_slots


def get_doctor_available_slots(doctor_id, target_date):
    """
    Public entrypoint for doctor available slot calculations.
    """
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
    except Doctor.DoesNotExist:
        raise ValidationError("Active doctor not found.")

    return calculate_30_min_slots(doctor, target_date)


@transaction.atomic
def create_doctor_time_off(doctor, start_datetime, end_datetime, reason):
    """
    Creates a DoctorTimeOff blackout window and flags any conflicting existing 
    booked appointments with status NEEDS_RESCHEDULE (Patterns B & C).
    """
    if start_datetime >= end_datetime:
        raise ValidationError("Start datetime must be strictly before end datetime.")

    time_off = DoctorTimeOff.objects.create(
        doctor=doctor,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        reason=reason
    )

    conflicting = Appointment.objects.filter(
        doctor=doctor,
        status=AppointmentStatus.BOOKED,
        start_time__lt=end_datetime,
        end_time__gt=start_datetime
    )

    flagged_count = 0
    for appt in conflicting:
        appt.status = AppointmentStatus.NEEDS_RESCHEDULE
        appt.cancellation_reason = f"Doctor Emergency Time-Off ({reason}) — Priority Reschedule Required."
        appt.notification_sent = True
        appt.save()
        flagged_count += 1

    return time_off, flagged_count


@transaction.atomic
def audit_working_hours_shift_change(doctor, day_of_week, new_start_time, new_end_time):
    """
    Audits existing active bookings when a doctor alters their working hours.
    Flags any future active booking falling outside the new shift bounds with NEEDS_RESCHEDULE.
    """
    now = timezone.now()
    future_appointments = Appointment.objects.filter(
        doctor=doctor,
        status=AppointmentStatus.BOOKED,
        start_time__gte=now
    )

    flagged_count = 0
    for appt in future_appointments:
        if appt.start_time.weekday() == day_of_week:
            appt_start = appt.start_time.time()
            appt_end = appt.end_time.time()

            if appt_start < new_start_time or appt_end > new_end_time:
                appt.status = AppointmentStatus.NEEDS_RESCHEDULE
                appt.cancellation_reason = "Doctor Shift Schedule Change — Priority Reschedule Required."
                appt.notification_sent = True
                appt.save()
                flagged_count += 1

    return flagged_count
