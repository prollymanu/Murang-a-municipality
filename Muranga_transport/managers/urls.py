from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'managers'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('job-management/', views.jobs, name='job_management'),
    path('maintenance/', views.maintenance, name='maintenance'),
    path('maintenance/<int:id>/', views.request_detail, name='request_detail'),
    path('invoices/', views.invoices, name='repair_invoices'),
    path('reports/', views.reports, name='reports'),
    path('settings/', views.settings, name='settings'),
    path('support/', views.support, name='support_requests'),
    path('applications/', views.applications, name='applications'),
    path('maintenance/<int:id>/approve/', views.approve_request, name='approve_request'),
    path('maintenance/<int:id>/deny/', views.deny_request, name='deny_request'),
    path('maintenance/<int:id>/assign-mechanic/', views.assign_mechanic, name='assign_mechanic'),
    path('drivers/', views.drivers, name='drivers'),
    path('assignments/', views.assignments, name='assignments'),
]