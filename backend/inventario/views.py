from rest_framework import viewsets
from .models import Departamento, Estado, Ubicacion, Empleado, EquipoGeneral, PDA, SIM, OraclePOS, Incidencia, Movimiento
from .serializers import DepartamentoSerializer, EstadoSerializer, UbicacionSerializer, EmpleadoSerializer, EquipoGeneralSerializer, PDASerializer, SIMSerializer, OraclePOSSerializer, IncidenciaSerializer, MovimientoSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all().order_by('-fecha')  # ✅ Esto arregla el error
    serializer_class = MovimientoSerializer

    def get_queryset(self):
        queryset = Movimiento.objects.all().order_by('-fecha')
        equipo_id = self.request.query_params.get('equipo')
        if equipo_id:
            queryset = queryset.filter(equipo__id_inventario=equipo_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(realizado_por=self.request.user)
