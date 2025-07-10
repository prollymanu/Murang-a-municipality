from django.shortcuts import render, redirect
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from .models import DriverProfile
from .models import MaintenanceRequest, RequestIssue, Vehicle
from django.http import HttpResponseForbidden

from django.core.paginator import Paginator
from django.db.models import Q
from django.core.exceptions import ValidationError

from .models import SupportRequest

@login_required
def dashboard(request):
    user = request.user
    now = timezone.localtime(timezone.now())
    hour = now.hour

    if 5 <= hour < 12:
        greeting = "Good morning"
    elif 12 <= hour < 17:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"

    try:
        driver = user.driverprofile
    except DriverProfile.DoesNotExist:
        driver = None

    context = {
        "greeting": greeting,
        "name": user.get_full_name() or user.username,
        "driver": driver,
    }
    return render(request, "drivers/dashboard.html", context)

@login_required
def profile(request):
    user = request.user
    now = timezone.localtime(timezone.now())
    hour = now.hour

    if 5 <= hour < 12:
        greeting = "Good morning"
    elif 12 <= hour < 17:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"

    try:
        driver = user.driverprofile
    except DriverProfile.DoesNotExist:
        driver = None

    context = {
        "greeting": greeting,
        "name": user.get_full_name() or user.username,
        "driver": driver,
    }
    return render(request, 'drivers/profile.html', context)

@login_required
def profile_edit(request):
    user = request.user
    try:
        driver = user.driverprofile
    except DriverProfile.DoesNotExist:
        return HttpResponseForbidden("You are not authorized to access this page.")

    if request.method == 'POST':
        if driver:
            # Handle profile image upload separately
            if 'profile_image' in request.FILES:
                driver.profile_image = request.FILES['profile_image']
                driver.save()
                messages.success(request, "Profile picture updated successfully!")
                return redirect('drivers:profile')

        # Handle full profile update
        full_name = request.POST.get('full_name')
        phone_number = request.POST.get('phone_number')
        email = request.POST.get('email')
        license_class_list = request.POST.getlist('license_class')
        license_class = ','.join(license_class_list)
        experience = request.POST.get('experience')
        department = request.POST.get('department')
        supervisor = request.POST.get('supervisor')
        current_vehicle = request.POST.get('current_vehicle')

        user.first_name = full_name.split(' ')[0]
        user.last_name = ' '.join(full_name.split(' ')[1:]) if len(full_name.split(' ')) > 1 else ''
        user.email = email
        user.save()

        if driver:
            driver.phone_number = phone_number
            driver.license_class = license_class
            driver.experience_years = int(experience) if experience else 0
            driver.department = department
            driver.supervisor = supervisor
            driver.current_vehicle = current_vehicle
            driver.save()

        messages.success(request, "Profile updated successfully!")
        return redirect('drivers:profile')

    license_class_list = []
    if driver and driver.license_class:
        license_class_list = driver.license_class.split(',')

    license_options = [
        ('A', 'A - Motorcycle'),
        ('B', 'B - Personal Vehicle'),
        ('C', 'C - Light Commercial'),
        ('D', 'D - Heavy Commercial'),
        ('E', 'E - Heavy Articulated'),
        ('F', 'F - Construction Equipment'),
        ('G', 'G - Agricultural Tractor'),
    ]

    return render(request, 'drivers/profile_edit.html', {
        "name": user.get_full_name() or user.username,
        "driver": driver,
        "license_class_list": license_class_list,
        "license_options": license_options,
    })


def maintenance(request):
    user = request.user
    driver = user.driverprofile

    # Filter by status if provided
    status = request.GET.get('status', 'all')
    query = request.GET.get('q', '')
    sort = request.GET.get('sort', 'submitted_at')  # default sort

    requests = MaintenanceRequest.objects.filter(driver=driver)

    if status != 'all':
        requests = requests.filter(status=status)

    if query:
        requests = requests.filter(
            Q(vehicle__number_plate__icontains=query) |
            Q(issues__title__icontains=query) |
            Q(issues__description__icontains=query)
        ).distinct()

    if sort in ['submitted_at', '-submitted_at', 'status', '-status']:
        requests = requests.order_by(sort)

    # Pagination
    paginator = Paginator(requests, 5)  # 5 per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'maintenance_requests': page_obj,
        'selected_status': status,
        'query': query,
        'sort': sort,
        'page_obj': page_obj
    }
    return render(request, 'drivers/maintenance.html', context)

@login_required
def request_detail(request, request_id):
    try:
        maintenance_request = MaintenanceRequest.objects.get(id=request_id, driver=request.user.driverprofile)
    except MaintenanceRequest.DoesNotExist:
        messages.error(request, "Maintenance request not found.")
        return redirect('drivers:maintenance')

    return render(request, 'drivers/request_detail.html', {
        'request_obj': maintenance_request,
    })

@login_required
def create_request(request):
    if request.method == 'POST':
        try:
            driver = request.user.driverprofile
            vehicle_plate = request.POST.get('vehicle')
            mileage = request.POST.get('mileage')
            description = request.POST.get('description')

            # Create or get vehicle
            vehicle, _ = Vehicle.objects.get_or_create(number_plate=vehicle_plate.upper(), defaults={
                'make': 'Unknown',
            })

            # Create the request
            maintenance_request = MaintenanceRequest.objects.create(
                driver=driver,
                vehicle=vehicle,
                mileage=mileage,
                status='pending',
                last_update="Submitted",
            )

            # Handle multiple issues
            titles = request.POST.getlist('issue_title[]')
            descriptions = request.POST.getlist('issue_description[]')
            priorities = request.POST.getlist('priority[]')
            costs = request.POST.getlist('estimated_cost[]')

            for i in range(len(titles)):
                RequestIssue.objects.create(
                    request=maintenance_request,
                    title=titles[i],
                    description=descriptions[i],
                    priority=priorities[i],
                    cost_estimate=costs[i]
                )

            messages.success(request, "Maintenance request submitted successfully.")
            return redirect('drivers:maintenance')

        except Exception as e:
            import traceback
            traceback.print_exc()
            messages.error(request, "Failed to submit maintenance request.")
    
    return render(request, 'drivers/new_request.html')

@login_required
def notifications(request):
    return render(request, 'drivers/notifications.html')

@login_required
def support(request):
    return render(request, 'drivers/support.html')

@login_required
def support(request):
    if request.method == 'POST':
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        attachment = request.FILES.get('supportFiles')

        if not subject or not message:
            messages.error(request, "Subject and message are required fields.")
            return redirect('drivers:support')

        support_request = SupportRequest.objects.create(
            user=request.user,
            subject=subject,
            message=message,
            attachment=attachment if attachment else None,
        )

        messages.success(request, "Your support request has been submitted successfully.")
        return redirect('drivers:support')

    return render(request, 'drivers/support.html')


@login_required
def vehicle(request):
    return render(request, 'drivers/vehicle.html')
