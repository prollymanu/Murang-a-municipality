from django.shortcuts import render, redirect
from django.utils import timezone
from django.http import JsonResponse, FileResponse, HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Sum
from django.urls import reverse
from django.contrib.auth import get_user
import json
import io
import openpyxl
from reportlab.pdfgen import canvas
from .models import MechanicProfile, MechanicTask, RepairInvoice, RepairInvoicePhoto, MechanicSupportRequest, MechanicSupportAttachment
from drivers.models import MaintenanceRequest, Vehicle
from .forms import MechanicProfileForm, RepairInvoiceForm, MechanicSupportForm
import logging

# Set up logging
logger = logging.getLogger(__name__)

@login_required
def mechanic_dashboard(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        tasks_completed = MechanicTask.objects.filter(mechanic=mechanic, status='completed').count()
        assigned_tasks = MechanicTask.objects.filter(mechanic=mechanic).exclude(status='completed').order_by('-assigned_at')
        context = {
            "greeting": greeting,
            "mechanic": mechanic,
            "name": mechanic.full_name or user.get_full_name() or user.username,
            "tasks_completed": tasks_completed,
            "assigned_tasks": assigned_tasks,
        }
        return render(request, 'mechanics/dashboard.html', context)
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def profile(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        recent_tasks = MechanicTask.objects.filter(mechanic=mechanic).order_by('-assigned_at')[:5]
        return render(request, 'mechanics/profile.html', {
            'mechanic': mechanic,
            'recent_tasks': recent_tasks,
            'greeting': greeting,
        })
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def profile_edit(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        if request.method == 'POST':
            form = MechanicProfileForm(request.POST, request.FILES, instance=mechanic, user=user)
            if form.is_valid():
                updated_mechanic = form.save(commit=False)
                specializations = request.POST.getlist('specialization')
                updated_mechanic.specialization = ','.join(specializations)
                updated_mechanic.save()
                user.phone_number = form.cleaned_data.get('phone_number')
                user.email = form.cleaned_data.get('email')
                user.save()
                messages.success(request, "Profile updated successfully!")
                return redirect('mechanics:profile')
            else:
                messages.error(request, "Please correct the errors below.")
        else:
            form = MechanicProfileForm(instance=mechanic, user=user, initial={
                'phone_number': user.phone_number,
                'email': user.email,
            })
        return render(request, 'mechanics/profile_edit.html', {
            'form': form,
            'mechanic': mechanic,
            'greeting': greeting,
        })
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def repair_invoice(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        if request.method == 'POST':
            form = RepairInvoiceForm(request.POST, request.FILES)
            if form.is_valid():
                task_unique_id = form.cleaned_data.get('task_unique_id')
                vehicle_number = form.cleaned_data.get('vehicle_number')
                try:
                    task = MechanicTask.objects.get(unique_task_id=task_unique_id, mechanic=mechanic)
                    try:
                        vehicle = Vehicle.objects.get(number_plate=vehicle_number)
                        if task.maintenance_request.vehicle != vehicle:
                            form.add_error('vehicle_number', "The vehicle number does not match the task's associated vehicle.")
                            return render(request, 'mechanics/repair_invoice.html', {
                                'mechanic': mechanic,
                                'form': form,
                                'greeting': greeting,
                            })
                    except Vehicle.DoesNotExist:
                        form.add_error('vehicle_number', "The vehicle number does not exist.")
                        return render(request, 'mechanics/repair_invoice.html', {
                            'mechanic': mechanic,
                            'form': form,
                            'greeting': greeting,
                        })
                    if hasattr(task, 'invoice') and task.invoice.status != 'rejected':
                        form.add_error(None, "An invoice for this task already exists and is not rejected.")
                        return render(request, 'mechanics/repair_invoice.html', {
                            'mechanic': mechanic,
                            'form': form,
                            'greeting': greeting,
                        })
                    if task.status != 'completed':
                        form.add_error(None, "Task must be completed before submitting an invoice.")
                        return render(request, 'mechanics/repair_invoice.html', {
                            'mechanic': mechanic,
                            'form': form,
                            'greeting': greeting,
                        })
                    invoice = form.save(commit=False)
                    invoice.mechanic_task = task
                    invoice.task_unique_id = task.unique_task_id
                    invoice.save()
                    for file in request.FILES.getlist('photos'):
                        if file.size > 5 * 1024 * 1024:
                            invoice.delete()
                            form.add_error(None, f"File {file.name} exceeds 5MB limit.")
                            return render(request, 'mechanics/repair_invoice.html', {
                                'mechanic': mechanic,
                                'form': form,
                                'greeting': greeting,
                            })
                        RepairInvoicePhoto.objects.create(invoice=invoice, image=file)
                    messages.success(request, f"Invoice for task {task.unique_task_id} submitted successfully!")
                    return redirect('mechanics:invoices')
                except MechanicTask.DoesNotExist:
                    form.add_error('task_unique_id', "Invalid task ID or task not assigned to you.")
                    return render(request, 'mechanics/repair_invoice.html', {
                        'mechanic': mechanic,
                        'form': form,
                        'greeting': greeting,
                    })
            else:
                messages.error(request, "Please correct the errors in the form.")
        else:
            form = RepairInvoiceForm()
        return render(request, 'mechanics/repair_invoice.html', {
            'mechanic': mechanic,
            'form': form,
            'greeting': greeting,
        })
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def invoices(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        invoices = RepairInvoice.objects.filter(mechanic_task__mechanic=mechanic).order_by('-created_at')
        status = request.GET.get('status')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if status in ['paid', 'pending', 'rejected', 'approved']:
            invoices = invoices.filter(status=status)
        if start_date:
            invoices = invoices.filter(created_at__gte=start_date)
        if end_date:
            invoices = invoices.filter(created_at__lte=end_date)

        period = request.GET.get('period', '30d')
        period_start = (
            timezone.now() - timezone.timedelta(days=30) if period == '30d' else
            timezone.now() - timezone.timedelta(days=180) if period == '6m' else
            timezone.make_aware(timezone.datetime.min)
        )

        total_paid = RepairInvoice.objects.filter(
            mechanic_task__mechanic=mechanic,
            status='paid',
            created_at__gte=period_start,
        ).aggregate(Sum('total_cost'))['total_cost__sum'] or 0

        pending_total = RepairInvoice.objects.filter(
            mechanic_task__mechanic=mechanic,
            status='pending',
        ).aggregate(Sum('total_cost'))['total_cost__sum'] or 0

        paginator = Paginator(invoices, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context = {
            'mechanic': mechanic,
            'page_obj': page_obj,
            'total_paid': total_paid,
            'pending_total': pending_total,
            'selected_period': period,
            'greeting': greeting,
        }
        return render(request, 'mechanics/invoices.html', context)
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def export_invoices_pdf(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        invoices = RepairInvoice.objects.filter(mechanic_task__mechanic=mechanic)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)
        p.setFont("Helvetica", 12)
        p.drawString(100, 800, f"Repair Invoices for Mechanic: {mechanic.full_name}")
        y = 750
        for invoice in invoices:
            p.drawString(50, y, f"Invoice: {invoice.task_unique_id} | Vehicle: {invoice.vehicle_number} | Amount: Ksh {invoice.total_cost} | Status: {invoice.status.title()}")
            y -= 20
            if y < 50:
                p.showPage()
                y = 800
        p.showPage()
        p.save()

        buffer.seek(0)
        messages.success(request, "PDF export created successfully!")
        return FileResponse(buffer, as_attachment=True, filename='invoices.pdf')
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def export_invoices_excel(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        invoices = RepairInvoice.objects.filter(mechanic_task__mechanic=mechanic)

        workbook = openpyxl.Workbook()
        sheet = workbook.active
        sheet.title = 'Invoices'
        sheet.append(['Invoice ID', 'Vehicle', 'Issues', 'Total Cost', 'Date of Service', 'Status', 'Created At'])

        for invoice in invoices:
            sheet.append([
                invoice.task_unique_id,
                invoice.vehicle_number,
                invoice.issues,
                float(invoice.total_cost),
                invoice.date_of_service.strftime("%Y-%m-%d"),
                invoice.status.title(),
                invoice.created_at.strftime("%Y-%m-%d %H:%M"),
            ])

        response = HttpResponse(
            content=openpyxl.writer.excel.save_virtual_workbook(workbook),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=invoices.xlsx'
        messages.success(request, "Excel export created successfully!")
        return response
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def download_invoice(request, invoice_id):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        invoice = RepairInvoice.objects.get(id=invoice_id, mechanic_task__mechanic=mechanic)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)
        p.setFont("Helvetica", 12)
        p.drawString(100, 800, f"Invoice {invoice.task_unique_id} for Vehicle {invoice.vehicle_number}")
        y = 750
        p.drawString(50, y, f"Issues: {invoice.issues}")
        y -= 20
        p.drawString(50, y, f"Total Cost: Ksh {invoice.total_cost}")
        y -= 20
        p.drawString(50, y, f"Status: {invoice.status.title()}")
        p.showPage()
        p.save()

        buffer.seek(0)
        messages.success(request, f"Downloaded invoice {invoice.task_unique_id}.")
        return FileResponse(buffer, as_attachment=True, filename=f'invoice_{invoice.task_unique_id}.pdf')
    except (MechanicProfile.DoesNotExist, RepairInvoice.DoesNotExist):
        logger.warning(f"No MechanicProfile or RepairInvoice for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def notifications(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        return render(request, 'mechanics/notifications.html', {
            'mechanic': mechanic,
            'greeting': greeting,
        })
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def tasks(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        tasks = MechanicTask.objects.filter(mechanic=mechanic).select_related('maintenance_request__vehicle').order_by('-assigned_at')
        status = request.GET.get('status', 'all')
        priority = request.GET.get('priority', 'all')

        if status != 'all':
            tasks = tasks.filter(status=status)
        if priority != 'all':
            tasks = tasks.filter(priority=priority)

        return render(request, 'mechanics/tasks.html', {
            'mechanic': mechanic,
            'tasks': tasks,
            'selected_status': status,
            'selected_priority': priority,
            'greeting': greeting,
        })
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def task_detail(request, pk):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        task = MechanicTask.objects.get(pk=pk, mechanic=mechanic)
        issues = task.maintenance_request.issues.all()
        return render(request, 'mechanics/task_detail.html', {
            'mechanic': mechanic,
            'task': task,
            'issues': issues,
            'greeting': greeting,
        })
    except (MechanicProfile.DoesNotExist, MechanicTask.DoesNotExist):
        logger.warning(f"No MechanicProfile or MechanicTask for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def accept_task(request, pk):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        task = MechanicTask.objects.get(pk=pk, mechanic=mechanic)
        
        if task.status != 'pending':
            messages.error(request, "Only pending tasks can be accepted.")
            return redirect('mechanics:task_detail', pk=pk)
        
        task.status = 'in_progress'
        task.notes = f"Accepted by {mechanic.full_name or mechanic.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}"
        task.save()
        
        task.maintenance_request.status = 'in_progress'
        task.maintenance_request.last_update = f"Task accepted by {mechanic.full_name or mechanic.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}"
        task.maintenance_request.save()
        
        messages.success(request, f"Task {task.unique_task_id} accepted successfully.")
        return redirect('mechanics:tasks')
    except (MechanicProfile.DoesNotExist, MechanicTask.DoesNotExist):
        logger.warning(f"No MechanicProfile or MechanicTask for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def reject_task(request, pk):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        task = MechanicTask.objects.get(pk=pk, mechanic=mechanic)
        
        if task.status != 'pending':
            messages.error(request, "Only pending tasks can be rejected.")
            return redirect('mechanics:task_detail', pk=pk)
        
        if request.method == 'POST':
            reason = request.POST.get('rejection_reason', '').strip()
            if not reason:
                messages.error(request, "A rejection reason is required.")
            return redirect('mechanics:task_detail', pk=pk)
            
            task.status = 'rejected'
            task.rejection_reason = reason
            task.notes = f"Rejected by {mechanic.full_name or mechanic.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}: {reason}"
            task.save()
            
            task.maintenance_request.status = 'approved'
            task.maintenance_request.mechanic = None
            task.maintenance_request.last_update = f"Task rejected by {mechanic.full_name or mechanic.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}: {reason}"
            task.maintenance_request.save()
            
            messages.success(request, f"Task {task.unique_task_id} rejected successfully.")
            return redirect('mechanics:tasks')
        
        return render(request, 'mechanics/task_detail.html', {
            'mechanic': mechanic,
            'task': task,
            'issues': task.maintenance_request.issues.all(),
            'greeting': greeting,
        })
    except (MechanicProfile.DoesNotExist, MechanicTask.DoesNotExist):
        logger.warning(f"No MechanicProfile or MechanicTask for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def update_task_progress(request, pk):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        task = MechanicTask.objects.get(pk=pk, mechanic=mechanic)

        if task.status != 'in_progress':
            return JsonResponse({'success': False, 'error': 'Task must be in progress to update.'}, status=400)

        if request.method == 'POST':
            try:
                data = json.loads(request.body)
                new_progress = int(data.get('progress', 0))
                if not 0 <= new_progress <= 100:
                    return JsonResponse({'success': False, 'error': 'Progress must be between 0 and 100.'}, status=400)
            except (ValueError, TypeError, json.JSONDecodeError):
                return JsonResponse({'success': False, 'error': 'Invalid data'}, status=400)

            task.progress = new_progress
            task.status = 'completed' if new_progress == 100 else 'in_progress'
            task.save()

            if task.status == 'completed':
                maintenance_request = task.maintenance_request
                maintenance_request.status = 'completed'
                maintenance_request.last_update = f"Completed by {mechanic.full_name or mechanic.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}"
                maintenance_request.save()

            return JsonResponse({'success': True})
    except (MechanicProfile.DoesNotExist, MechanicTask.DoesNotExist):
        logger.warning(f"No MechanicProfile or MechanicTask for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def complete_task(request, pk):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        task = MechanicTask.objects.get(pk=pk, mechanic=mechanic)

        if task.status != 'in_progress':
            return JsonResponse({'success': False, 'error': 'Task must be in progress to complete.'}, status=400)

        if request.method == 'POST':
            task.progress = 100
            task.status = 'completed'
            task.save()

            maintenance_request = task.maintenance_request
            maintenance_request.status = 'completed'
            maintenance_request.last_update = f"Completed by {mechanic.full_name or mechanic.user.username} on {timezone.now().strftime('%Y-%m-%d %H:%M')}"
            maintenance_request.save()

            return JsonResponse({'success': True})
    except (MechanicProfile.DoesNotExist, MechanicTask.DoesNotExist):
        logger.warning(f"No MechanicProfile or MechanicTask for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def submit_invoice(request, task_id):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        task = MechanicTask.objects.get(pk=task_id, mechanic=mechanic)

        if task.status != 'completed':
            messages.error(request, "Task must be completed before submitting an invoice.")
            return redirect('mechanics:tasks')

        if hasattr(task, 'invoice') and task.invoice.status != 'rejected':
            messages.error(request, "An invoice for this task already exists and is not rejected.")
            return redirect('mechanics:tasks')

        if request.method == 'POST':
            form = RepairInvoiceForm(request.POST, request.FILES)
            if form.is_valid():
                invoice = form.save(commit=False)
                invoice.mechanic_task = task
                invoice.task_unique_id = task.unique_task_id
                invoice.save()

                for file in request.FILES.getlist('photos'):
                    if file.size > 5 * 1024 * 1024:
                        invoice.delete()
                        messages.error(request, f"File {file.name} exceeds 5MB limit.")
                        return redirect('mechanics:submit_invoice', task_id=task_id)
                    RepairInvoicePhoto.objects.create(invoice=invoice, image=file)

                messages.success(request, f"Invoice for task {task.unique_task_id} submitted successfully!")
                return redirect('mechanics:tasks')
            else:
                messages.error(request, "Please correct the errors in the form.")
        else:
            initial_data = {
                'vehicle_number': task.maintenance_request.vehicle.number_plate,
                'issues': ', '.join(f"{issue.title} (Ksh {issue.cost_estimate})" for issue in task.maintenance_request.issues.all()),
                'total_cost': sum(issue.cost_estimate for issue in task.maintenance_request.issues.all()),
                'task_unique_id': task.unique_task_id,
            }
            form = RepairInvoiceForm(initial=initial_data)

        return render(request, 'mechanics/submit_invoice.html', {
            'mechanic': mechanic,
            'task': task,
            'form': form,
            'greeting': greeting,
        })
    except (MechanicProfile.DoesNotExist, MechanicTask.DoesNotExist):
        logger.warning(f"No MechanicProfile or MechanicTask for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')

@login_required
def support(request):
    user = get_user(request)
    now = timezone.localtime(timezone.now())
    greeting = (
        "Good morning" if 5 <= now.hour < 12 else
        "Good afternoon" if 12 <= now.hour < 17 else
        "Good evening"
    )

    try:
        mechanic = MechanicProfile.objects.get(user=user)
        if request.method == 'POST':
            form = MechanicSupportForm(request.POST)
            if form.is_valid():
                support_request = form.save(commit=False)
                support_request.mechanic = mechanic
                support_request.save()

                for file in request.FILES.getlist('files'):
                    if file.size > 5 * 1024 * 1024:
                        support_request.delete()
                        messages.error(request, f"File {file.name} exceeds 5MB limit.")
                        return redirect('mechanics:support')
                    MechanicSupportAttachment.objects.create(request=support_request, file=file)

                messages.success(request, "Your support request has been submitted successfully.")
                return redirect('mechanics:support')
            else:
                messages.error(request, "Please correct the errors below.")
        else:
            form = MechanicSupportForm()

        return render(request, 'mechanics/support.html', {
            'form': form,
            'mechanic': mechanic,
            'greeting': greeting,
        })
    except MechanicProfile.DoesNotExist:
        logger.warning(f"No MechanicProfile for user {user.username} (ID: {user.id}, is_staff: {user.is_staff}, is_superuser: {user.is_superuser})")
        if user.is_staff or user.is_superuser:
            messages.info(request, "Admin: You don't have a mechanic profile. Register for a role or access the admin panel.")
        else:
            messages.error(request, "If you are seeing this, it is likely your session expired or your profile broke. Just re-login for a quick fix of the issue.")
        return redirect('core:profile_management')