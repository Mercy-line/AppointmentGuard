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


class LoginAPIView(APIView):
    """
    POST /api/auth/login/ — Authenticates a clinic user (Patient, Doctor, Admin) via email & password against database.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email_or_username = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()

        if not email_or_username or not password:
            return Response({'error': 'Email address and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Lookup user by email or username (case-insensitive)
        user = CustomUser.objects.filter(email__iexact=email_or_username).first()
        if not user:
            user = CustomUser.objects.filter(username__iexact=email_or_username).first()

        if user and user.check_password(password):
            specialization = None
            if hasattr(user, 'doctor_profile'):
                specialization = user.doctor_profile.specialization

            full_name = user.get_full_name() or user.username
            if not full_name.strip():
                full_name = user.username

            return Response({
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'name': full_name,
                'role': user.role,
                'specialization': specialization
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid email address or password. Please check your credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


class RegisterAPIView(APIView):
    """
    POST /api/auth/register/ — Creates a new clinic user (Patient, Doctor, Admin) in the database.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
        name = request.data.get('name', '').strip()
        role = request.data.get('role', 'PATIENT').strip().upper()
        specialization = request.data.get('specialization', 'General Practice').strip()

        if not email or not password or not name:
            return Response({'error': 'Full name, email address, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({'error': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        if role not in ['PATIENT', 'DOCTOR', 'ADMIN']:
            return Response({'error': 'Invalid role specified.'}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(email__iexact=email).exists():
            return Response({'error': 'An account with this email address already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a unique username from email
        base_username = email.split('@')[0].replace('.', '_')
        username = base_username
        counter = 1
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        name_parts = name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role
        )

        if role == 'DOCTOR':
            Doctor.objects.get_or_create(
                user=user,
                defaults={'specialization': specialization, 'slot_duration_minutes': 30, 'is_active': True}
            )

        full_name = user.get_full_name() or user.username

        return Response({
            'id': str(user.id),
            'email': user.email,
            'username': user.username,
            'name': full_name,
            'role': user.role,
            'specialization': specialization if role == 'DOCTOR' else None
        }, status=status.HTTP_201_CREATED)


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
