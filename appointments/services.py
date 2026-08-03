from datetime import datetime, timedelta, time
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Doctor, DoctorWorkingHours, DoctorTimeOff, Appointment, AppointmentStatus, UserRole


def get_doctor_available_slots(doctor_id, target_date):
    """
    Computes all available 30-minute slots for a doctor on a given target date.
    
    Rules applied:
    - Must fall strictly within DoctorWorkingHours for that day of week.
    - Must not overlap with active BOOKED appointments.
    - Must not overlap with DoctorTimeOff blackout windows.
    - Must be at least 1 hour in advance of current system time.
    """
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
    except Doctor.DoesNotExist:
        raise ValidationError("Active doctor not found.")

    day_of_week = target_date.weekday()  # 0=Monday, 6=Sunday
    try:
        working_hours = DoctorWorkingHours.objects.get(doctor=doctor, day_of_week=day_of_week)
    except DoctorWorkingHours.DoesNotExist:
        return []  # Doctor does not work on this day

    shift_start = timezone.make_aware(
        datetime.combine(target_date, working_hours.start_time),
        timezone.utc
    )
    shift_end = timezone.make_aware(
        datetime.combine(target_date, working_hours.end_time),
        timezone.utc
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

    # Scan for conflicting active bookings and flag them with NEEDS_RESCHEDULE
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
        appt.save()
        flagged_count += 1

    return time_off, flagged_count


@transaction.atomic
def book_appointment(patient, doctor_id, start_time):
    """
    Books a 30-minute appointment safely using pessimistic row-locking (select_for_update)
    to guarantee race condition prevention.
    """
    try:
        doctor = Doctor.objects.select_for_update().get(id=doctor_id, is_active=True)
    except Doctor.DoesNotExist:
        raise ValidationError("Target doctor does not exist or is inactive.")

    if not isinstance(start_time, datetime):
        raise ValidationError("Invalid datetime format.")

    if timezone.is_naive(start_time):
        start_time = timezone.make_aware(start_time, timezone.utc)

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
        timezone.utc
    )
    shift_end = timezone.make_aware(
        datetime.combine(start_time.date(), working_hours.end_time),
        timezone.utc
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
        doctor=doctor,
        start_time=start_time,
        end_time=end_time,
        status=AppointmentStatus.BOOKED
    )
    return appointment


@transaction.atomic
def cancel_appointment(appointment_id, user, reason):
    """
    Cancels an existing appointment with a reason.
    Frees the slot immediately for future bookings.
    """
    if not reason or not str(reason).strip():
        raise ValidationError("A cancellation reason is required.")

    try:
        appointment = Appointment.objects.select_for_update().get(id=appointment_id)
    except Appointment.DoesNotExist:
        raise ValidationError("Appointment not found.")

    is_patient = appointment.patient == user
    is_doctor = hasattr(user, 'doctor_profile') and appointment.doctor == user.doctor_profile
    is_admin = user.is_staff or user.role == UserRole.ADMIN

    if not (is_patient or is_doctor or is_admin):
        raise ValidationError("You do not have permission to cancel this appointment.")

    if appointment.status == AppointmentStatus.CANCELLED:
        raise ValidationError("This appointment has already been cancelled.")

    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancellation_reason = reason.strip()
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

    is_patient = appointment.patient == user
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
        new_start_time = timezone.make_aware(new_start_time, timezone.utc)

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
        timezone.utc
    )
    shift_end = timezone.make_aware(
        datetime.combine(new_start_time.date(), working_hours.end_time),
        timezone.utc
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
