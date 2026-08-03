import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from .doctor import Doctor


class AppointmentStatus(models.TextChoices):
    BOOKED = 'BOOKED', 'Booked'
    CANCELLED = 'CANCELLED', 'Cancelled'
    NEEDS_RESCHEDULE = 'NEEDS_RESCHEDULE', 'Needs Reschedule'


class Appointment(models.Model):
    """
    Represents a 30-minute appointment between a patient and a doctor.
    Supports guardian booking on behalf of under-18 minor dependents.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_appointments'
    )
    booked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='initiated_bookings',
        help_text="User (e.g. Parent/Guardian) who initiated the booking."
    )
    start_time = models.DateTimeField(db_index=True, help_text="UTC start timestamp")
    end_time = models.DateTimeField(db_index=True, help_text="UTC end timestamp")
    status = models.CharField(
        max_length=20,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.BOOKED,
        db_index=True
    )
    cancellation_reason = models.TextField(blank=True, null=True)
    notification_sent = models.BooleanField(
        default=False,
        help_text="Flag indicating if a cancellation/reschedule notification was dispatched to patient."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_time']
        constraints = [
            # Hard database-level anti-double booking constraint for active bookings
            models.UniqueConstraint(
                fields=['doctor', 'start_time'],
                condition=models.Q(status='BOOKED'),
                name='unique_active_booking_per_doctor_slot'
            )
        ]

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("Appointment start_time must be before end_time.")

    def __str__(self):
        return f"Appointment: {self.patient} with {self.doctor} at {self.start_time} [{self.status}]"
