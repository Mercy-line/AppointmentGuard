from rest_framework import serializers
from ..models import Appointment
from .user import UserSerializer
from .doctor import DoctorSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Serializer for detailed Appointment representation.
    """
    patient = UserSerializer(read_only=True)
    booked_by = UserSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor', 'patient', 'booked_by', 'start_time', 'end_time',
            'status', 'cancellation_reason', 'notification_sent', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'notification_sent']


class BookAppointmentSerializer(serializers.Serializer):
    """
    Serializer for validating booking request payloads.
    """
    doctor_id = serializers.UUIDField(required=True)
    start_time = serializers.DateTimeField(required=True)
    patient_id = serializers.UUIDField(required=False, allow_null=True)


class CancelAppointmentSerializer(serializers.Serializer):
    """
    Serializer for validating cancellation payloads.
    """
    reason = serializers.CharField(required=True, min_length=3, max_length=500)


class RescheduleAppointmentSerializer(serializers.Serializer):
    """
    Serializer for validating rescheduling payloads.
    """
    new_start_time = serializers.DateTimeField(required=True)
