from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import RegistrationRequest
import re

User = get_user_model()

MAX_ATTEMPTS = 5
LOCKOUT_TIME = 5 * 60  # 5 minutes


def login_view(request):
    if request.method == 'POST':
        identifier = request.POST.get('identifier')
        password = request.POST.get('password')

        cache_key = f'login_attempts_{identifier}'
        attempts = cache.get(cache_key, 0)

        if attempts >= MAX_ATTEMPTS:
            return render(request, 'core/login.html', {
                'error': 'Too many failed attempts. Please wait a few minutes and try again.'
            })

        user = User.objects.filter(email=identifier).first()
        if not user:
            user = User.objects.filter(phone_number=identifier).first()

        if user and user.check_password(password):
            if not user.is_active:
                return render(request, 'core/login.html', {
                    'error': 'Account is disabled. Contact admin.'
                })

            login(request, user)
            cache.delete(cache_key)

            # Redirect by role
            if user.role == 'driver':
                return redirect('drivers:dashboard')
            elif user.role == 'mechanic':
                return redirect('mechanics:dashboard')
            elif user.role == 'transport_manager':
                return redirect('managers:dashboard')
            elif user.role == 'chief_officer':
                return redirect('officers:dashboard')
            else:
                return redirect('admin:index')

        # Failed login
        attempts += 1
        cache.set(cache_key, attempts, LOCKOUT_TIME)
        return render(request, 'core/login.html', {
            'error': f'Invalid credentials. Attempt {attempts}/{MAX_ATTEMPTS}.'
        })

    return render(request, 'core/login.html')


def register_view(request):
    if request.method == 'POST':
        role = request.POST.get('role')
        full_name = request.POST.get('fullName')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone')
        drivers_license = request.POST.get('license')
        license_class = request.POST.get('licenseClass')
        experience_years = request.POST.get('experienceYears')
        department = request.POST.get('department')
        supervisor = request.POST.get('supervisor')
        id_number = request.POST.get('idNumber')
        location = request.POST.get('location')
        specialization = request.POST.get('specialization')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirmPassword')

        # Basic validation
        if not all([role, full_name, email, phone_number, experience_years, password, confirm_password]):
            messages.error(request, 'Required fields missing.')
            return redirect('core:register')

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return redirect('core:register')

        if len(password) < 8 or not re.search(r'[A-Z]', password) or \
           not re.search(r'[a-z]', password) or not re.search(r'\d', password) or \
           not re.search(r'[@$!%*?&]', password):
            messages.error(request, 'Password must be strong: 8+ chars, uppercase, lowercase, digit & special char.')
            return redirect('core:register')

        if role == 'driver' and not (drivers_license and license_class):
            messages.error(request, 'Driver’s license number and class are required.')
            return redirect('core:register')

        if role == 'mechanic' and not id_number:
            messages.error(request, 'Mechanic ID number is required.')
            return redirect('core:register')

        # Uniqueness checks
        if User.objects.filter(email=email).exists() or RegistrationRequest.objects.filter(email=email).exists():
            messages.error(request, 'Email is already in use.')
            return redirect('core:register')
        if User.objects.filter(phone_number=phone_number).exists() or RegistrationRequest.objects.filter(phone_number=phone_number).exists():
            messages.error(request, 'Phone number already in use.')
            return redirect('core:register')
        if role == 'driver' and RegistrationRequest.objects.filter(drivers_license=drivers_license).exists():
            messages.error(request, 'License number already in use.')
            return redirect('core:register')
        if id_number and (User.objects.filter(id_no=id_number).exists() or RegistrationRequest.objects.filter(id_number=id_number).exists()):
            messages.error(request, 'ID number already in use.')
            return redirect('core:register')

        # Save registration request
        try:
            RegistrationRequest.objects.create(
                role=role,
                full_name=full_name,
                email=email,
                phone_number=phone_number,
                drivers_license=drivers_license or '',
                license_class=license_class or '',
                experience_years=int(experience_years),
                department=department or '',
                supervisor=supervisor or '',
                id_number=id_number or '',
                location=location or '',
                specialization=specialization or '',
                password=make_password(password),
                is_approved=False
            )
            messages.success(request, 'Registration request submitted successfully.')
            return redirect('core:register')
        except Exception as e:
            print(f"Error saving registration request: {e}")
            messages.error(request, 'An error occurred. Try again.')
            return redirect('core:register')

    return render(request, 'core/register.html')


def forgot_password_view(request):
    return render(request, 'core/forgot_password.html')


def logout_view(request):
    logout(request)
    return redirect('core:login')