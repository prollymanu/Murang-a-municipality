from django.urls import path
from . import views

app_name = 'drivers'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('maintenance/', views.maintenance, name='maintenance'),
    path('maintenance/new/', views.create_request, name='new_request'),
    path('maintenance/<int:request_id>/', views.request_detail, name='request_detail'),
    path('notifications/', views.notifications, name='notifications'),
    path('profile/', views.profile, name='profile'),
    path('profile/edit/', views.profile_edit, name='profile_edit'),
    path('support/', views.support, name='support'),
    path('support/', views.support, name='support'),
    path('vehicle/', views.vehicle, name='vehicle'),

]

