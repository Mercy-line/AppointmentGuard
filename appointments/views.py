from datetime import datetime
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.exceptions import ValidationError as DRFValidationError

from .models import Doctor, Appointment, CustomUser, AppointmentStatus
from .serializers import (
    DoctorSerializer,
    AppointmentSerializer,
    BookAppointmentSerializer,
    CancelAppointmentSerializer,
    RescheduleAppointmentSerializer
)
from .services import (
    get_doctor_available_slots,
    book_appointment,
    cancel_appointment,
    reschedule_appointment
)


class DoctorListAPIView(APIView):
    """
    GET /api/doctors/ — Returns a list of active doctors.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        doctors = Doctor.objects.filter(is_active=True).select_related('user')
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DoctorAvailabilityAPIView(APIView):
    """
    GET /api/doctors/{id}/availability/ — Returns all available 30-minute slots for a doctor on a given date.
    Query param: ?date=YYYY-MM-DD
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        date_str = request.query_params.get('date')
        if not date_str:
            target_date = timezone.now().date()
        else:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD format.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            available_slots = get_doctor_available_slots(pk, target_date)
            return Response({
                'doctor_id': str(pk),
                'date': target_date.strftime('%Y-%m-%d'),
                'available_slots_count': len(available_slots),
                'available_slots': available_slots
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({'error': str(e.message if hasattr(e, 'message') else e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class BookAppointmentAPIView(APIView):
    """
    POST /api/appointments/ — Books a 30-minute appointment slot.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = BookAppointmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid request data', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        doctor_id = serializer.validated_data['doctor_id']
        start_time = serializer.validated_data['start_time']

        try:
            appointment = book_appointment(
                patient=request.user,
                doctor_id=doctor_id,
                start_time=start_time
            )
            response_serializer = AppointmentSerializer(appointment)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            err_msg = str(e.message if hasattr(e, 'message') else e.messages[0] if hasattr(e, 'messages') else e)
            if "already booked" in err_msg.lower():
                return Response({'error': err_msg}, status=status.HTTP_409_CONFLICT)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CancelAppointmentAPIView(APIView):
    """
    PATCH /api/appointments/{id}/cancel/ — Cancels an appointment with a reason.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        serializer = CancelAppointmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Reason is required', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        reason = serializer.validated_data['reason']

        try:
            appointment = cancel_appointment(
                appointment_id=pk,
                user=request.user,
                reason=reason
            )
            response_serializer = AppointmentSerializer(appointment)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            err_msg = str(e.message if hasattr(e, 'message') else e.messages[0] if hasattr(e, 'messages') else e)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RescheduleAppointmentAPIView(APIView):
    """
    PATCH /api/appointments/{id}/reschedule/ — Moves an appointment to a new slot.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        serializer = RescheduleAppointmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'New start time is required', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        new_start_time = serializer.validated_data['new_start_time']

        try:
            appointment = reschedule_appointment(
                appointment_id=pk,
                user=request.user,
                new_start_time=new_start_time
            )
            response_serializer = AppointmentSerializer(appointment)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            err_msg = str(e.message if hasattr(e, 'message') else e.messages[0] if hasattr(e, 'messages') else e)
            if "already booked" in err_msg.lower():
                return Response({'error': err_msg}, status=status.HTTP_409_CONFLICT)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PatientUpcomingAppointmentsAPIView(APIView):
    """
    GET /api/patients/{id}/appointments/ — Returns upcoming appointments for a patient sorted by date.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        # Authorization check: user must be target patient, doctor, or staff
        if str(request.user.id) != str(pk) and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to view this patient\'s appointments.'},
                status=status.HTTP_403_FORBIDDEN
            )

        now = timezone.now()
        appointments = Appointment.objects.filter(
            patient_id=pk,
            start_time__gte=now
        ).select_related('doctor', 'doctor__user', 'patient').order_by('start_time')

        serializer = AppointmentSerializer(appointments, many=True)
        return Response({
            'patient_id': str(pk),
            'upcoming_count': len(appointments),
            'appointments': serializer.data
        }, status=status.HTTP_200_OK)
