from rest_framework import viewsets, status
from .models import (
    Departamento, Estado, Ubicacion, Empleado, EquipoGeneral,
    PDA, SIM, OraclePOS, Incidencia, Movimiento, Switch
)
from .serializers import (
    DepartamentoSerializer, EstadoSerializer, UbicacionSerializer, EmpleadoSerializer,
    EquipoGeneralSerializer, PDASerializer, SIMSerializer, OraclePOSSerializer,
    IncidenciaSerializer, MovimientoSerializer, SwitchSerializer
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
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