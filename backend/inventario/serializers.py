from rest_framework import serializers
from .models import Departamento, Estado, Ubicacion, Empleado, EquipoGeneral, PDA, SIM, OraclePOS, Incidencia, Movimiento

class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = '__all__'

class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = '__all__'

class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = '__all__'

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'

class EquipoGeneralSerializer(serializers.ModelSerializer):
    empleado = EmpleadoSerializer(read_only=True)
    departamento = DepartamentoSerializer(read_only=True)
    estado = EstadoSerializer(read_only=True)
    ubicacion = UbicacionSerializer(read_only=True)

    class Meta:
        model = EquipoGeneral
        fields = '__all__'

class PDASerializer(serializers.ModelSerializer):
    class Meta:
        model = PDA
        fields = '__all__'

class SIMSerializer(serializers.ModelSerializer):
    class Meta:
        model = SIM
        fields = '__all__'

class OraclePOSSerializer(serializers.ModelSerializer):
    class Meta:
        model = OraclePOS
        fields = '__all__'

class IncidenciaSerializer(serializers.ModelSerializer):
    asignado_a = serializers.StringRelatedField()

    class Meta:
        model = Incidencia
        fields = '__all__'

class MovimientoSerializer(serializers.ModelSerializer):
    motivo = serializers.CharField(allow_blank=True, required=False)
    realizado_por = serializers.StringRelatedField(read_only=True)
    equipo = serializers.PrimaryKeyRelatedField(queryset=EquipoGeneral.objects.all())
    departamento = serializers.PrimaryKeyRelatedField(queryset=Departamento.objects.all(), allow_null=True)
    ubicacion = serializers.PrimaryKeyRelatedField(queryset=Ubicacion.objects.all(), allow_null=True)
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all(), allow_null=True)

    class Meta:
        model = Movimiento
        fields = '__all__'