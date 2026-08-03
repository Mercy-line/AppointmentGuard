import uuid
from datetime import date
from django.db import models
from django.contrib.auth.models import AbstractUser


class UserRole(models.TextChoices):
    PATIENT = 'PATIENT', 'Patient'
    DOCTOR = 'DOCTOR', 'Doctor'
    ADMIN = 'ADMIN', 'Admin'


class CustomUser(AbstractUser):
    """
    Custom User model supporting Role-Based Access Control (RBAC),
    dependent child management for under-18 family bookings, and timezone preferences.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.PATIENT,
        help_text="Role determining user permissions in AppointmentGuard."
    )
    timezone = models.CharField(
        max_length=50,
        default='UTC',
        help_text="User's preferred timezone identifier (e.g. 'UTC', 'Africa/Nairobi')."
    )
    date_of_birth = models.DateField(
        null=True,
        blank=True,
        help_text="Date of birth for age verification (Under 18 dependent rule)."
    )
    parent_guardian = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dependents',
        help_text="Parent or legal guardian for minor dependents."
    )

    def is_doctor(self):
        return self.role == UserRole.DOCTOR or hasattr(self, 'doctor_profile')

    def is_patient(self):
        return self.role == UserRole.PATIENT

    def is_minor(self):
        if not self.date_of_birth:
            return False
        today = date.today()
        age = today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return age < 18

    def __str__(self):
        full_name = self.get_full_name()
        return f"{full_name or self.username} ({self.role})"
