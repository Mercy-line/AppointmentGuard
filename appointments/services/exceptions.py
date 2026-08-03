from django.core.exceptions import ValidationError


class AppointmentGuardError(ValidationError):
    """Base exception for AppointmentGuard domain errors."""
    pass


class SlotUnavailableError(AppointmentGuardError):
    """Raised when a target slot is already booked or un-bookable."""
    pass


class InvalidBookingTimeError(AppointmentGuardError):
    """Raised when booking time violates working hours or advance notice rules."""
    pass


class DependentBookingError(AppointmentGuardError):
    """Raised when family member booking violates minor dependent rules."""
    pass
