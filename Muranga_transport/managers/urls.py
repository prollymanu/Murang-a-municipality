from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'managers'

urlpatterns = [
    # Dashboard & General
    path('dashboard/', views.dashboard, name='dashboard'),
    path('job-management/', views.jobs, name='job_management'),
    path('reports/', views.reports, name='reports'),
    path('reports/export/', views.export_reports, name='export_reports'),
    path('reports/<str:report_type>/<str:report_id>/', views.report_details, name='report_details'),
    path('settings/', views.settings, name='settings'),
    path('support/', views.support, name='support_requests'),
    path('drivers/', views.drivers, name='drivers'),
    path('assignments/', views.assignments, name='assignments'),

    # Maintenance Requests
    path('maintenance/', views.maintenance, name='maintenance'),
    path('maintenance/<int:id>/', views.request_detail, name='request_detail'),
    path('maintenance/<int:id>/approve/', views.approve_request, name='approve_request'),
    path('maintenance/<int:id>/unapprove/', views.unapprove_request, name='unapprove_request'),
    path('maintenance/<int:id>/deny/', views.deny_request, name='deny_request'),
    path('maintenance/<int:id>/assign-mechanic/', views.assign_mechanic, name='assign_mechanic'),

    # User Applications & Personnel
    path('applications/', views.applications_view, name='applications'),
    path('applications/<int:id>/approve/', views.approve_registration, name='approve_registration'),
    path('applications/<int:id>/deny/', views.deny_registration, name='deny_registration'),
    path('applications/add/', views.add_user_form, name='add_user'),

    path('personnel/', views.personnel_management, name='personnel'),
    path('personnel/add/', views.add_user_form, name='add_user'),
    path('personnel/driver/<int:id>/delete/', views.delete_driver, name='delete_driver'),
    path('personnel/mechanic/<int:id>/delete/', views.delete_mechanic, name='delete_mechanic'),

    #  Repair Invoices (Clean & Complete)
    path('invoices/', views.repair_invoices, name='repair_invoices'),
    path('invoices/<int:invoice_id>/approve/', views.approve_invoice, name='approve_invoice'),
    path('invoices/<int:invoice_id>/reject/', views.reject_invoice, name='reject_invoice'),
    path('invoices/<int:invoice_id>/unapprove/', views.unapprove_invoice, name='unapprove_invoice'),
    path('invoices/<int:invoice_id>/unreject/', views.unreject_invoice, name='unreject_invoice'),
    path('invoices/export/<str:format>/', views.export_invoices, name='export_invoices'),
]
