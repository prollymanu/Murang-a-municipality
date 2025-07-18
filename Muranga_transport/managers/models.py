from django.db import models
from django.conf import settings
from mechanics.models import MechanicProfile

class ManagerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='manager_profile'
    )
    photo = models.ImageField(upload_to='manager_photos/', blank=True, null=True)
    position = models.CharField(max_length=100, default='Transport Manager', editable=False)

    def __str__(self):
        return f"{self.user.username}'s Manager Profile"


class DriverAssignment(models.Model):
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_driver_assignments'
    )
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignments',
        limit_choices_to={'role': 'driver'}
    )
    title = models.CharField(max_length=255)
    date = models.DateField()
    time = models.TimeField()
    destination = models.CharField(max_length=255)
    vehicle_number_plate = models.CharField(max_length=20)
    passengers = models.TextField(blank=True)
    estimated_distance = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    special_instructions = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('upcoming', 'Upcoming'), ('in_progress', 'In Progress'), ('completed', 'Completed')],
        default='upcoming'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assignment #{self.id}: {self.title} for {self.driver.username}"

class VehicleAssignment(models.Model):
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_vehicle_assignments'
    )
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vehicle_assignments',
        limit_choices_to={'role': 'driver'}
    )
    vehicle_number_plate = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Vehicle {self.vehicle_number_plate} assigned to {self.driver.username}"

class SupportResponse(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    driver_request = models.ForeignKey(
        'drivers.SupportRequest',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='responses'
    )
    mechanic_request = models.ForeignKey(
        'mechanics.MechanicSupportRequest',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='responses'
    )
    responder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='support_responses'
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        request_type = 'Driver' if self.driver_request else 'Mechanic'
        return f"Response to {request_type} Support #{self.driver_request.pk if self.driver_request else self.mechanic_request.pk}"

# Update to the MechanicSupportRequest to include status
from mechanics.models import MechanicSupportRequest
MechanicSupportRequest.add_to_class('status', models.CharField(
    max_length=20,
    choices=[
        ('open', 'Open'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ],
    default='open'
))