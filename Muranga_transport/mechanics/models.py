import string
from django.db import models
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta

def generate_mechanic_id():
    prefix = "ME"
    suffix = get_random_string(length=4, allowed_chars=string.ascii_uppercase + string.digits)
    return f"{prefix}{suffix}"

def generate_unique_task_id():
    while True:
        task_id = get_random_string(length=8, allowed_chars=string.ascii_uppercase + string.digits)
        if not MechanicTask.objects.filter(unique_task_id=task_id).exists():
            return task_id

class Specialization(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class MechanicProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mechanic_id = models.CharField(max_length=20, unique=True, default=generate_mechanic_id)
    full_name = models.CharField(max_length=255)
    profile_image = models.ImageField(upload_to='mechanic_profiles/', blank=True, null=True)
    experience_years = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=255, blank=True, null=True)
    specialization = models.TextField(blank=True, null=True)  # Comma-separated specializations
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('inactive', 'Inactive'), ('on-leave', 'On Leave')],
        default='active'
    )
    join_date = models.DateField(auto_now_add=True)

    @property
    def specialization_list(self):
        if self.specialization:
            return [s.strip() for s in self.specialization.split(',') if s.strip()]
        return []

    def __str__(self):
        return f"{self.full_name or self.user.username} Profile"

class MechanicTask(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    maintenance_request = models.OneToOneField(
        'drivers.MaintenanceRequest',
        on_delete=models.CASCADE,
        related_name='assigned_task'
    )
    mechanic = models.ForeignKey(
        'MechanicProfile',
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    progress = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    unique_task_id = models.CharField(
        max_length=8,
        unique=True,
        default=generate_unique_task_id,
        editable=False
    )

    def __str__(self):
        return f"Task {self.unique_task_id} for {self.maintenance_request.vehicle.number_plate}"

class RepairInvoice(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('rejected', 'Rejected'),
    ]

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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='rejected_invoices'
    )
    rejection_reason = models.CharField(max_length=50, blank=True)
    rejection_comment = models.TextField(blank=True)
    action_timestamp = models.DateTimeField(auto_now_add=True)
   

    @property
    def can_unapprove(self):
        return self.status in ('approved', 'rejected') and (timezone.now() - self.action_timestamp) <= timedelta(hours=48)

class RepairInvoicePhoto(models.Model):
    invoice = models.ForeignKey(
        RepairInvoice,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    image = models.ImageField(upload_to='repair_invoices/photos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for Invoice {self.invoice.task_unique_id}"

class MechanicSupportRequest(models.Model):
    mechanic = models.ForeignKey(
        'MechanicProfile',
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

    def __str__(self):
        return f"Attachment for SupportRequest #{self.request.id}"