from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from drivers.models import MaintenanceRequest, RequestIssue, Vehicle
from mechanics.models import MechanicProfile, MechanicTask
import random
import string

def generate_unique_task_id():
    """Generate a unique 8-character task ID."""
    characters = string.ascii_uppercase + string.digits
    while True:
        task_id = ''.join(random.choices(characters, k=8))
        if not MechanicTask.objects.filter(unique_task_id=task_id).exists():
            return task_id

@login_required
def dashboard(request):
    user = request.user
    now = timezone.localtime(timezone.now())
    hour = now.hour
    greeting = "Good morning" if 5 <= hour < 12 else "Good afternoon" if 12 <= hour < 17 else "Good evening"
    context = {
        "greeting": greeting,
        "name": user.get_full_name() or user.username
    }
    return render(request, "managers/dashboard.html", context)

@login_required
def jobs(request):
    return render(request, 'managers/job_management.html')

@login_required
def maintenance(request):
    user = request.user
    now = timezone.localtime(timezone.now())
    hour = now.hour
    greeting = "Good morning" if 5 <= hour < 12 else "Good afternoon" if 12 <= hour < 17 else "Good evening"

    status = request.GET.get('status', 'pending')
    priority = request.GET.get('priority', 'all')
    vehicle = request.GET.get('vehicle', 'all')
    query = request.GET.get('q', '')

    requests = MaintenanceRequest.objects.all().select_related('driver__user', 'vehicle').prefetch_related('issues')

    if status != 'all':
        requests = requests.filter(status=status)
    if priority != 'all':
        requests = requests.filter(issues__priority=priority).distinct()
    if vehicle != 'all':
        requests = requests.filter(vehicle__number_plate=vehicle)
    if query:
        requests = requests.filter(
            Q(id__icontains=query) |
            Q(vehicle__number_plate__icontains=query) |
            Q(driver__user__first_name__icontains=query) |
            Q(driver__user__last_name__icontains=query) |
            Q(issues__title__icontains=query) |
            Q(issues__description__icontains=query)
        ).distinct()

    paginator = Paginator(requests, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'greeting': greeting,
        'name': user.get_full_name() or user.username,
        'maintenance_requests': page_obj,
        'selected_status': status,
        'selected_priority': priority,
        'selected_vehicle': vehicle,
        'query': query,
        'page_obj': page_obj,
        'status_choices': MaintenanceRequest.STATUS_CHOICES,
        'priority_choices': MaintenanceRequest.PRIORITY_CHOICES,
        'vehicles': Vehicle.objects.all(),
    }
    return render(request, 'managers/maintenance_requests.html', context)

@login_required
def request_detail(request, id):
    maintenance_request = get_object_or_404(MaintenanceRequest, id=id)
    user = request.user
    now = timezone.localtime(timezone.now())
    hour = now.hour
    greeting = "Good morning" if 5 <= hour < 12 else "Good afternoon" if 12 <= hour < 17 else "Good evening"

    context = {
        'greeting': greeting,
        'name': user.get_full_name() or user.username,
        'request_obj': maintenance_request,
    }
    return render(request, 'managers/request_detail.html', context)

@login_required
def approve_request(request, id):
    maintenance_request = get_object_or_404(MaintenanceRequest, id=id)
    if request.method == 'POST':
        maintenance_request.status = 'approved'
        maintenance_request.approved_by = request.user
        maintenance_request.last_update = f"Approved by {request.user.get_full_name() or request.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}"
        maintenance_request.save()
        messages.success(request, f"Maintenance request #{id} approved.")
        return redirect('managers:maintenance')
    return redirect('managers:maintenance')

@login_required
def deny_request(request, id):
    maintenance_request = get_object_or_404(MaintenanceRequest, id=id)
    if request.method == 'POST':
        deny_reason = request.POST.get('deny_reason', '').strip()
        if deny_reason:
            maintenance_request.status = 'denied'
            maintenance_request.last_update = f"Denied by {request.user.get_full_name() or request.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}: {deny_reason}"
            maintenance_request.save()
            messages.success(request, f"Maintenance request #{id} denied. Driver notified.")
            return redirect('managers:maintenance')
        else:
            messages.error(request, "Please provide a reason for denial.")
            return redirect('managers:request_detail', id=id)
    return redirect('managers:request_detail', id=id)

@login_required
def assign_mechanic(request, id):
    maintenance_request = get_object_or_404(MaintenanceRequest, id=id)
    
    if maintenance_request.status != 'approved':
        messages.error(request, "Only approved requests can be assigned to a mechanic.")
        return redirect('managers:maintenance')

    if hasattr(maintenance_request, 'assigned_task'):
        messages.error(request, "This request already has an assigned task.")
        return redirect('managers:maintenance')

    user = request.user
    now = timezone.localtime(timezone.now())
    hour = now.hour
    greeting = "Good morning" if 5 <= hour < 12 else "Good afternoon" if 12 <= hour < 17 else "Good evening"

    query = request.GET.get('q', '')
    mechanics = MechanicProfile.objects.filter(status='active')
    if query:
        mechanics = mechanics.filter(
            Q(full_name__icontains=query) |
            Q(mechanic_id__icontains=query)
        ).distinct()

    paginator = Paginator(mechanics, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    if request.method == 'POST':
        mechanic_id = request.POST.get('mechanic_id')
        mechanic = get_object_or_404(MechanicProfile, id=mechanic_id)
        
        MechanicTask.objects.create(
            maintenance_request=maintenance_request,
            mechanic=mechanic,
            status='in_progress',
            priority=maintenance_request.issues.first().priority if maintenance_request.issues.exists() else 'medium',
            notes=f"Assigned to {mechanic.full_name or mechanic.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            unique_task_id=generate_unique_task_id()
        )
        
        maintenance_request.mechanic = mechanic
        maintenance_request.status = 'in_progress'
        maintenance_request.last_update = f"Assigned to {mechanic.full_name or mechanic.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}"
        maintenance_request.save()
        
        messages.success(request, f"Mechanic assigned to request #{id}. Task created.")
        return redirect('managers:maintenance')

    context = {
        'greeting': greeting,
        'name': user.get_full_name() or user.username,
        'request_obj': maintenance_request,
        'mechanics': page_obj,
        'query': query,
        'page_obj': page_obj
    }
    return render(request, 'managers/assign_mechanic.html', context)

@login_required
def invoices(request):
    return render(request, 'managers/repair_invoices.html')

@login_required
def reports(request):
    return render(request, 'managers/reports.html')

@login_required
def settings(request):
    return render(request, 'managers/settings.html')

@login_required
def support(request):
    return render(request, 'managers/support.html')

@login_required
def applications(request):
    return render(request, 'managers/applications.html')

@login_required
def drivers(request):
    return render(request, 'managers/drivers.html')

@login_required
def assignments(request):
    return render(request, 'managers/assignments.html')