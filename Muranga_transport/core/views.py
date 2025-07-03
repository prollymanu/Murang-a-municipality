from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.contrib import messages
from django.conf import settings
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

        else:
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
        license = request.POST.get('license')
        id_number = request.POST.get('idNumber')
        location = request.POST.get('location')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirmPassword')

        # Server-side password checks (backup)
        if len(password) < 8 or \
           not re.search(r'[A-Z]', password) or \
           not re.search(r'[a-z]', password) or \
           not re.search(r'\d', password) or \
           not re.search(r'[@$!%*?&]', password):
            messages.error(request, 'Password does not meet the requirements.')
            return redirect('core:register')

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return redirect('core:register')

        try:
            RegistrationRequest.objects.create(
                role=role,
                full_name=full_name,
                email=email,
                phone_number=phone_number,
                drivers_license=license if role == 'driver' else '',
                id_number=id_number if role == 'mechanic' else '',
                location=location if role == 'mechanic' else '',
                password=make_password(password),
                is_approved=False
            )
            messages.success(request, 'Request to create account received. Please wait for approval.')
            return redirect('core:register')

        except Exception as e:
            print(e)
            messages.error(request, 'Something went wrong. Please try again later.')
            return redirect('core:register')

    return render(request, 'core/register.html')


def forgot_password_view(request):
    return render(request, 'core/forgot_password.html')


def logout_view(request):
    logout(request)
    return redirect('core:login')
