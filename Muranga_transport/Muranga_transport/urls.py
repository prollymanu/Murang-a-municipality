from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('drivers/', include('drivers.urls')),
    path('mechanics/', include('mechanics.urls')),
    path('managers/', include('managers.urls')),
    path('officers/', include('officers.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)