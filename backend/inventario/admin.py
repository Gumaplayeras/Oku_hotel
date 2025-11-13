from django.contrib import admin
from .models import Departamento, Estado, Ubicacion, Empleado, EquipoGeneral, PDA, SIM, OraclePOS, Incidencia, Movimiento, Switch, Delegacion

@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display = ("nombre",)
    search_fields = ("nombre",)

@admin.register(Delegacion)
class DelegacionAdmin(admin.ModelAdmin):
    list_display = ("nombre",)
    search_fields = ("nombre",)

@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "email", "departamento", "delegacion", "rol", "tipo_rol", "user")
    list_filter = ("departamento", "delegacion", "rol", "tipo_rol")
    search_fields = ("nombre", "email", "user__username")
    autocomplete_fields = ("departamento", "delegacion", "user")
    list_select_related = ("departamento", "delegacion", "user")
    ordering = ("nombre",)
    empty_value_display = "—"

admin.site.register(Incidencia)
admin.site.register(Estado)
admin.site.register(Movimiento)
admin.site.register(Ubicacion)
admin.site.register(EquipoGeneral)
admin.site.register(PDA)
admin.site.register(SIM)
admin.site.register(OraclePOS)
admin.site.register(Switch)