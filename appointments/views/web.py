from datetime import datetime, date
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from ..models import Doctor, Appointment, CustomUser, UserRole
from ..services import create_doctor_time_off


def dashboard_view(request):
    """
    Renders the Patient Booking Dashboard UI.
    """
    doctors = Doctor.objects.filter(is_active=True)
    default_date = date.today().isoformat()
    return render(request, 'dashboard.html', {
        'doctors': doctors,
        'default_date': default_date
    })


def doctor_dashboard_view(request):
    """
    Renders the Doctor Portal schedule dashboard and time-off form.
    """
    doctors = Doctor.objects.filter(is_active=True)
    appointments = Appointment.objects.all().order_by('-start_time')
    return render(request, 'doctor_dashboard.html', {
        'doctors': doctors,
        'appointments': appointments
    })


def add_doctor_time_off_view(request):
    """
    Processes form submissions for creating a DoctorTimeOff blackout window.
    """
    if request.method == 'POST':
        doctor_id = request.POST.get('doctor_id')
        start_str = request.POST.get('start_datetime')
        end_str = request.POST.get('end_datetime')
        reason = request.POST.get('reason', '')

        try:
            doctor = Doctor.objects.get(id=doctor_id)
            start_dt = timezone.make_aware(datetime.fromisoformat(start_str), timezone.utc)
            end_dt = timezone.make_aware(datetime.fromisoformat(end_str), timezone.utc)

            time_off, flagged_count = create_doctor_time_off(
                doctor=doctor,
                start_datetime=start_dt,
                end_datetime=end_dt,
                reason=reason
            )

            if flagged_count > 0:
                messages.warning(
                    request,
                    f"Time off declared successfully. {flagged_count} conflicting appointment(s) "
                    f"were automatically flagged as NEEDS_RESCHEDULE for patient notification."
                )
            else:
                messages.success(request, "Doctor time off added successfully with zero appointment conflicts.")

        except Exception as e:
            messages.error(request, f"Failed to add time off: {str(e)}")

    return redirect('appointments:doctor-dashboard')


def login_view(request):
    """
    User Sign-In template view.
    """
    if request.method == 'POST':
        user = authenticate(
            username=request.POST.get('username'),
            password=request.POST.get('password')
        )
        if user:
            login(request, user)
            return redirect('appointments:dashboard')
        messages.error(request, "Invalid username or password.")
    return render(request, 'login.html')


def logout_view(request):
    """
    User Sign-Out template view.
    """
    logout(request)
    return redirect('appointments:dashboard')
