"""
URL configuration for oku_it project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from inventario import views
from inventario.views import SwitchViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


router = routers.DefaultRouter()
router.register(r'departamentos', views.DepartamentoViewSet)
router.register(r'estados', views.EstadoViewSet)
router.register(r'ubicaciones', views.UbicacionViewSet)
router.register(r'empleados', views.EmpleadoViewSet)
router.register(r'equipos', views.EquipoGeneralViewSet)
router.register(r'pda', views.PDAViewSet)
router.register(r'sims', views.SIMViewSet)
router.register(r'oracle', views.OraclePOSViewSet)
router.register(r'incidencias', views.IncidenciaViewSet)
router.register(r'movimientos', views.MovimientoViewSet)
router.register(r'switches', views.SwitchViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]