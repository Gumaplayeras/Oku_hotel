import csv
import os
from django.core.management.base import BaseCommand
from inventario.models import Departamento, Estado, Ubicacion, Empleado, EquipoGeneral, PDA, SIM, OraclePOS
from django.db import transaction

class Command(BaseCommand):
    help = 'Importa datos desde CSV'

    def handle(self, *args, **kwargs):
        base_path = '/app/csv_data'  # Ahora crearemos esta carpeta para meter los CSV

        self.stdout.write("Importando Departamentos...")
        with open(os.path.join(base_path, 'Departamentos.csv')) as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                Departamento.objects.get_or_create(nombre=row[1].strip())

        self.stdout.write("Importando Estados...")
        with open(os.path.join(base_path, 'Estados.csv')) as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                Estado.objects.get_or_create(nombre=row[1].strip(), tipo_ip=row[3].strip() if len(row) > 3 else None)

        self.stdout.write("Importando Ubicaciones...")
        with open(os.path.join(base_path, 'Ubicaciones.csv')) as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                Ubicacion.objects.get_or_create(fase=row[1].strip())

        self.stdout.write("Importando Empleados...")
        with open(os.path.join(base_path, 'Empleados.csv')) as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                Empleado.objects.get_or_create(nombre=row[1].strip())

        # A partir de aquí podemos hacer PDA, SIM, Oracle y Equipos en siguientes bloques
        self.stdout.write("Importación básica finalizada.")