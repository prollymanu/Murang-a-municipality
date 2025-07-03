from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils import timezone

@login_required
def dashboard(request):
    user = request.user
    now = timezone.localtime(timezone.now())
    hour = now.hour

    if 5 <= hour < 12:
        greeting = "Good morning"
    elif 12 <= hour < 17:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"

    context = {
        "greeting": greeting,
        "name": user.get_full_name() or user.username
    }
    return render(request, "managers/dashboard.html", context)