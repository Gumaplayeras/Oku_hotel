from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import EquipoGeneral, Movimiento

@receiver(post_save, sender=EquipoGeneral)
def crear_movimiento(sender, instance, created, **kwargs):
    # Solo registrar cuando se actualice
    if not created:
        Movimiento.objects.create(
            equipo=instance,
            departamento=instance.departamento,
            ubicacion=instance.ubicacion,
            estado=instance.estado
        )