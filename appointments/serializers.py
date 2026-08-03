from rest_framework import serializers
from .models import CustomUser, Doctor, DoctorWorkingHours, DoctorTimeOff, Appointment, AppointmentStatus


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'timezone']
        read_only_fields = ['id']


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'user', 'specialization', 'slot_duration_minutes', 'is_active']
        read_only_fields = ['id']


class AppointmentSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor', 'patient', 'start_time', 'end_time',
            'status', 'cancellation_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookAppointmentSerializer(serializers.Serializer):
    doctor_id = serializers.UUIDField(required=True, help_text="UUID of target doctor")
    start_time = serializers.DateTimeField(required=True, help_text="ISO 8601 UTC start time (e.g. 2026-08-03T10:00:00Z)")


class CancelAppointmentSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True, min_length=3, help_text="Reason for cancelling appointment")


class RescheduleAppointmentSerializer(serializers.Serializer):
    new_start_time = serializers.DateTimeField(required=True, help_text="ISO 8601 UTC new start time")
