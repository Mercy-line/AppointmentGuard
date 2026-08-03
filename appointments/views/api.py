from datetime import datetime, date
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.exceptions import ValidationError
from ..models import Doctor, Appointment, CustomUser
from ..serializers import (
    DoctorSerializer,
    AppointmentSerializer,
    BookAppointmentSerializer,
    CancelAppointmentSerializer,
    RescheduleAppointmentSerializer
)
from ..services import (
    get_doctor_available_slots,
    book_appointment,
    cancel_appointment,
    reschedule_appointment
)


class DoctorListAPIView(APIView):
    """
    GET /api/doctors/ — Returns a list of active doctors in the clinic.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        doctors = Doctor.objects.filter(is_active=True)
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DoctorAvailabilityAPIView(APIView):
    """
    GET /api/doctors/{id}/availability/?date=YYYY-MM-DD
    Computes and returns available 30-minute booking slots for a doctor on a target date.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None, doctor_id=None):
        target_doctor_id = pk or doctor_id
        date_str = request.query_params.get('date')

        if not date_str:
            target_date = date.today()
        else:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            available_slots = get_doctor_available_slots(target_doctor_id, target_date)
            return Response({
                'doctor_id': str(target_doctor_id),
                'date': target_date.isoformat(),
                'available_slots': available_slots
            }, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': e.message}, status=status.HTTP_400_BAD_REQUEST)


class BookAppointmentAPIView(APIView):
    """
    POST /api/appointments/ — Books a 30-minute appointment using pessimistic locking.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = BookAppointmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        doctor_id = serializer.validated_data['doctor_id']
        start_time = serializer.validated_data['start_time']
        target_patient_id = serializer.validated_data.get('patient_id')

        if target_patient_id:
            try:
                patient = CustomUser.objects.get(id=target_patient_id)
            except CustomUser.DoesNotExist:
                return Response({'error': 'Target patient user not found.'}, status=status.HTTP_400_BAD_REQUEST)
        elif request.user.is_authenticated:
            patient = request.user
        else:
            patient = CustomUser.objects.filter(role='PATIENT').first()
            if not patient:
                patient = CustomUser.objects.create_user(
                    username='guest_patient',
                    email='guest@clinic.com',
                    password='Password123!',
                    role='PATIENT'
                )

        booked_by = request.user if request.user.is_authenticated else patient

        try:
            appointment = book_appointment(
                patient=patient,
                doctor_id=doctor_id,
                start_time=start_time,
                booked_by=booked_by
            )
            response_serializer = AppointmentSerializer(appointment)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            err_msg = e.message if hasattr(e, 'message') else str(e)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)


class CancelAppointmentAPIView(APIView):
    """
    PATCH /api/appointments/{id}/cancel/ — Cancels an appointment with a reason.
    """
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        serializer = CancelAppointmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        reason = serializer.validated_data['reason']

        if request.user.is_authenticated:
            user = request.user
        else:
            try:
                appointment_obj = Appointment.objects.get(id=pk)
                user = appointment_obj.patient
            except Appointment.DoesNotExist:
                return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            appointment = cancel_appointment(appointment_id=pk, user=user, reason=reason)
            response_serializer = AppointmentSerializer(appointment)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            err_msg = e.message if hasattr(e, 'message') else str(e)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)


class RescheduleAppointmentAPIView(APIView):
    """
    PATCH /api/appointments/{id}/reschedule/ — Reschedules an appointment to a new slot.
    """
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        serializer = RescheduleAppointmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_start_time = serializer.validated_data['new_start_time']

        if request.user.is_authenticated:
            user = request.user
        else:
            try:
                appointment_obj = Appointment.objects.get(id=pk)
                user = appointment_obj.patient
            except Appointment.DoesNotExist:
                return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            appointment = reschedule_appointment(
                appointment_id=pk,
                user=user,
                new_start_time=new_start_time
            )
            response_serializer = AppointmentSerializer(appointment)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            err_msg = e.message if hasattr(e, 'message') else str(e)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)


class PatientUpcomingAppointmentsAPIView(APIView):
    """
    GET /api/patients/{id}/appointments/ — Fetches a patient's upcoming appointments.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        patient_id = pk
        if str(patient_id) == 'demo':
            patient = CustomUser.objects.filter(role='PATIENT').first()
            if not patient:
                return Response({'appointments': []}, status=status.HTTP_200_OK)
            patient_id = patient.id

        appointments = Appointment.objects.filter(
            patient_id=patient_id
        ).order_by('-start_time')

        serializer = AppointmentSerializer(appointments, many=True)
        return Response({
            'patient_id': str(patient_id),
            'appointments': serializer.data
        }, status=status.HTTP_200_OK)
