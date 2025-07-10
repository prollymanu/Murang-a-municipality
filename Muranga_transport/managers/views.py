from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from drivers.models import MaintenanceRequest, RequestIssue, Vehicle, DriverProfile
from mechanics.models import MechanicProfile, MechanicTask
from core.models import User, RegistrationRequest
from django.views.decorators.http import require_POST
from django.contrib.auth.hashers import make_password
import random
import string
import uuid
import re

from core.models import User
from core.utils import generate_unique_id, get_greeting
from drivers.models import DriverProfile
from mechanics.models import MechanicProfile

def generate_unique_id(prefix, length=8):
    chars = string.ascii_uppercase + string.digits
    while True:
        uid = f"{prefix}_{''.join(random.choices(chars, k=length))}"
        if prefix == 'DRV' and not DriverProfile.objects.filter(driver_id=uid).exists():
            return uid
        if prefix == 'MEC' and not MechanicProfile.objects.filter(mechanic_id=uid).exists():
            return uid
        if prefix == 'TASK' and not MechanicTask.objects.filter(unique_task_id=uid).exists():
            return uid

def get_greeting():
    hour = timezone.localtime().hour
    return "Good morning" if 5 <= hour < 12 else "Good afternoon" if 12 <= hour < 17 else "Good evening"

@login_required
def dashboard(request):
    return render(request, "managers/dashboard.html", {
        "greeting": get_greeting(),
        "name": request.user.get_full_name() or request.user.username
    })

@login_required
def maintenance(request):
    status = request.GET.get('status', 'pending')
    priority = request.GET.get('priority', 'all')
    vehicle = request.GET.get('vehicle', 'all')
    query = request.GET.get('q', '')

    qs = MaintenanceRequest.objects.all().select_related('driver__user', 'vehicle').prefetch_related('issues')
    if status != 'all': qs = qs.filter(status=status)
    if priority != 'all': qs = qs.filter(issues__priority=priority).distinct()
    if vehicle != 'all': qs = qs.filter(vehicle__number_plate=vehicle)
    if query:
        qs = qs.filter(
            Q(id__icontains=query) |
            Q(vehicle__number_plate__icontains=query) |
            Q(driver__user__first_name__icontains=query) |
            Q(driver__user__last_name__icontains=query) |
            Q(issues__title__icontains=query) |
            Q(issues__description__icontains=query)
        ).distinct()

    page_obj = Paginator(qs, 5).get_page(request.GET.get('page'))

    return render(request, 'managers/maintenance_requests.html', {
        "greeting": get_greeting(),
        "name": request.user.get_full_name() or request.user.username,
        "maintenance_requests": page_obj,
        "selected_status": status,
        "selected_priority": priority,
        "selected_vehicle": vehicle,
        "query": query,
        "page_obj": page_obj,
        "status_choices": MaintenanceRequest.STATUS_CHOICES,
        "priority_choices": MaintenanceRequest.PRIORITY_CHOICES,
        "vehicles": Vehicle.objects.all()
    })

@login_required
def request_detail(request, id):
    req = get_object_or_404(MaintenanceRequest, id=id)
    return render(request, 'managers/request_detail.html', {
        "greeting": get_greeting(),
        "name": request.user.get_full_name() or request.user.username,
        "request_obj": req
    })

@login_required
def approve_request(request, id):
    req = get_object_or_404(MaintenanceRequest, id=id)
    if request.method == 'POST':
        req.status = 'approved'
        req.approved_by = request.user
        req.last_update = f"Approved by {request.user.get_full_name()} on {timezone.now().strftime('%Y-%m-%d %H:%M')}"
        req.save()
        messages.success(request, f"Request #{id} approved.")
    return redirect('managers:maintenance')

@login_required
def deny_request(request, id):
    req = get_object_or_404(MaintenanceRequest, id=id)
    if request.method == 'POST':
        reason = request.POST.get('deny_reason', '').strip()
        if reason:
            req.status = 'denied'
            req.last_update = f"Denied by {request.user.get_full_name()} on {timezone.now().strftime('%Y-%m-%d %H:%M')}: {reason}"
            req.save()
            messages.success(request, f"Request #{id} denied.")
        else:
            messages.error(request, "Denial reason is required.")
            return redirect('managers:request_detail', id=id)
    return redirect('managers:maintenance')

@login_required
def assign_mechanic(request, id):
    req = get_object_or_404(MaintenanceRequest, id=id)
    if req.status in ['denied', 'completed', 'in_progress']:
        messages.error(request, "Request cannot be assigned.")
        return redirect('managers:maintenance')
    if hasattr(req, 'assigned_task'):
        messages.error(request, "Already assigned.")
        return redirect('managers:maintenance')

    query = request.GET.get('q', '')
    mechanics = MechanicProfile.objects.filter(status='active')
    if query:
        mechanics = mechanics.filter(Q(full_name__icontains=query) | Q(mechanic_id__icontains=query))

    page_obj = Paginator(mechanics, 5).get_page(request.GET.get('page'))

    if request.method == 'POST':
        mech = get_object_or_404(MechanicProfile, id=request.POST.get('mechanic_id'))
        MechanicTask.objects.create(
            maintenance_request=req,
            mechanic=mech,
            status='in_progress',
            priority=req.issues.first().priority if req.issues.exists() else 'medium',
            notes=f"Assigned to {mech.full_name} on {timezone.now().strftime('%Y-%m-%d %H:%M')}",
           unique_task_id=f"T{uuid.uuid4().hex[:7].upper()}"
        )
        req.mechanic = mech
        req.status = 'in_progress'
        req.last_update = f"Assigned to {mech.full_name} on {timezone.now().strftime('%Y-%m-%d %H:%M')}"
        req.save()
        messages.success(request, f"Assigned mechanic to request #{id}")
        return redirect('managers:maintenance')

    return render(request, 'managers/assign_mechanic.html', {
        "greeting": get_greeting(),
        "name": request.user.get_full_name() or request.user.username,
        "request_obj": req,
        "mechanics": page_obj,
        "query": query,
        "page_obj": page_obj
    })

@login_required
def applications_view(request):
    query = request.GET.get('q', '')
    role = request.GET.get('role', 'all')
    status = request.GET.get('status', 'all')
    license_class = request.GET.get('license', 'all')
    specialty = request.GET.get('specialty', 'all')

    reg_qs = RegistrationRequest.objects.filter(is_approved=False)
    if role != 'all': reg_qs = reg_qs.filter(role=role)
    if query: reg_qs = reg_qs.filter(Q(full_name__icontains=query) | Q(email__icontains=query) | Q(phone_number__icontains=query))

    drivers = DriverProfile.objects.select_related('user').all()
    if status != 'all': drivers = drivers.filter(status=status)
    if license_class != 'all': drivers = drivers.filter(license_class=license_class)

    mechanics = MechanicProfile.objects.select_related('user').all()
    if status != 'all': mechanics = mechanics.filter(status=status)
    if specialty != 'all': mechanics = mechanics.filter(specialization=specialty)

    page_obj = Paginator(reg_qs, 5).get_page(request.GET.get('page'))

    return render(request, 'managers/applications.html', {
        "greeting": get_greeting(),
        "name": request.user.get_full_name() or request.user.username,
        "registration_requests": page_obj,
        "drivers": drivers,
        "mechanics": mechanics,
        "query": query,
        "role_filter": role,
        "status_filter": status,
        "license_filter": license_class,
        "specialty_filter": specialty
    })

@login_required
@require_POST
def approve_registration(request, id):
    reg = get_object_or_404(RegistrationRequest, id=id)

    # Prevent duplicate user
    if User.objects.filter(email=reg.email).exists():
        messages.error(request, 'User with this email already exists.')
        return redirect('managers:applications')

    try:
        # Split full name
        full_name_parts = reg.full_name.strip().split()
        first_name = full_name_parts[0]
        last_name = " ".join(full_name_parts[1:]) if len(full_name_parts) > 1 else ''

        username = f"{reg.role}_{uuid.uuid4().hex[:8]}"

        # Create user with hashed password directly
        user = User.objects.create(
            username=username,
            email=reg.email,
            phone_number=reg.phone_number,
            first_name=first_name,
            last_name=last_name,
            role=reg.role,
            dl_no=reg.drivers_license if reg.role == 'driver' else None,
            id_no=reg.id_number if reg.id_number else None,
            location=reg.location if reg.location else None,
            is_active=True,
            password=reg.password  # Set hashed password directly
        )

        # Create profile based on role
        if reg.role == 'driver':
            DriverProfile.objects.create(
                user=user,
                driver_id=generate_unique_id('DRV'),
                phone_number=reg.phone_number,
                license_class=reg.license_class,
                experience_years=reg.experience_years,
                department=reg.department if reg.department else None,
                supervisor=reg.supervisor if reg.supervisor else None
            )
        elif reg.role == 'mechanic':
            MechanicProfile.objects.create(
                user=user,
                mechanic_id=generate_unique_id('MEC'),
                full_name=reg.full_name,
                phone=reg.phone_number,
                email=reg.email,
                experience_years=reg.experience_years,
                location=reg.location if reg.location else None,
                specialization=reg.specialization if reg.specialization else None
            )

        reg.delete()
        messages.success(request, f"{reg.full_name} approved and moved to active users.")

    except Exception as e:
        print(f"[ERROR] Approval failed: {e}")
        messages.error(request, "Something went wrong during approval.")

    return redirect('managers:applications')

@login_required
def deny_registration(request, id):
    if request.method == 'POST':
        reg = get_object_or_404(RegistrationRequest, id=id)
        reason = request.POST.get('deny_reason', '').strip()

        # Log or notify as needed (optional)
        print(f"[INFO] Denied {reg.full_name}. Reason: {reason if reason else 'No reason provided'}")

        reg.delete()
        messages.success(request, f"{reg.full_name}'s registration request denied and deleted.")
    return redirect('managers:applications')


@login_required
def delete_driver(request, id):
    driver = get_object_or_404(DriverProfile, id=id)
    user = driver.user
    user.delete()
    messages.success(request, f"Driver {driver.driver_id} deleted.")
    return redirect('managers:applications')

@login_required
def delete_mechanic(request, id):
    mechanic = get_object_or_404(MechanicProfile, id=id)
    user = mechanic.user
    user.delete()
    messages.success(request, f"Mechanic {mechanic.mechanic_id} deleted.")
    return redirect('managers:applications')

@login_required
def personnel_management(request):
    driver_query = request.GET.get('driver_search', '')
    mechanic_query = request.GET.get('mechanic_search', '')

    drivers_qs = DriverProfile.objects.select_related('user')
    if driver_query:
        drivers_qs = drivers_qs.filter(
            Q(user__first_name__icontains=driver_query) |
            Q(user__last_name__icontains=driver_query) |
            Q(user__email__icontains=driver_query)
        )

    mechanics_qs = MechanicProfile.objects.all()
    if mechanic_query:
        mechanics_qs = mechanics_qs.filter(
            Q(full_name__icontains=mechanic_query) |
            Q(email__icontains=mechanic_query) |
            Q(phone__icontains=mechanic_query)
        )

    drivers_paged = Paginator(drivers_qs, 5).get_page(request.GET.get('driver_page'))
    mechanics_paged = Paginator(mechanics_qs, 5).get_page(request.GET.get('mechanic_page'))

    return render(request, 'managers/personnel_management.html', {
        'greeting': get_greeting(),
        'name': request.user.get_full_name() or request.user.username,
        'drivers': drivers_paged,
        'mechanics': mechanics_paged,
        'driver_query': driver_query,
        'mechanic_query': mechanic_query,
    })

@login_required
def add_user_form(request):
    if request.method == 'POST':
        # Required fields
        role = request.POST.get('role')
        first_name = request.POST.get('firstName')
        last_name = request.POST.get('lastName')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone')
        id_number = request.POST.get('idNumber')
        location = request.POST.get('location')
        experience_years = request.POST.get('experienceYears')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirmPassword')

        # Optional fields
        drivers_license = request.POST.get('driversLicense')
        license_class = request.POST.get('licenseClass')
        department = request.POST.get('department')
        supervisor = request.POST.get('supervisor')
        specialization = request.POST.get('specialization')

        # === Validation ===
        if not all([role, first_name, last_name, email, phone_number, experience_years, password, confirm_password]):
            messages.error(request, 'Required fields missing.')
            return redirect('managers:add_user')

        if role not in ['driver', 'mechanic']:
            messages.error(request, 'Invalid role selected.')
            return redirect('managers:add_user')

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return redirect('managers:add_user')

        if len(password) < 8 or not re.search(r'[A-Z]', password) or not re.search(r'[a-z]', password) or \
           not re.search(r'\d', password) or not re.search(r'[@$!%*?&]', password):
            messages.error(request, 'Password must be strong: min 8 chars, upper, lower, number & special.')
            return redirect('managers:add_user')

        # Duplicate checks
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already used.')
            return redirect('managers:add_user')

        if User.objects.filter(phone_number=phone_number).exists():
            messages.error(request, 'Phone number already used.')
            return redirect('managers:add_user')

        if User.objects.filter(id_no=id_number).exists():
            messages.error(request, 'ID number already used.')
            return redirect('managers:add_user')

        if role == 'driver' and drivers_license and User.objects.filter(dl_no=drivers_license).exists():
            messages.error(request, 'Driver’s license already used.')
            return redirect('managers:add_user')

        # === Creation ===
        try:
            full_name = f"{first_name} {last_name}".strip()
            username = f"{role}_{uuid.uuid4().hex[:8]}"

            user = User.objects.create(
                username=username,
                email=email,
                phone_number=phone_number,
                first_name=first_name,
                last_name=last_name,
                role=role,
                dl_no=drivers_license if role == 'driver' else '',
                id_no=id_number,
                location=location,
                is_active=True
            )
            user.set_password(password)
            user.save()

            if role == 'driver':
                DriverProfile.objects.create(
                    user=user,
                    driver_id=generate_unique_id('DRV'),
                    phone_number=phone_number,
                    license_class=license_class,
                    experience_years=int(experience_years),
                    department=department,
                    supervisor=supervisor
                )

            else:  # mechanic
                MechanicProfile.objects.create(
                    user=user,
                    mechanic_id=generate_unique_id('MEC'),
                    full_name=full_name,
                    phone=phone_number,
                    email=email,
                    experience_years=int(experience_years),
                    location=location,
                    specialization=specialization,
                    status='active'
                )

            messages.success(request, f"{role.capitalize()} '{full_name}' added successfully.")
            return redirect('managers:personnel')

        except Exception as e:
            print(f"[ERROR] User creation failed: {e}")
            messages.error(request, 'Something went wrong while adding the user.')
            return redirect('managers:add_user')

    # GET method → render the form
    return render(request, 'managers/add_user.html')

@login_required
def jobs(request):
    return render(request, 'managers/job_management.html')

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
def drivers(request):
    return render(request, 'managers/drivers.html')

@login_required
def assignments(request):
    return render(request, 'managers/assignments.html')