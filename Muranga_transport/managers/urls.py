from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'managers'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('job-management/', views.jobs, name='job_management'),
    path('maintenance/', views.maintenance, name='maintenance'),
    path('maintenance/<int:id>/', views.request_detail, name='request_detail'),
    path('maintenance/<int:id>/approve/', views.approve_request, name='approve_request'),
    path('maintenance/<int:id>/deny/', views.deny_request, name='deny_request'),
    path('maintenance/<int:id>/assign-mechanic/', views.assign_mechanic, name='assign_mechanic'),
    path('applications/', views.applications_view, name='applications'),
    path('applications/<int:id>/approve/', views.approve_registration, name='approve_registration'),
    path('applications/<int:id>/deny/', views.deny_registration, name='deny_registration'),
    path('applications/add/', views.add_user_form, name='add_user'),
    path('personnel/', views.personnel_management, name='personnel'),
    path('personnel/add/', views.add_user_form, name='add_user'),
    path('personnel/driver/<int:id>/delete/', views.delete_driver, name='delete_driver'),
    path('personnel/mechanic/<int:id>/delete/', views.delete_mechanic, name='delete_mechanic'),
    path('invoices/', views.invoices, name='repair_invoices'),
    path('reports/', views.reports, name='reports'),
    path('settings/', views.settings, name='settings'),
    path('support/', views.support, name='support_requests'),
    path('drivers/', views.drivers, name='drivers'),
    path('assignments/', views.assignments, name='assignments'),
]