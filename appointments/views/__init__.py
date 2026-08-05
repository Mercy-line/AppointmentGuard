from .web import (
    dashboard_view,
    doctor_dashboard_view,
    add_doctor_time_off_view,
    login_view,
    logout_view,
)
from .api import (
    DoctorListAPIView,
    DoctorAvailabilityAPIView,
    BookAppointmentAPIView,
    CancelAppointmentAPIView,
    RescheduleAppointmentAPIView,
    PatientUpcomingAppointmentsAPIView,
    LoginAPIView,
    RegisterAPIView,
)

__all__ = [
    'dashboard_view',
    'doctor_dashboard_view',
    'add_doctor_time_off_view',
    'login_view',
    'logout_view',
    'DoctorListAPIView',
    'DoctorAvailabilityAPIView',
    'BookAppointmentAPIView',
    'CancelAppointmentAPIView',
    'RescheduleAppointmentAPIView',
    'PatientUpcomingAppointmentsAPIView',
    'LoginAPIView',
    'RegisterAPIView',
]
