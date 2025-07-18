from django import forms
from django.contrib.auth.forms import PasswordChangeForm as BasePasswordChangeForm
from django.apps import apps
from core.models import User
from .models import ManagerProfile, DriverAssignment, VehicleAssignment

# MechanicTaskForm
class MechanicTaskForm(forms.ModelForm):
    maintenance_request = forms.ModelChoiceField(
        queryset=None,
        required=False,
        empty_label="No Maintenance Request",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    unique_task_id = forms.CharField(
        max_length=36,
        required=False,
        disabled=True,
        label="Task ID"
    )  # Read-only display

    class Meta:
        model = apps.get_model('mechanics', 'MechanicTask')
        fields = [
            'maintenance_request', 'mechanic', 'status', 'priority', 'notes',
            'issue_title', 'issue_description', 'vehicle_number_plate', 'estimated_cost',
            'progress', 'rejection_reason'
        ]
        widgets = {
            'mechanic': forms.Select(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'priority': forms.Select(attrs={'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Enter task notes'}),
            'issue_title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter issue title'}),
            'issue_description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Describe the issue'}),
            'vehicle_number_plate': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter vehicle number plate'}),
            'estimated_cost': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Enter estimated cost (KES)', 'step': '0.01'}),
            'progress': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Progress (0-100)', 'step': '1'}),
            'rejection_reason': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Reason for rejection'}),
        }
        labels = {
            'maintenance_request': 'Maintenance Request (Optional)',
            'mechanic': 'Assign Mechanic',
            'status': 'Task Status',
            'priority': 'Priority',
            'notes': 'Task Notes',
            'issue_title': 'Issue Title',
            'issue_description': 'Issue Description',
            'vehicle_number_plate': 'Vehicle Number Plate',
            'estimated_cost': 'Estimated Cost (KES)',
            'progress': 'Progress (%)',
            'rejection_reason': 'Rejection Reason',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:  # If editing an existing instance
            self.fields['unique_task_id'].initial = str(self.instance.unique_task_id)

        MaintenanceRequest = apps.get_model('drivers', 'MaintenanceRequest')
        MechanicProfile = apps.get_model('mechanics', 'MechanicProfile')
        self.fields['maintenance_request'].queryset = MaintenanceRequest.objects.filter(
            status__in=['approved', 'rejected']
        )
        self.fields['mechanic'].queryset = MechanicProfile.objects.filter(status='active')
        self.fields['vehicle_number_plate'].required = False
        self.fields['issue_title'].required = False
        self.fields['issue_description'].required = False
        self.fields['estimated_cost'].required = False
        self.fields['progress'].required = False
        self.fields['rejection_reason'].required = False

    def clean(self):
        Vehicle = apps.get_model('drivers', 'Vehicle')
        cleaned_data = super().clean()
        maintenance_request = cleaned_data.get('maintenance_request')
        vehicle_number_plate = cleaned_data.get('vehicle_number_plate')
        issue_title = cleaned_data.get('issue_title')
        issue_description = cleaned_data.get('issue_description')
        estimated_cost = cleaned_data.get('estimated_cost')
        progress = cleaned_data.get('progress')
        rejection_reason = cleaned_data.get('rejection_reason')

        if not maintenance_request:
            if not vehicle_number_plate:
                self.add_error('vehicle_number_plate', 'Vehicle number plate is required for manual tasks.')
            elif not Vehicle.objects.filter(number_plate=vehicle_number_plate).exists():
                self.add_error('vehicle_number_plate', 'Invalid vehicle number plate.')
            if not issue_title:
                self.add_error('issue_title', 'Issue title is required for manual tasks.')
            if not issue_description:
                self.add_error('issue_description', 'Issue description is required for manual tasks.')
            if not estimated_cost:
                self.add_error('estimated_cost', 'Estimated cost is required for manual tasks.')
            if progress is not None and not 0 <= progress <= 100:
                self.add_error('progress', 'Progress must be between 0 and 100.')
        else:
            if vehicle_number_plate or issue_title or issue_description or estimated_cost or progress or rejection_reason:
                self.add_error(None, 'Manual fields are ignored when a maintenance request is selected.')
                cleaned_data['vehicle_number_plate'] = None
                cleaned_data['issue_title'] = None
                cleaned_data['issue_description'] = None
                cleaned_data['estimated_cost'] = None
                cleaned_data['progress'] = None
                cleaned_data['rejection_reason'] = None

        return cleaned_data

# Invoice Forms
STATUS_CHOICES = [
    ('pending', 'Pending Approval'),
    ('approved', 'Approved'),
    ('paid', 'Paid'),
    ('rejected', 'Rejected'),
]

class InvoiceStatusForm(forms.Form):
    status = forms.ChoiceField(choices=STATUS_CHOICES)
    payment_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    notes = forms.CharField(widget=forms.Textarea, required=False)

class InvoiceApprovalForm(forms.Form):
    notes = forms.CharField(widget=forms.Textarea, required=False)

class InvoiceRejectionForm(forms.Form):
    REJECTION_REASONS = [
        ('incorrect_amount', 'Incorrect Amount'),
        ('missing_info', 'Missing Information'),
        ('unauthorized_work', 'Unauthorized Work'),
        ('other', 'Other'),
    ]
    reason = forms.ChoiceField(choices=REJECTION_REASONS)
    notes = forms.CharField(widget=forms.Textarea, required=True)

# Mechanic Assignment Form
class MechanicAssignmentForm(forms.Form):
    mechanic_id = forms.ModelChoiceField(
        queryset=apps.get_model('mechanics', 'MechanicProfile').objects.filter(status='active'),
        label="Select Mechanic",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

# Deny Form
class DenyForm(forms.Form):
    deny_reason = forms.CharField(widget=forms.Textarea, label='Reason for Denial', required=True)

# Manager Profile Form
class ManagerProfileForm(forms.ModelForm):
    photo = forms.ImageField(
        required=False,
        widget=forms.FileInput(attrs={'class': 'form-control'})
    )

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone_number']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter first name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter last name'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Enter email address'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter phone number'}),
        }
        labels = {
            'first_name': 'First Name',
            'last_name': 'Last Name',
            'email': 'Email Address',
            'phone_number': 'Phone Number',
        }

# Password Change Form
class PasswordChangeForm(BasePasswordChangeForm):
    def __init__(self, user, *args, **kwargs):
        super().__init__(user, *args, **kwargs)
        self.fields['old_password'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Enter current password'})
        self.fields['new_password1'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Enter new password'})
        self.fields['new_password2'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Confirm new password'})

# Driver Assignment Form
class DriverAssignmentForm(forms.ModelForm):
    class Meta:
        model = DriverAssignment
        fields = [
            'title', 'date', 'time', 'destination', 'driver',
            'vehicle_number_plate', 'passengers', 'estimated_distance', 'special_instructions'
        ]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter assignment title'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'destination': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter destination'}),
            'driver': forms.Select(attrs={'class': 'form-control'}),
            'vehicle_number_plate': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter vehicle number plate'}),
            'passengers': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter passenger details (optional)'}),
            'estimated_distance': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Estimated distance in km', 'step': '0.01'}),
            'special_instructions': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Special instructions (optional)'}),
        }
        labels = {
            'title': 'Assignment Title',
            'date': 'Date',
            'time': 'Time',
            'destination': 'Destination',
            'driver': 'Assign Driver',
            'vehicle_number_plate': 'Vehicle Number Plate',
            'passengers': 'Passengers',
            'estimated_distance': 'Estimated Distance (km)',
            'special_instructions': 'Special Instructions',
        }

# Vehicle Assignment Form
class VehicleAssignmentForm(forms.ModelForm):
    class Meta:
        model = VehicleAssignment
        fields = ['driver', 'vehicle_number_plate']
        widgets = {
            'driver': forms.Select(attrs={'class': 'form-control'}),
            'vehicle_number_plate': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter vehicle number plate'}),
        }
        labels = {
            'driver': 'Assign Driver',
            'vehicle_number_plate': 'Vehicle Number Plate',
        }