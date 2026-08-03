from rest_framework import serializers
from ..models import Doctor, DoctorWorkingHours, DoctorTimeOff
from .user import UserSerializer


class DoctorWorkingHoursSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = DoctorWorkingHours
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time']


class DoctorTimeOffSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorTimeOff
        fields = ['id', 'start_datetime', 'end_datetime', 'reason']


class DoctorSerializer(serializers.ModelSerializer):
    """
    Serializer for Doctor profiles including linked user details and working hours.
    """
    user = UserSerializer(read_only=True)
    working_hours = DoctorWorkingHoursSerializer(many=True, read_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'user', 'specialization', 'slot_duration_minutes', 'is_active', 'working_hours']
