from django.db import models
from django.conf import settings
import uuid

class Departamento(models.Model):
    nombre = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Departamentos"

    def __str__(self):
        return self.nombre

class Estado(models.Model):
    nombre = models.CharField(max_length=100)
    tipo_ip = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Estados"

    def __str__(self):
        return self.nombre

class Ubicacion(models.Model):
    fase = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Ubicaciones"

    def __str__(self):
        return self.fase

class Delegacion(models.Model):
    nombre = models.CharField(max_length=200, unique=True)

    class Meta:
        verbose_name_plural = "Delegaciones"

    def __str__(self):
        return self.nombre

class Empleado(models.Model):
    ROLES = [
        ("it_manager", "IT Manager"),
        ("deputy_it_manager", "Deputy IT Manager"),
        ("tecnico", "Técnico"),
        ("av_manager", "AV Manager"),
        ("otro", "Otro"),
    ]

    TIPO_ROL = [
        ("premium", "Premium"),
        ("estandar", "Estándar"),
    ]

    # Vínculo 1-1 con el usuario autenticado (opcional)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="empleado",
        null=True,
        blank=True,
    )

    nombre = models.CharField(max_length=200)
    departamento = models.ForeignKey('Departamento', on_delete=models.SET_NULL, null=True, blank=True)
    email = models.EmailField(max_length=254, null=True, blank=True)

    # Cambiamos delegacion a FK para datos consistentes
    delegacion = models.ForeignKey('Delegacion', on_delete=models.SET_NULL, null=True, blank=True)

    rol = models.CharField(max_length=100, choices=ROLES, blank=True, null=True)
    tipo_rol = models.CharField(max_length=100, choices=TIPO_ROL, blank=True, null=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name_plural = "Empleados"

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

    class Meta:
        ordering = ["id_inventario"]
        verbose_name = "Equipo"
        verbose_name_plural = "Equipos"

    def __str__(self):
        principal = self.nombre or self.elemento or "Equipo"
        return f"{self.id_inventario} · {principal}"

class PDA(models.Model):
    nombre = models.CharField(max_length=200)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    mac = models.CharField(max_length=50)
    serial = models.CharField(max_length=200)
    ip = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        verbose_name = "PDA"
        verbose_name_plural = "PDAs"

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

    class Meta:
        verbose_name = "SIM"
        verbose_name_plural = "SIMs"

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

    class Meta:
        verbose_name = "Oracle POS"
        verbose_name_plural = "Oracle POS"

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

    class Meta:
        ordering = ["-fecha_creacion"]
        verbose_name_plural = "Incidencias"

    def __str__(self):
        return self.titulo
    
class Movimiento(models.Model):
    equipo = models.ForeignKey('EquipoGeneral', on_delete=models.CASCADE, related_name='movimientos')
    fecha = models.DateTimeField(auto_now_add=True)
    motivo = models.CharField(max_length=255, blank=True)
    departamento = models.ForeignKey('Departamento', on_delete=models.SET_NULL, null=True, blank=True)
    ubicacion = models.ForeignKey('Ubicacion', on_delete=models.SET_NULL, null=True, blank=True)
    estado = models.ForeignKey('Estado', on_delete=models.SET_NULL, null=True, blank=True)
    realizado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ["-fecha"]
        verbose_name_plural = "Movimientos"

    def __str__(self):
        return f"Movimiento de {self.equipo.id_inventario} - {self.fecha.strftime('%Y-%m-%d %H:%M')}"
    
class Switch(models.Model):
    MARCAS = [
        ('Aruba', 'Aruba'),
        ('Ubiquity', 'Ubiquity'),
        ('Ruckus', 'Ruckus'),
    ]

    PLANTAS = [
        ('1', 'Planta 1'),
        ('2', 'Planta 2'),
        ('3', 'Planta 3'),
        ('4', 'Planta 4'),
        ('5', 'Planta 5'),
        ('6', 'Planta 6'),
    ]

    PLOTS = [
        ('Plot1', 'Plot 1'),
        ('Plot2', 'Plot 2'),
    ]

    nombre = models.CharField(max_length=100)
    ip = models.GenericIPAddressField()
    mac = models.CharField(max_length=50, blank=True, null=True)
    marca = models.CharField(max_length=20, choices=MARCAS)
    planta = models.CharField(max_length=1, choices=PLANTAS)
    lugar = models.CharField(max_length=10, choices=PLOTS)

    class Meta:
        ordering = ["planta", "nombre"]
        verbose_name_plural = "Switches"

    def __str__(self):
        return f"{self.nombre} ({self.ip}) - {self.marca} - Planta {self.planta} {self.lugar}"

class Parte(models.Model):
    ESTADOS = [
        ('borrador', 'Borrador'),
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En proceso'),
        ('resuelto', 'Resuelto'),
        ('cancelado', 'Cancelado'),
    ]

    PRIORIDADES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ]

    # Identificación
    numero_parte = models.CharField(max_length=50, unique=True, blank=True)
    titulo = models.CharField(max_length=255, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='borrador')
    prioridad = models.CharField(max_length=10, choices=PRIORIDADES, default='media')
    tipo_entrega = models.CharField(max_length=100, blank=True, null=True)

    # Emisor
    emisor_nombre = models.CharField(max_length=200, blank=True, null=True)
    emisor_rol = models.CharField(max_length=100, blank=True, null=True)
    solicitante = models.CharField(max_length=200, blank=True, null=True)  # compat

    # Receptor
    receptor_nombre = models.CharField(max_length=200, blank=True, null=True)
    receptor_rol = models.CharField(max_length=100, blank=True, null=True)
    receptor_departamento = models.CharField(max_length=100, blank=True, null=True)
    receptor_ubicacion = models.CharField(max_length=200, blank=True, null=True)

    # Contenido
    equipos_json = models.TextField(blank=True, null=True)  # JSON list of equipment
    descripcion = models.TextField(blank=True, null=True)
    observaciones_generales = models.TextField(blank=True, null=True)

    # Fechas
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(blank=True, null=True)

    # FK opcionales
    equipo = models.ForeignKey('EquipoGeneral', on_delete=models.SET_NULL, null=True, blank=True, related_name='partes')
    asignado_a = models.ForeignKey('Empleado', on_delete=models.SET_NULL, null=True, blank=True, related_name='partes')

    class Meta:
        ordering = ['-fecha_apertura']
        verbose_name = 'Parte'
        verbose_name_plural = 'Partes'

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        if is_new and not self.numero_parte:
            # Asignar un valor temporal único para evitar IntegrityError en save()
            self.numero_parte = f"TEMP-{str(uuid.uuid4())[:8]}"
            
        super().save(*args, **kwargs)
        
        if is_new and self.numero_parte.startswith("TEMP-"):
            self.numero_parte = f"OKU-IT-{self.id}"
            self.save(update_fields=['numero_parte'])

    def __str__(self):
        return f"{self.numero_parte or self.id} – {self.titulo or 'Sin título'}"