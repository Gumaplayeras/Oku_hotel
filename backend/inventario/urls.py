from django.urls import path, include
from rest_framework import routers
from . import views

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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

urlpatterns = [
    path('', include(router.urls)),

    # Aquí añadimos los endpoints de autenticación JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]