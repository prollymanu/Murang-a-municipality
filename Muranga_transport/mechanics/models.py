import string
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string


def generate_mechanic_id():
    prefix = "ME"
    suffix = get_random_string(length=4, allowed_chars=string.ascii_uppercase + string.digits)
    return f"{prefix}{suffix}"

def generate_unique_task_id():
    return get_random_string(length=8, allowed_chars=string.ascii_uppercase + string.digits)

class Specialization(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class MechanicProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mechanic_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    profile_image = models.ImageField(upload_to='mechanic_profiles/', blank=True, null=True)
    experience_years = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=255, blank=True, null=True)
    specialization = models.TextField(blank=True, null=True)  # Comma-separated specializations

    @property
    def specialization_list(self):
        """
        Returns the specialization string as a list of specializations.
        """
        if self.specialization:
            return [s.strip() for s in self.specialization.split(',') if s.strip()]
        return []
    
class MechanicTask(models.Model):
    maintenance_request = models.OneToOneField(
        "drivers.MaintenanceRequest",  # Use a string ref to break circular import
        on_delete=models.CASCADE,
        related_name='assigned_task'
    )
    mechanic = models.ForeignKey(
        'mechanics.MechanicProfile',
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    progress = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ], default='pending')
    assigned_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    priority = models.CharField(max_length=10, choices=[
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ], default='medium')
    unique_task_id = models.CharField(
    max_length=8,
    unique=True,
    default=generate_unique_task_id,  # Automatically generate on save
    editable=False,
    )
    def __str__(self):
        return f"Task for {self.maintenance_request.vehicle.number_plate} - {self.get_status_display()}"

# model to handle invoice

class RepairInvoice(models.Model):
    mechanic_task = models.OneToOneField(
        'MechanicTask',
        on_delete=models.CASCADE,
        related_name='invoice'
    )
    task_unique_id = models.CharField(max_length=8, unique=True, default=generate_unique_task_id, editable=False)

    vehicle_number = models.CharField(max_length=20)
    issues = models.TextField(help_text="List the issues and approximate costs")
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    date_of_service = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
    max_length=20,
    choices=[('pending', 'Pending'), ('paid', 'Paid')],
    default='pending',
    )


    def __str__(self):
        return f"Invoice {self.task_unique_id} for {self.vehicle_number}"

class RepairInvoicePhoto(models.Model):
    invoice = models.ForeignKey(
        RepairInvoice,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    image = models.ImageField(upload_to='repair_invoices/photos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


class MechanicSupportRequest(models.Model): 
    mechanic = models.ForeignKey(
        'mechanics.MechanicProfile',  #
        on_delete=models.CASCADE,
        related_name='support_requests'
    )
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SupportRequest #{self.id} by {self.mechanic.user.username}"


class MechanicSupportAttachment(models.Model):
    request = models.ForeignKey(
        MechanicSupportRequest,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    file = models.FileField(upload_to='mechanic_support_attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)