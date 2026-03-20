from rest_framework import viewsets, status
from .models import (
    Departamento, Estado, Ubicacion, Empleado, EquipoGeneral,
    PDA, SIM, OraclePOS, Incidencia, Movimiento, Switch, Parte
)
from .serializers import (
    DepartamentoSerializer, EstadoSerializer, UbicacionSerializer, EmpleadoSerializer,
    EquipoGeneralSerializer, PDASerializer, SIMSerializer, OraclePOSSerializer,
    IncidenciaSerializer, MovimientoSerializer, SwitchSerializer, UserWithEmpleadoSerializer,
    ParteSerializer
)
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action, api_view, permission_classes
from .network import reiniciar_switch 

class DepartamentoViewSet(viewsets.ModelViewSet):
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializer

class EstadoViewSet(viewsets.ModelViewSet):
    queryset = Estado.objects.all()
    serializer_class = EstadoSerializer

class UbicacionViewSet(viewsets.ModelViewSet):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer

class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class EquipoGeneralViewSet(viewsets.ModelViewSet):
    queryset = EquipoGeneral.objects.select_related('empleado').all()
    serializer_class = EquipoGeneralSerializer
    lookup_field = 'id_inventario'
    permission_classes = [IsAuthenticated]

class PDAViewSet(viewsets.ModelViewSet):
    queryset = PDA.objects.all()
    serializer_class = PDASerializer

class SIMViewSet(viewsets.ModelViewSet):
    queryset = SIM.objects.all()
    serializer_class = SIMSerializer

class OraclePOSViewSet(viewsets.ModelViewSet):
    queryset = OraclePOS.objects.all()
    serializer_class = OraclePOSSerializer

class IncidenciaViewSet(viewsets.ModelViewSet):
    queryset = Incidencia.objects.all()
    serializer_class = IncidenciaSerializer

class ParteViewSet(viewsets.ModelViewSet):
    queryset = Parte.objects.select_related('equipo', 'asignado_a').all()
    serializer_class = ParteSerializer
    permission_classes = [IsAuthenticated]

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all().order_by('-fecha')
    serializer_class = MovimientoSerializer

    def get_queryset(self):
        queryset = Movimiento.objects.all().order_by('-fecha')
        equipo_id = self.request.query_params.get('equipo')
        if equipo_id:
            queryset = queryset.filter(equipo__id_inventario=equipo_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(realizado_por=self.request.user)

class SwitchViewSet(viewsets.ModelViewSet):
    queryset = Switch.objects.all()
    serializer_class = SwitchSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='reiniciar')
    def reiniciar(self, request, pk=None):
        try:
            switch = self.get_object()
            resultado = reiniciar_switch(switch)
            if resultado["status"] == "ok":
                # Devuelve solo un mensaje bonito, sin output detallado
                return Response({"message": f"✅ Switch '{switch.nombre}' reiniciado correctamente"})
            else:
                return Response({"error": resultado["error"]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def equipment_alerts(request):
    """
    Devuelve un resumen de alertas de equipos:
    - Estados considerados problema: Warning, Offline
    """
    estados_problema = ['Warning', 'Offline']

    equipos = (
        EquipoGeneral.objects
        .select_related('estado', 'ubicacion')
        .filter(estado__nombre__in=estados_problema)
    )

    alerts = []
    for e in equipos:
        alerts.append({
            "id_inventario": getattr(e, "id_inventario", None),
            "nombre": getattr(e, "nombre", None),
            "estado": e.estado.nombre if getattr(e, "estado", None) else None,
            "plot": getattr(e, "plot", None),
            "planta": getattr(e.ubicacion, "planta", None) if getattr(e, "ubicacion", None) else None,
            "ubicacion": str(e.ubicacion) if getattr(e, "ubicacion", None) else None,
        })

    return Response({
        "has_alerts": bool(alerts),
        "total": len(alerts),
        "alerts": alerts,
    })

class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all().order_by("username")
    serializer_class = UserWithEmpleadoSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    })


# --- BEGIN me_profile endpoint ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_profile(request):
    u = request.user

    emp = None
    if u.email:
        emp = (
            Empleado.objects
            .select_related('departamento', 'delegacion')
            .filter(email__iexact=u.email)
            .first()
        )

    data = {
        "id": u.id,
        "username": u.username,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "email": u.email,
        "empleado": None,
    }

    if emp:
        data["empleado"] = {
            "id": emp.id,
            "nombre": getattr(emp, "nombre", None),
            "email": getattr(emp, "email", None),
            "departamento": emp.departamento.nombre if getattr(emp, "departamento", None) else None,
            "delegacion": emp.delegacion.nombre if getattr(emp, "delegacion", None) else None,
            "rol": getattr(emp, "rol", None),
            "tipo_rol": getattr(emp, "tipo_rol", None),
        }

    return Response(data, status=status.HTTP_200_OK)
# --- END me_profile endpoint ---