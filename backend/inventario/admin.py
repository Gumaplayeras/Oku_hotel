from django.contrib import admin
from .models import Departamento, Estado, Ubicacion, Empleado, EquipoGeneral, PDA, SIM, OraclePOS, Incidencia, Movimiento, Switch

admin.site.register(Departamento)
admin.site.register(Incidencia)
admin.site.register(Estado)
admin.site.register(Movimiento)
admin.site.register(Ubicacion)
admin.site.register(Empleado)
admin.site.register(EquipoGeneral)
admin.site.register(PDA)
admin.site.register(SIM)
admin.site.register(OraclePOS)
admin.site.register(Switch)