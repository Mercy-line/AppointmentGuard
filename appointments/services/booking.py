from datetime import datetime, timedelta, timezone as dt_timezone
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from ..models import Doctor, DoctorWorkingHours, DoctorTimeOff, Appointment, AppointmentStatus, UserRole


@transaction.atomic
def book_appointment(patient, doctor_id, start_time, booked_by=None):
    """
    Books a 30-minute appointment safely using pessimistic row-locking (select_for_update).
    Supports parent/guardian booking on behalf of under-18 minor dependents.
    """
    try:
        doctor = Doctor.objects.select_for_update().get(id=doctor_id, is_active=True)
    except Doctor.DoesNotExist:
        raise ValidationError("Target doctor does not exist or is inactive.")

    if booked_by and booked_by != patient:
        if not patient.is_minor() and patient.parent_guardian != booked_by:
            raise ValidationError("Family members can only book appointments on behalf of minor dependents (under 18 years old).")

    if not isinstance(start_time, datetime):
        raise ValidationError("Invalid datetime format.")

    if timezone.is_naive(start_time):
        start_time = timezone.make_aware(start_time, dt_timezone.utc)

    now = timezone.now()
    if start_time < now + timedelta(hours=1):
        raise ValidationError("Appointments must be booked at least 1 hour in advance.")

    slot_duration = timedelta(minutes=doctor.slot_duration_minutes)
    end_time = start_time + slot_duration

    day_of_week = start_time.weekday()
    try:
        working_hours = DoctorWorkingHours.objects.get(doctor=doctor, day_of_week=day_of_week)
    except DoctorWorkingHours.DoesNotExist:
        raise ValidationError("Doctor does not work on this day of the week.")

    shift_start = timezone.make_aware(
        datetime.combine(start_time.date(), working_hours.start_time),
        dt_timezone.utc
    )
    shift_end = timezone.make_aware(
        datetime.combine(start_time.date(), working_hours.end_time),
        dt_timezone.utc
    )

    if start_time < shift_start or end_time > shift_end:
        raise ValidationError("Requested appointment time falls outside doctor's working hours.")

    overlapping_time_off = DoctorTimeOff.objects.filter(
        doctor=doctor,
        start_datetime__lt=end_time,
        end_datetime__gt=start_time
    ).exists()
    if overlapping_time_off:
        raise ValidationError("Doctor has scheduled time off during this slot.")

    overlapping_appointment = Appointment.objects.filter(
        doctor=doctor,
        status=AppointmentStatus.BOOKED,
        start_time__lt=end_time,
        end_time__gt=start_time
    ).exists()
    if overlapping_appointment:
        raise ValidationError("This time slot is already booked.")

    appointment = Appointment.objects.create(
        patient=patient,
        booked_by=booked_by or patient,
        doctor=doctor,
        start_time=start_time,
        end_time=end_time,
        status=AppointmentStatus.BOOKED
    )
    return appointment
