from django import forms
from mechanics.models import MechanicProfile

class MechanicAssignmentForm(forms.Form):
    mechanic_id = forms.ModelChoiceField(
        queryset=MechanicProfile.objects.filter(status='active'),
        label="Select Mechanic",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

class DenyForm(forms.Form):
    deny_reason = forms.CharField(widget=forms.Textarea, label='Reason for Denial', required=True)