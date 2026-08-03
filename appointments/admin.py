from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Doctor, DoctorWorkingHours, DoctorTimeOff, Appointment


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile Settings', {'fields': ('role', 'timezone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Profile Settings', {'fields': ('role', 'timezone')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'timezone', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'slot_duration_minutes', 'is_active')
    list_filter = ('is_active', 'specialization')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'specialization')


@admin.register(DoctorWorkingHours)
class DoctorWorkingHoursAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week', 'doctor')


@admin.register(DoctorTimeOff)
class DoctorTimeOffAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'start_datetime', 'end_datetime', 'reason')
    list_filter = ('doctor',)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'doctor', 'start_time')
    search_fields = ('patient__username', 'patient__email', 'doctor__user__username')
