from django.urls import path
from .views import (
    dashboard_view,
    doctor_dashboard_view,
    add_doctor_time_off_view,
    login_view,
    logout_view,
    DoctorListAPIView,
    DoctorAvailabilityAPIView,
    BookAppointmentAPIView,
    CancelAppointmentAPIView,
    RescheduleAppointmentAPIView,
    PatientUpcomingAppointmentsAPIView,
    LoginAPIView,
    RegisterAPIView
)

app_name = 'appointments'

urlpatterns = [
    # UI Web Dashboard & Portal Routes
    path('', dashboard_view, name='dashboard'),
    path('doctor-dashboard/', doctor_dashboard_view, name='doctor-dashboard'),
    path('add-time-off/', add_doctor_time_off_view, name='add-time-off'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),

    # Required Section 2 REST API Endpoints
    path('doctors/', DoctorListAPIView.as_view(), name='doctor-list'),
    path('doctors/<uuid:pk>/availability/', DoctorAvailabilityAPIView.as_view(), name='doctor-availability'),
    path('appointments/', BookAppointmentAPIView.as_view(), name='book-appointment'),
    path('appointments/<uuid:pk>/cancel/', CancelAppointmentAPIView.as_view(), name='cancel-appointment'),
    path('appointments/<uuid:pk>/reschedule/', RescheduleAppointmentAPIView.as_view(), name='reschedule-appointment'),
    path('patients/<uuid:pk>/appointments/', PatientUpcomingAppointmentsAPIView.as_view(), name='patient-appointments'),

    # API Auth Routes
    path('api/auth/login/', LoginAPIView.as_view(), name='api-login'),
    path('api/auth/register/', RegisterAPIView.as_view(), name='api-register'),

    # API Alias Routes with /api/ prefix
    path('api/doctors/', DoctorListAPIView.as_view(), name='api-doctor-list'),
    path('api/doctors/<uuid:pk>/availability/', DoctorAvailabilityAPIView.as_view(), name='api-doctor-availability'),
    path('api/appointments/', BookAppointmentAPIView.as_view(), name='api-book-appointment'),
    path('api/appointments/<uuid:pk>/cancel/', CancelAppointmentAPIView.as_view(), name='api-cancel-appointment'),
    path('api/appointments/<uuid:pk>/reschedule/', RescheduleAppointmentAPIView.as_view(), name='api-reschedule-appointment'),
    path('api/patients/<uuid:pk>/appointments/', PatientUpcomingAppointmentsAPIView.as_view(), name='api-patient-appointments'),
]
