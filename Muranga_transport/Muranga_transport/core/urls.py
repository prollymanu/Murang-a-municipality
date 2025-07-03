from django.urls import path
from .views import (
    RoleBasedLoginView, 
    driver_dashboard, 
    mechanic_dashboard, 
    manager_dashboard, 
    officer_dashboard,
    logout_view
)

urlpatterns = [
    path('login/', RoleBasedLoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('driver/dashboard/', driver_dashboard, name='driver_dashboard'),
    path('mechanic/dashboard/', mechanic_dashboard, name='mechanic_dashboard'),
    path('manager/dashboard/', manager_dashboard, name='manager_dashboard'),
    path('officer/dashboard/', officer_dashboard, name='officer_dashboard'),
]
