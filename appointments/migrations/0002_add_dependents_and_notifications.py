import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='date_of_birth',
            field=models.DateField(blank=True, help_text='Date of birth for age verification (Under 18 dependent rule).', null=True),
        ),
        migrations.AddField(
            model_name='customuser',
            name='parent_guardian',
            field=models.ForeignKey(blank=True, help_text='Parent or legal guardian for minor dependents.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='dependents', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='appointment',
            name='booked_by',
            field=models.ForeignKey(blank=True, help_text='User (e.g. Parent/Guardian) who initiated the booking.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='initiated_bookings', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='appointment',
            name='notification_sent',
            field=models.BooleanField(default=False, help_text='Flag indicating if a cancellation/reschedule notification was dispatched to patient.'),
        ),
        migrations.AlterField(
            model_name='appointment',
            name='status',
            field=models.CharField(choices=[('BOOKED', 'Booked'), ('CANCELLED', 'Cancelled'), ('NEEDS_RESCHEDULE', 'Needs Reschedule')], db_index=True, default='BOOKED', max_length=20),
        ),
    ]
