from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as auth_logout

def role_required(role):
    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):
            if request.user.is_authenticated and request.user.role == role:
                return view_func(request, *args, **kwargs)
            return redirect('login')
        return _wrapped_view
    return decorator

class RoleBasedLoginView(LoginView):
    template_name = 'login.html'  # You'll create this

    def get_success_url(self):
        user = self.request.user
        if user.role == 'driver':
            return '/driver/dashboard/'
        elif user.role == 'mechanic':
            return '/mechanic/dashboard/'
        elif user.role == 'transport_manager':
            return '/manager/dashboard/'
        return '/'

@login_required
@role_required('driver')
def driver_dashboard(request):
    return render(request, 'driver_dashboard.html')

@login_required
@role_required('mechanic')
def mechanic_dashboard(request):
    return render(request, 'mechanic_dashboard.html')

@login_required
@role_required('transport_manager')
def manager_dashboard(request):
    return render(request, 'manager_dashboard.html')

@login_required
@role_required('chief_officer')
def officer_dashboard(request):
    return render(request, 'officer_dashboard.html')

@login_required
def logout_view(request):
    auth_logout(request)
    return redirect('login')

