from django.db import models
from django.contrib.auth.models import User

class Departamento(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Estado(models.Model):
    nombre = models.CharField(max_length=100)
    tipo_ip = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.nombre

class Ubicacion(models.Model):
    fase = models.CharField(max_length=100)

    def __str__(self):
        return self.fase

class Empleado(models.Model):
    nombre = models.CharField(max_length=200)

    def __str__(self):
        return self.nombre

class EquipoGeneral(models.Model):
    id_inventario = models.CharField(max_length=50, primary_key=True)
    nombre = models.CharField(max_length=200, blank=True, null=True)
    elemento = models.CharField(max_length=100)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    serial = models.CharField(max_length=200)
    empleado = models.ForeignKey(Empleado, on_delete=models.SET_NULL, null=True, blank=True)
    departamento = models.ForeignKey(Departamento, on_delete=models.SET_NULL, null=True, blank=True)
    estado = models.ForeignKey(Estado, on_delete=models.SET_NULL, null=True, blank=True)
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} - {self.elemento}"

class PDA(models.Model):
    nombre = models.CharField(max_length=200)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    mac = models.CharField(max_length=50)
    serial = models.CharField(max_length=200)
    ip = models.GenericIPAddressField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class SIM(models.Model):
    nombre = models.CharField(max_length=200)
    numero = models.CharField(max_length=50)
    icc = models.CharField(max_length=100)
    puk = models.CharField(max_length=50, blank=True, null=True)
    tarifa = models.CharField(max_length=100)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    serial = models.CharField(max_length=200)

    def __str__(self):
        return self.numero

class OraclePOS(models.Model):
    nombre = models.CharField(max_length=200)
    funcion = models.CharField(max_length=200)
    modelo = models.CharField(max_length=100)
    serial = models.CharField(max_length=200)
    mac = models.CharField(max_length=50)
    ip = models.GenericIPAddressField(blank=True, null=True)
    ticketera = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.nombre

class Incidencia(models.Model):
    ESTADOS = (
        ('abierta', 'Abierta'),
        ('en_progreso', 'En progreso'),
        ('cerrada', 'Cerrada'),
    )

    titulo = models.CharField(max_length=255)
    descripcion = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='abierta')
    asignado_a = models.ForeignKey('Empleado', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.titulo
    
class Movimiento(models.Model):
    equipo = models.ForeignKey('EquipoGeneral', on_delete=models.CASCADE, related_name='movimientos')
    fecha = models.DateTimeField(auto_now_add=True)
    motivo = models.CharField(max_length=255, blank=True)
    departamento = models.ForeignKey('Departamento', on_delete=models.SET_NULL, null=True, blank=True)
    ubicacion = models.ForeignKey('Ubicacion', on_delete=models.SET_NULL, null=True, blank=True)
    estado = models.ForeignKey('Estado', on_delete=models.SET_NULL, null=True, blank=True)
    realizado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Movimiento de {self.equipo.id_inventario} - {self.fecha.strftime('%Y-%m-%d %H:%M')}"