from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from drivers.models import KENYA_LICENSE_CLASSES


class User(AbstractUser):
    ROLE_CHOICES = (
        ('driver', 'Driver'),
        ('mechanic', 'Mechanic'),
        ('transport_manager', 'Transport Manager'),
        ('chief_officer', 'Chief Officer'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)
    dl_no = models.CharField(max_length=50, blank=True, null=True)  # Driver's license number
    id_no = models.CharField(max_length=50, blank=True, null=True)  # National ID number
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.username


def validate_license_class(value):
    if not value:
        return
    valid_codes = [code for code, _ in KENYA_LICENSE_CLASSES]
    selected_codes = [code.strip() for code in value.split(',') if code.strip()]
    for code in selected_codes:
        if code not in valid_codes:
            raise ValidationError(f"Invalid license class: {code}. Must be one of {', '.join(valid_codes)}.")

class RegistrationRequest(models.Model):
    ROLE_CHOICES = (
        ('driver', 'Driver'),
        ('mechanic', 'Mechanic'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    drivers_license = models.CharField(max_length=50, blank=True, null=True)  # For drivers
    license_class = models.CharField(max_length=100, blank=True, null=True, validators=[validate_license_class])  # For drivers
    experience_years = models.PositiveIntegerField(default=0)  # For both
    department = models.CharField(max_length=100, blank=True, null=True)  # For drivers
    supervisor = models.CharField(max_length=100, blank=True, null=True)  # For drivers
    id_number = models.CharField(max_length=50, blank=True, null=True)  # For mechanics
    location = models.CharField(max_length=255, blank=True, null=True)  # For mechanics
    specialization = models.TextField(blank=True, null=True)  # For mechanics
    password = models.CharField(max_length=255)  # Store hashed password
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.role}"