from django.urls import path, include
from rest_framework import routers
from rest_framework.routers import DefaultRouter
from . import views
from inventario.views import movimientos_por_equipo
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import movimientos_por_equipo
from inventario.views import SwitchViewSet

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
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('movimientos/equipo/<int:equipo_id>/', movimientos_por_equipo, name='movimientos-por-equipo'),
]