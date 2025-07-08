from django.urls import path
from . import views

app_name = 'mechanics'

urlpatterns = [
    path('dashboard/', views.mechanic_dashboard, name='dashboard'),
    path('profile/', views.profile, name='profile'),
    path('profile/edit/', views.profile_edit, name='profile_edit'),
    path('invoices/', views.invoices, name='invoices'),
    path('notifications/', views.notifications, name='notifications'),
    path('repair_invoice/', views.repair_invoice_generic, name='repair_invoice_generic'),
    path('invoice/<int:invoice_id>/download/', views.download_invoice, name='download_invoice'),
    path('invoices/export/pdf/', views.export_invoices_pdf, name='export_invoices_pdf'),
    path('invoices/export/excel/', views.export_invoices_excel, name='export_invoices_excel'),
    path('invoice/<int:invoice_id>/download/', views.download_invoice, name='download_invoice'),
    path('support/', views.support, name='support'),
    path('tasks/', views.tasks, name='tasks'),
    path('tasks/<int:pk>/detail/', views.task_detail, name='task_detail'),
    path('tasks/<int:pk>/update/', views.update_task_progress, name='update_task_progress'),
    path('tasks/<int:pk>/complete/', views.complete_task, name='complete_task'),
    path('tasks/<int:task_id>/invoice/', views.submit_invoice, name='submit_invoice'),
    

]

