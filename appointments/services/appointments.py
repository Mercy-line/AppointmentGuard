from datetime import datetime, timedelta, timezone as dt_timezone
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from ..models import Doctor, DoctorWorkingHours, DoctorTimeOff, Appointment, AppointmentStatus, UserRole


@transaction.atomic
def cancel_appointment(appointment_id, user, reason):
    """
    Cancels an existing appointment with a reason.
    If initiated by a doctor, dispatches a patient notification flag.
    """
    if not reason or not str(reason).strip():
        raise ValidationError("A cancellation reason is required.")

    try:
        appointment = Appointment.objects.select_for_update().get(id=appointment_id)
    except Appointment.DoesNotExist:
        raise ValidationError("Appointment not found.")

    is_patient = appointment.patient == user or appointment.booked_by == user
    is_doctor = hasattr(user, 'doctor_profile') and appointment.doctor == user.doctor_profile
    is_admin = user.is_staff or user.role == UserRole.ADMIN

    if not (is_patient or is_doctor or is_admin):
        raise ValidationError("You do not have permission to cancel this appointment.")

    if appointment.status == AppointmentStatus.CANCELLED:
        raise ValidationError("This appointment has already been cancelled.")

    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancellation_reason = reason.strip()

    if is_doctor or is_admin:
        appointment.notification_sent = True

    appointment.save()
    return appointment


@transaction.atomic
def reschedule_appointment(appointment_id, user, new_start_time):
    """
    Reschedules an existing appointment to a new slot.
    Validates new slot rules and frees original slot atomically.
    """
    try:
        appointment = Appointment.objects.select_for_update().get(id=appointment_id)
    except Appointment.DoesNotExist:
        raise ValidationError("Appointment not found.")

    is_patient = appointment.patient == user or appointment.booked_by == user
    is_doctor = hasattr(user, 'doctor_profile') and appointment.doctor == user.doctor_profile
    is_admin = user.is_staff or user.role == UserRole.ADMIN

    if not (is_patient or is_doctor or is_admin):
        raise ValidationError("You do not have permission to reschedule this appointment.")

    if appointment.status == AppointmentStatus.CANCELLED:
        raise ValidationError("Cannot reschedule an appointment that has been cancelled.")

    doctor = Doctor.objects.select_for_update().get(id=appointment.doctor.id)

    if not isinstance(new_start_time, datetime):
        raise ValidationError("Invalid datetime format.")

    if timezone.is_naive(new_start_time):
        new_start_time = timezone.make_aware(new_start_time, dt_timezone.utc)

    now = timezone.now()
    if new_start_time < now + timedelta(hours=1):
        raise ValidationError("Rescheduled appointment must be at least 1 hour in advance.")

    slot_duration = timedelta(minutes=doctor.slot_duration_minutes)
    new_end_time = new_start_time + slot_duration

    day_of_week = new_start_time.weekday()
    try:
        working_hours = DoctorWorkingHours.objects.get(doctor=doctor, day_of_week=day_of_week)
    except DoctorWorkingHours.DoesNotExist:
        raise ValidationError("Doctor does not work on the requested day of week.")

    shift_start = timezone.make_aware(
        datetime.combine(new_start_time.date(), working_hours.start_time),
        dt_timezone.utc
    )
    shift_end = timezone.make_aware(
        datetime.combine(new_start_time.date(), working_hours.end_time),
        dt_timezone.utc
    )

    if new_start_time < shift_start or new_end_time > shift_end:
        raise ValidationError("Rescheduled slot falls outside doctor's working hours.")

    overlapping_time_off = DoctorTimeOff.objects.filter(
        doctor=doctor,
        start_datetime__lt=new_end_time,
        end_datetime__gt=new_start_time
    ).exists()
    if overlapping_time_off:
        raise ValidationError("Doctor has scheduled time off during the requested slot.")

    overlapping = Appointment.objects.filter(
        doctor=doctor,
        status=AppointmentStatus.BOOKED,
        start_time__lt=new_end_time,
        end_time__gt=new_start_time
    ).exclude(id=appointment.id).exists()

    if overlapping:
        raise ValidationError("The requested new slot is already booked.")

    appointment.start_time = new_start_time
    appointment.end_time = new_end_time
    appointment.status = AppointmentStatus.BOOKED
    appointment.save()

    return appointment
