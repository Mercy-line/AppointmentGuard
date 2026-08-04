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
    Serializer for Doctor profiles with helper fields for frontend UI sync.
    """
    user = UserSerializer(read_only=True)
    working_hours = DoctorWorkingHoursSerializer(many=True, read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    avatarInitials = serializers.SerializerMethodField()
    hours = serializers.SerializerMethodField()
    slotDurationMinutes = serializers.IntegerField(source='slot_duration_minutes', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'name', 'email', 'specialization', 
            'avatarInitials', 'hours', 'slotDurationMinutes', 
            'is_active', 'working_hours'
        ]

    def get_name(self, obj):
        if obj.user.first_name or obj.user.last_name:
            return f"Dr. {obj.user.first_name} {obj.user.last_name}".strip()
        return f"Dr. {obj.user.username}"

    def get_email(self, obj):
        return obj.user.email

    def get_avatarInitials(self, obj):
        f = (obj.user.first_name or '')[:1].upper()
        l = (obj.user.last_name or '')[:1].upper()
        initials = f + l
        return initials if initials else 'DR'

    def get_hours(self, obj):
        wh_qs = obj.working_hours.all()
        if wh_qs.exists():
            days = [wh.get_day_of_week_display()[:3] for wh in wh_qs]
            start = wh_qs.first().start_time.strftime('%I:%M %p').lstrip('0')
            end = wh_qs.first().end_time.strftime('%I:%M %p').lstrip('0')
            return f"{days[0]}–{days[-1]}, {start} – {end}"
        return "Mon–Fri, 9:00 AM – 5:00 PM"
