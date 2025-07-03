import string
from django.db import models
from django.conf import settings
from django.utils.crypto import get_random_string
from django.contrib.auth.models import User
from mechanics.models import MechanicProfile 

User = settings.AUTH_USER_MODEL

KENYA_LICENSE_CLASSES = [
    ('A', 'A - Motorcycles'),
    ('B', 'B - Light Vehicles'),
    ('C', 'C - Medium Vehicles'),
    ('CE', 'CE - Heavy Commercial'),
    ('D', 'D - Passenger Service Vehicle'),
    ('E', 'E - Special Vehicles'),
    ('FG', 'FG - Industrial Equipment'),
]

CERTIFICATIONS = [
    ('defensive_driving', 'Defensive Driving'),
    ('first_aid', 'First Aid'),
    ('hazardous_materials', 'Hazardous Materials'),
    ('vehicle_inspection', 'Vehicle Inspection'),
    ('eco_driving', 'Eco Driving'),
    ('route_planning', 'Route Planning'),
    ('offroad_driving', 'Off-road Driving'),
]

def generate_driver_id():
    prefix = "DI"
    suffix = get_random_string(length=4, allowed_chars=string.ascii_uppercase + string.digits)
    return f"{prefix}{suffix}"

class LicenseClass(models.Model):
    code = models.CharField(max_length=5, choices=KENYA_LICENSE_CLASSES, unique=True)

    def __str__(self):
        return self.get_code_display()

class Certification(models.Model):
    code = models.CharField(max_length=50, choices=CERTIFICATIONS, unique=True)

    def __str__(self):
        return self.get_code_display()

class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    driver_id = models.CharField(max_length=20, unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    profile_image = models.ImageField(upload_to='driver_profiles/', blank=True, null=True)  
    license_class = models.CharField(max_length=100, blank=True) 
    experience_years = models.PositiveIntegerField(default=0)
    department = models.CharField(max_length=100, blank=True)
    supervisor = models.CharField(max_length=100, blank=True)
    current_vehicle = models.CharField(max_length=100, blank=True)
    join_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} Profile"

    @property
    def license_class_list(self):
        if self.license_class:
            return self.license_class.split(',')
        return []
    
class Vehicle(models.Model):
    number_plate = models.CharField(max_length=15, unique=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50, blank=True)
    year = models.PositiveIntegerField(blank=True, null=True)
    mileage = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.make} {self.model} ({self.number_plate})"


class MaintenanceRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    driver = models.ForeignKey('drivers.DriverProfile', on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT)
    mileage = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_requests')
    
    mechanic = models.ForeignKey(   # ← ✅ ADD THIS FIELD
        MechanicProfile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_requests',
        help_text="Mechanic assigned to this maintenance request"
    )

    estimated_completion = models.DateField(null=True, blank=True)
    last_update = models.TextField(blank=True)

    def __str__(self):
        return f"Request #{self.pk} - {self.vehicle.number_plate} - {self.status}"



class RequestIssue(models.Model):
    request = models.ForeignKey(MaintenanceRequest, on_delete=models.CASCADE, related_name='issues')
    title = models.CharField(max_length=100)
    description = models.TextField()
    cost_estimate = models.DecimalField(max_digits=10, decimal_places=2)
    priority = models.CharField(max_length=10, choices=MaintenanceRequest.PRIORITY_CHOICES)

    def __str__(self):
        return f"{self.title} ({self.priority})"


class SupportRequest(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    attachment = models.FileField(upload_to='support_attachments/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Support #{self.pk} - {self.subject[:50]}"
