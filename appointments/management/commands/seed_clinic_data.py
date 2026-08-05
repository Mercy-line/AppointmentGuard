from datetime import time
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, DoctorWorkingHours

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds initial clinic data with 5 doctors, working hours, and sample patients."

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Refreshing AppointmentGuard clinic data..."))

        # Clean legacy dummy doctor users
        legacy_usernames = ['doctor_alice', 'doctor_bob', 'doctor_charlie', 'doctor_diana', 'doctor_evan']
        User.objects.filter(username__in=legacy_usernames).delete()

        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@appointmentguard.com', 'AdminPass123!', role=UserRole.ADMIN)
            self.stdout.write(self.style.SUCCESS("Created Superuser: admin (pass: AdminPass123!)"))

        # Create sample patient
        if not User.objects.filter(username='patient_john').exists():
            p = User.objects.create_user('patient_john', 'john@patient.com', 'PatientPass123!', role=UserRole.PATIENT, first_name='John', last_name='Doe')
            self.stdout.write(self.style.SUCCESS(f"Created Patient: {p.username} (pass: PatientPass123!)"))

        # 5 Official Doctors Data
        doctors_data = [
            ("dr_alice", "Alice", "Cherop", "dr.alice@clinic.com", "Cardiology"),
            ("dr_john", "John", "Kimani", "dr.john@clinic.com", "General Practice"),
            ("dr_charlie", "Charlie", "Onyancha", "dr.charlie@clinic.com", "Pediatrics"),
            ("dr_diana", "Diana", "Atieno", "dr.diana@clinic.com", "Dermatology"),
            ("dr_evans", "Evans", "Muyoma", "dr.evans@clinic.com", "Orthopedics"),
        ]

        for username, first_name, last_name, email, spec in doctors_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'role': UserRole.DOCTOR,
                    'timezone': 'UTC'
                }
            )
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.set_password('DoctorPass123!')
            user.save()

            doctor, doc_created = Doctor.objects.get_or_create(
                user=user,
                defaults={'specialization': spec, 'slot_duration_minutes': 30, 'is_active': True}
            )
            doctor.specialization = spec
            doctor.is_active = True
            doctor.save()

            # Set working hours for Monday to Friday (0 to 4) 09:00 - 17:00
            for day in range(5):
                DoctorWorkingHours.objects.get_or_create(
                    doctor=doctor,
                    day_of_week=day,
                    defaults={'start_time': time(9, 0), 'end_time': time(17, 0)}
                )

            self.stdout.write(self.style.SUCCESS(f"Seeded Doctor: Dr. {first_name} {last_name} ({spec})"))

        self.stdout.write(self.style.SUCCESS(" Clinic data seeding completed successfully!"))
