from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from datetime import timedelta

from django.http import JsonResponse
import json
from django.contrib.auth.decorators import login_required

from django.contrib import messages
from django.urls import reverse

from .models import MechanicProfile, MechanicTask, RepairInvoice, RepairInvoicePhoto
from drivers.models import MaintenanceRequest
from .forms import MechanicProfileForm, RepairInvoiceForm

import io
from django.http import FileResponse
from reportlab.pdfgen import canvas
from django.shortcuts import redirect
import openpyxl
from django.http import HttpResponse

from django.core.paginator import Paginator
from django.db.models import Sum
from django.contrib.auth.decorators import user_passes_test

from .forms import MechanicSupportForm
from .models import MechanicSupportAttachment


@login_required
def mechanic_dashboard(request):
    user = request.user
    now = timezone.localtime(timezone.now())
    hour = now.hour

    greeting = (
        "Good morning" if 5 <= hour < 12 else
        "Good afternoon" if 12 <= hour < 17 else
        "Good evening"
    )

    # Ensure mechanic profile exists
    if hasattr(user, 'mechanicprofile'):
        mechanic = user.mechanicprofile
    else:
        messages.error(
            request,
            "Mechanic profile missing. Your account might not be fully approved yet. "
            "Please contact your administrator."
        )
        return redirect(reverse('core:login'))

    tasks_completed = MechanicTask.objects.filter(
        mechanic=mechanic, status='completed'
    ).count()

    assigned_tasks = MechanicTask.objects.filter(
        mechanic=mechanic
    ).exclude(status='completed').order_by('-assigned_at')

    context = {
        "greeting": greeting,
        "mechanic": mechanic,
        "name": user.get_full_name() or user.username,
        "tasks_completed": tasks_completed,
        "assigned_tasks": assigned_tasks,
    }
    return render(request, 'mechanics/dashboard.html', context)


@login_required
def profile(request):
    mechanic = get_object_or_404(MechanicProfile, user=request.user)
    recent_tasks = MechanicTask.objects.filter(
        mechanic=mechanic
    ).order_by('-assigned_at')[:5]

    return render(request, 'mechanics/profile.html', {
        'mechanic': mechanic,
        'recent_tasks': recent_tasks,
    })


@login_required
def profile_edit(request):
    mechanic = get_object_or_404(MechanicProfile, user=request.user)

    if request.method == 'POST':
        form = MechanicProfileForm(request.POST, instance=mechanic, user=request.user)
        if form.is_valid():
            updated_mechanic = form.save(commit=False)

            # Handle specialization checkboxes explicitly
            specializations = request.POST.getlist('specialization')
            updated_mechanic.specialization = ','.join(specializations)

            updated_mechanic.save()

            # Update related user data
            request.user.phone_number = form.cleaned_data.get('phone_number')
            request.user.email = form.cleaned_data.get('email')
            request.user.save()

            messages.success(request, "Profile updated successfully!")
            return redirect('mechanics:profile')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = MechanicProfileForm(instance=mechanic, user=request.user, initial={
            'phone_number': request.user.phone_number,
            'email': request.user.email,
        })

    return render(request, 'mechanics/profile_edit.html', {'form': form, 'mechanic': mechanic})


@login_required
def invoices(request):
    mechanic = request.user.mechanicprofile
    invoices = RepairInvoice.objects.filter(
    mechanic_task__mechanic=mechanic
    ).order_by('-created_at')


    # Filters
    status = request.GET.get('status')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    if status in ['paid', 'pending']:
        invoices = invoices.filter(status=status)
    if start_date:
        invoices = invoices.filter(created_at__gte=start_date)
    if end_date:
        invoices = invoices.filter(created_at__lte=end_date)

    # Summary calculations
    period = request.GET.get('period', '30d')
    period_start = (
        timezone.now() - timedelta(days=30) if period == '30d' else
        timezone.now() - timedelta(days=180) if period == '6m' else
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


    # Pagination
    paginator = Paginator(invoices, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'mechanic': mechanic,
        'page_obj': page_obj,
        'total_paid': total_paid,
        'pending_total': pending_total,
        'selected_period': period,
    }
    return render(request, 'mechanics/invoices.html', context)

@login_required
def export_invoices_pdf(request):
    mechanic = request.user.mechanicprofile
    invoices = mechanic.repairinvoice_set.all()

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

@login_required
def export_invoices_excel(request):
    mechanic = request.user.mechanicprofile
    invoices = mechanic.repairinvoice_set.all()

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

@login_required
def download_invoice(request, invoice_id):
    mechanic = request.user.mechanicprofile
    invoice = get_object_or_404(RepairInvoice, id=invoice_id, mechanic_task__mechanic=mechanic)

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


@login_required
def notifications(request):
    return render(request, 'mechanics/notifications.html')





@login_required
def tasks(request):
    mechanic = get_object_or_404(MechanicProfile, user=request.user)
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
    })


@login_required
def task_detail(request, pk):
    mechanic = get_object_or_404(MechanicProfile, user=request.user)
    task = get_object_or_404(MechanicTask, pk=pk, mechanic=mechanic)
    return render(request, 'mechanics/task_detail.html', {
        'mechanic': mechanic,
        'task': task,
    })


@login_required
def update_task_progress(request, pk):
    mechanic = get_object_or_404(MechanicProfile, user=request.user)
    task = get_object_or_404(MechanicTask, pk=pk, mechanic=mechanic)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_progress = int(data.get('progress', 0))
        except (ValueError, TypeError, json.JSONDecodeError):
            return JsonResponse({'success': False, 'error': 'Invalid data'}, status=400)

        task.progress = new_progress
        task.status = 'in_progress' if new_progress < 100 else 'completed'
        task.save()

        if task.status == 'completed':
            maintenance_request = task.maintenance_request
            maintenance_request.status = 'completed'
            maintenance_request.save()

        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)


@login_required
def complete_task(request, pk):
    mechanic = get_object_or_404(MechanicProfile, user=request.user)
    task = get_object_or_404(MechanicTask, pk=pk, mechanic=mechanic)

    if request.method == 'POST':
        task.progress = 100
        task.status = 'completed'
        task.save()

        maintenance_request = task.maintenance_request
        maintenance_request.status = 'completed'
        maintenance_request.save()

        return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)


@login_required
def repair_invoice_generic(request):
    mechanic = request.user.mechanicprofile

    if request.method == 'POST':
        form = RepairInvoiceForm(request.POST, request.FILES)
        if form.is_valid():
            invoice = form.save(commit=False)
            invoice.save()

            for file in request.FILES.getlist('photos'):
                if file.size > 5 * 1024 * 1024:
                    invoice.delete()
                    messages.error(request, f"File {file.name} exceeds 5MB limit.")
                    return redirect('mechanics:repair_invoice_generic')
                RepairInvoicePhoto.objects.create(invoice=invoice, image=file)

            messages.success(request, "Repair invoice submitted successfully!")
            return redirect('mechanics:tasks')
        else:
            messages.error(request, "Please correct the errors in the form.")
    else:
        form = RepairInvoiceForm()

    return render(request, 'mechanics/repair_invoice.html', {'form': form, 'mechanic': mechanic})


@login_required
def repair_invoice(request, task_id):
    mechanic = request.user.mechanicprofile
    task = get_object_or_404(MechanicTask, pk=task_id, mechanic=mechanic)

    if request.method == 'POST':
        form = RepairInvoiceForm(request.POST, request.FILES)
        if form.is_valid():
            invoice = form.save(commit=False)
            invoice.mechanic_task = task
            invoice.save()

            for file in request.FILES.getlist('photos'):
                if file.size > 5 * 1024 * 1024:
                    invoice.delete()
                    messages.error(request, f"File {file.name} exceeds 5MB limit.")
                    return redirect('mechanics:repair_invoice', task_id=task_id)
                RepairInvoicePhoto.objects.create(invoice=invoice, image=file)

            messages.success(request, "Repair invoice for task submitted successfully!")
            return redirect('mechanics:tasks')
        else:
            messages.error(request, "Please correct the errors in the form.")
    else:
        form = RepairInvoiceForm()

    return render(request, 'mechanics/repair_invoice.html', {'form': form, 'mechanic': mechanic, 'task': task})

@login_required
def support(request):
    if request.method == 'POST':
        form = MechanicSupportForm(request.POST)
        if form.is_valid():
            support_request = form.save(commit=False)
            support_request.mechanic = request.user  # User model or MechanicProfile? adjust if needed
            support_request.save()

            # Handle multiple uploaded files
            files = request.FILES.getlist('files')  # name in your HTML form input
            for f in files:
                MechanicSupportAttachment.objects.create(
                    request=support_request,
                    file=f,
                )
            messages.success(request, "Your support request has been submitted successfully.")
            return redirect('mechanic_support')
        else:
            messages.error(request, "Please correct the errors below.")

    else:
        form = MechanicSupportForm()
    return render(request, 'mechanics/support.html', {'form': form})