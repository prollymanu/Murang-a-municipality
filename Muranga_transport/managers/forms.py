from django import forms
from mechanics.models import MechanicProfile
from mechanics.models import RepairInvoice

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
class MechanicAssignmentForm(forms.Form):
    mechanic_id = forms.ModelChoiceField(
        queryset=MechanicProfile.objects.filter(status='active'),
        label="Select Mechanic",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

class DenyForm(forms.Form):
    deny_reason = forms.CharField(widget=forms.Textarea, label='Reason for Denial', required=True)