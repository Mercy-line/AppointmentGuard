import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Doctor(models.Model):
    """
    Doctor profile entity linked 1:1 with CustomUser.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )
    specialization = models.CharField(max_length=100, default='General Practice')
    slot_duration_minutes = models.PositiveIntegerField(
        default=30,
        help_text="Standard appointment slot duration in minutes (Default: 30 mins)."
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Determines if the doctor is currently accepting bookings."
    )

    def __str__(self):
        name = self.user.get_full_name() or self.user.username
        return f"Dr. {name} - {self.specialization}"


class DayOfWeek(models.IntegerChoices):
    MONDAY = 0, 'Monday'
    TUESDAY = 1, 'Tuesday'
    WEDNESDAY = 2, 'Wednesday'
    THURSDAY = 3, 'Thursday'
    FRIDAY = 4, 'Friday'
    SATURDAY = 5, 'Saturday'
    SUNDAY = 6, 'Sunday'


class DoctorWorkingHours(models.Model):
    """
    Defines weekly recurring working hours for a doctor per day of week.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='working_hours'
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField(help_text="Daily shift start time (e.g. 09:00:00)")
    end_time = models.TimeField(help_text="Daily shift end time (e.g. 17:00:00)")

    class Meta:
        ordering = ['day_of_week', 'start_time']
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'day_of_week'],
                name='unique_doctor_working_hours_per_day'
            )
        ]

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be strictly before end time.")

    def __str__(self):
        day_name = DayOfWeek(self.day_of_week).label
        return f"{self.doctor}: {day_name} {self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"


class DoctorTimeOff(models.Model):
    """
    Captures non-recurring blackout windows (emergency leave, holidays, breaks) for a doctor.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='time_offs'
    )
    start_datetime = models.DateTimeField(help_text="UTC start timestamp for time-off period")
    end_datetime = models.DateTimeField(help_text="UTC end timestamp for time-off period")
    reason = models.TextField(blank=True, help_text="Reason for time off (e.g., Medical Emergency)")

    class Meta:
        ordering = ['start_datetime']

    def clean(self):
        if self.start_datetime >= self.end_datetime:
            raise ValidationError("Time off start must be strictly before end datetime.")

    def __str__(self):
        return f"{self.doctor} Time Off ({self.start_datetime} to {self.end_datetime})"
