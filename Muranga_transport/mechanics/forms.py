from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from .models import MechanicProfile, RepairInvoice
from .models import MechanicSupportRequest, MechanicSupportAttachment

User = get_user_model()


class MechanicProfileForm(forms.ModelForm):
    phone_number = forms.CharField(
        max_length=20, required=True, label="Phone Number"
    )
    email = forms.EmailField(required=True, label="Email Address")

    specialization = forms.MultipleChoiceField(
        choices=[
            ('engine', 'Engine Systems'),
            ('electrical', 'Electrical & Electronics'),
            ('transmission', 'Transmission & Gearbox'),
            ('suspension', 'Suspension & Steering'),
            ('brakes', 'Braking Systems'),
            ('diesel', 'Diesel Engines'),
            ('ac', 'Air Conditioning'),
            ('bodywork', 'Bodywork & Painting'),
        ],
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Specialization"
    )

    class Meta:
        model = MechanicProfile
        fields = [
            'full_name',
            'location',
            'experience_years',
            'specialization'
        ]

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if self.instance.specialization:
            self.initial['specialization'] = self.instance.specialization.split(',')

    def clean_phone_number(self):
        phone = self.cleaned_data.get('phone_number')
        if User.objects.exclude(pk=self.user.pk).filter(phone_number=phone).exists():
            raise ValidationError("This phone number is already in use by another account.")
        return phone

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.exclude(pk=self.user.pk).filter(email=email).exists():
            raise ValidationError("This email address is already in use by another account.")
        return email

    def save(self, commit=True):
        mechanic = super().save(commit=False)
        specialization = self.cleaned_data.get('specialization', [])
        mechanic.specialization = ','.join(specialization)
        if commit:
            mechanic.save()
            self.user.phone_number = self.cleaned_data['phone_number']
            self.user.email = self.cleaned_data['email']
            self.user.save()
        return mechanic


class RepairInvoiceForm(forms.ModelForm):
    task_unique_id = forms.CharField(
        max_length=50,
        required=True,
        label="Task ID",
        widget=forms.TextInput(attrs={'placeholder': 'e.g. TASK123'}),
    )
    date_of_service = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date'}),
        required=True,
        label="Date of Service",
    )

    class Meta:
        model = RepairInvoice
        fields = [
            'vehicle_number',
            'issues',
            'total_cost',
            'date_of_service',
        ]
        widgets = {
            'vehicle_number': forms.TextInput(attrs={'placeholder': 'e.g. KDC 123A'}),
            'issues': forms.Textarea(attrs={'placeholder': 'Describe issues and estimated costs... e.g. Brake Replacement - 5000'}),
            'total_cost': forms.NumberInput(attrs={'placeholder': 'Total cost in Ksh'}),
        }

    def clean_task_unique_id(self):
        task_unique_id = self.cleaned_data.get('task_unique_id')
        if not task_unique_id:
            raise forms.ValidationError("Task ID is required.")
        return task_unique_id
    
class MechanicSupportForm(forms.ModelForm):
    class Meta:
        model = MechanicSupportRequest
        fields = ['subject', 'message']
        widgets = {
            'subject': forms.TextInput(attrs={
                'class': 'form-control form-control-lg',
                'placeholder': 'Enter the subject of your issue...',
            }),
            'message': forms.Textarea(attrs={
                'class': 'form-control form-control-lg',
                'rows': 6,
                'placeholder': 'Describe your issue in detail...',
            }),
        }
        labels = {
            'subject': 'Subject',
            'message': 'Message',
        }