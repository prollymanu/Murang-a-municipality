from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import RegistrationRequest
import re
from drivers.models import KENYA_LICENSE_CLASSES

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
        print("POST data:", dict(request.POST))  # Debug form data
        role = request.POST.get('role')
        full_name = request.POST.get('full_name')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone_number')
        drivers_license = request.POST.get('drivers_license')
        license_class = request.POST.getlist('license_class')  # Multiple checkboxes
        experience_years = request.POST.get('experience_years')
        department = request.POST.get('department')
        supervisor = request.POST.get('supervisor')
        id_number = request.POST.get('id_number')
        location = request.POST.get('location')
        specialization = request.POST.get('specialization')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        terms = request.POST.get('terms')

        # Basic validation
        if not all([role, full_name, email, phone_number, experience_years, password, confirm_password, terms]):
            missing = [k for k, v in {'role': role, 'full_name': full_name, 'email': email, 'phone_number': phone_number, 
                                     'experience_years': experience_years, 'password': password, 'confirm_password': confirm_password, 
                                     'terms': terms}.items() if not v]
            messages.error(request, f'Missing required fields: {", ".join(missing)}.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        if role not in ['driver', 'mechanic']:
            messages.error(request, 'Invalid role selected.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        if len(password) < 8 or not re.search(r'[A-Z]', password) or \
           not re.search(r'[a-z]', password) or not re.search(r'\d', password) or \
           not re.search(r'[@$!%*?&]', password):
            messages.error(request, 'Password must be strong: 8+ chars, uppercase, lowercase, digit & special char.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        if role == 'driver' and not (drivers_license and license_class):
            missing_driver = []
            if not drivers_license:
                missing_driver.append('license number')
            if not license_class:
                missing_driver.append('license class')
            messages.error(request, f'Driver’s {", ".join(missing_driver)} required.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        if role == 'mechanic' and not id_number:
            messages.error(request, 'Mechanic ID number is required.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        # Validate license classes
        if role == 'driver':
            valid_codes = [code for code, _ in KENYA_LICENSE_CLASSES]
            for code in license_class:
                if code not in valid_codes:
                    messages.error(request, f"Invalid license class: {code}. Must be one of {', '.join(valid_codes)}.")
                    return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})
            if len(license_class) != len(set(license_class)):
                messages.error(request, 'Duplicate license classes are not allowed.')
                return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        # Uniqueness checks
        if User.objects.filter(email=email).exists() or RegistrationRequest.objects.filter(email=email).exists():
            messages.error(request, 'Email is already in use.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        if User.objects.filter(phone_number=phone_number).exists() or RegistrationRequest.objects.filter(phone_number=phone_number).exists():
            messages.error(request, 'Phone number already in use.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        if role == 'driver' and drivers_license and RegistrationRequest.objects.filter(drivers_license=drivers_license).exists():
            messages.error(request, 'License number already in use.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        if id_number and (User.objects.filter(id_no=id_number).exists() or RegistrationRequest.objects.filter(id_number=id_number).exists()):
            messages.error(request, 'ID number already in use.')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

        # Save registration request
        try:
            RegistrationRequest.objects.create(
                role=role,
                full_name=full_name,
                email=email,
                phone_number=phone_number,
                drivers_license=drivers_license or '',
                license_class=','.join(license_class) if role == 'driver' and license_class else '',
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
            return redirect('core:login')
        except Exception as e:
            print(f"Error saving registration request: {str(e)}")
            messages.error(request, f'Registration failed: {str(e)}')
            return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES, 'form_data': request.POST})

    return render(request, 'core/register.html', {'KENYA_LICENSE_CLASSES': KENYA_LICENSE_CLASSES})

def forgot_password_view(request):
    return render(request, 'core/forgot_password.html')


def logout_view(request):
    logout(request)
    return redirect('core:login')