import pytest
from datetime import date
from django.contrib.auth import get_user_model
from appointments.models import UserRole, Doctor, CustomUser

User = get_user_model()


@pytest.mark.django_db
class TestModelSchemasAndMethods:
    """
    Test suite verifying CustomUser, Doctor, and dependent minor calculation methods.
    """

    def test_create_patient_user(self):
        user = User.objects.create_user(
            username='johndoe',
            email='john@example.com',
            password='Password123!',
            role=UserRole.PATIENT
        )
        assert user.role == UserRole.PATIENT
        assert user.check_password('Password123!')
        assert user.is_patient()
        assert not user.is_doctor()

    def test_minor_dependent_calculation(self):
        parent = User.objects.create_user(
            username='parent_user',
            email='parent@test.com',
            password='Password123!',
            date_of_birth=date(1990, 1, 1)
        )
        child = User.objects.create_user(
            username='child_user',
            email='child@test.com',
            password='Password123!',
            date_of_birth=date(2018, 5, 15),
            parent_guardian=parent
        )

        assert not parent.is_minor()
        assert child.is_minor()
        assert child.parent_guardian == parent
