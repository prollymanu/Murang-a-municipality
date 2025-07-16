from django.shortcuts import render, redirect
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user
from .models import DriverProfile, MaintenanceRequest, RequestIssue, Vehicle, SupportRequest
from django.core.paginator import Paginator
from django.db.models import Q
from django.core.exceptions import ValidationError
import logging

# Set up logging
logger = logging.getLogger(__name__)

@login_required
def dashboard(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        driver = DriverProfile.objects.get(user=user)
        context = {
            "greeting": greeting,
            "name": user.get_full_name() or user.username,
            "driver": driver,
        }
        return render(request, "drivers/dashboard.html", context)
    except DriverProfile.DoesNotExist:
        logger.warning(f"No DriverProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a driver profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def profile(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        driver = DriverProfile.objects.get(user=user)
        context = {
            "greeting": greeting,
            "name": user.get_full_name() or user.username,
            "driver": driver,
            "dl_no": user.dl_no,
        }
        return render(request, 'drivers/profile.html', context)
    except DriverProfile.DoesNotExist:
        logger.warning(f"No DriverProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a driver profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def profile_edit(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        driver = DriverProfile.objects.get(user=user)
        if request.method == 'POST':
            if 'profile_image' in request.FILES:
                driver.profile_image = request.FILES['profile_image']
                driver.save()
                messages.success(request, "Profile picture updated successfully!")
                return redirect('drivers:profile')

            full_name = request.POST.get('full_name')
            phone_number = request.POST.get('phone_number')
            email = request.POST.get('email')
            dl_no = request.POST.get('dl_no')
            license_class_list = request.POST.getlist('license_class')
            license_class = ','.join(license_class_list)
            experience = request.POST.get('experience')
            department = request.POST.get('department')
            supervisor = request.POST.get('supervisor')
            current_vehicle = request.POST.get('current_vehicle')

            user.first_name = full_name.split(' ')[0]
            user.last_name = ' '.join(full_name.split(' ')[1:]) if len(full_name.split(' ')) > 1 else ''
            user.email = email
            user.phone_number = phone_number
            user.dl_no = dl_no if user.role == 'driver' else None
            user.save()

            driver.phone_number = phone_number
            driver.license_class = license_class
            driver.experience_years = int(experience) if experience else 0
            driver.department = department
            driver.supervisor = supervisor
            driver.current_vehicle = current_vehicle
            driver.save()

            messages.success(request, "Profile updated successfully!")
            return redirect('drivers:profile')

        license_class_list = driver.license_class.split(',') if driver and driver.license_class else []
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
            "dl_no": user.dl_no,
            "greeting": greeting,
        })
    except DriverProfile.DoesNotExist:
        logger.warning(f"No DriverProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a driver profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def maintenance(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        driver = DriverProfile.objects.get(user=user)
        status = request.GET.get('status', 'all')
        query = request.GET.get('q', '')
        sort = request.GET.get('sort', 'submitted_at')

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

        paginator = Paginator(requests, 5)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context = {
            'maintenance_requests': page_obj,
            'selected_status': status,
            'query': query,
            'sort': sort,
            'page_obj': page_obj,
            'greeting': greeting,
        }
        return render(request, 'drivers/maintenance.html', context)
    except DriverProfile.DoesNotExist:
        logger.warning(f"No DriverProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a driver profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def request_detail(request, request_id):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        driver = DriverProfile.objects.get(user=user)
        maintenance_request = MaintenanceRequest.objects.get(id=request_id, driver=driver)
        return render(request, 'drivers/request_detail.html', {
            'request_obj': maintenance_request,
            'greeting': greeting,
        })
    except (DriverProfile.DoesNotExist, MaintenanceRequest.DoesNotExist):
        logger.warning(f"No DriverProfile or MaintenanceRequest for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a driver profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def create_request(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        driver = DriverProfile.objects.get(user=user)
        if request.method == 'POST':
            vehicle_plate = request.POST.get('vehicle')
            mileage = request.POST.get('mileage')
            description = request.POST.get('description')

            vehicle, _ = Vehicle.objects.get_or_create(number_plate=vehicle_plate.upper(), defaults={
                'make': 'Unknown',
            })

            maintenance_request = MaintenanceRequest.objects.create(
                driver=driver,
                vehicle=vehicle,
                mileage=mileage,
                status='pending',
                last_update="Submitted",
            )

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

        return render(request, 'drivers/new_request.html', {'greeting': greeting})
    except DriverProfile.DoesNotExist:
        logger.warning(f"No DriverProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a driver profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def notifications(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        driver = DriverProfile.objects.get(user=user)
        return render(request, 'drivers/notifications.html', {'greeting': greeting})
    except DriverProfile.DoesNotExist:
        logger.warning(f"No DriverProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a driver profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def support(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        driver = DriverProfile.objects.get(user=user)
        if request.method == 'POST':
            subject = request.POST.get('subject')
            message = request.POST.get('message')
            attachment = request.FILES.get('supportFiles')

            if not subject or not message:
                messages.error(request, "Subject and message are required fields.")
                return redirect('drivers:support')

            support_request = SupportRequest.objects.create(
                user=user,
                subject=subject,
                message=message,
                attachment=attachment if attachment else None,
            )

            messages.success(request, "Your support request has been submitted successfully.")
            return redirect('drivers:support')

        return render(request, 'drivers/support.html', {'greeting': greeting})
    except DriverProfile.DoesNotExist:
        logger.warning(f"No DriverProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a driver profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def vehicle(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        driver = DriverProfile.objects.get(user=user)
        return render(request, 'drivers/vehicle.html', {'greeting': greeting})
    except DriverProfile.DoesNotExist:
        logger.warning(f"No DriverProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a driver profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')