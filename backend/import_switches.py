import csv
import os
import django

# Configura Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oku_it.settings')
django.setup()

from inventario.models import Switch

csv_file = os.path.join(os.path.dirname(__file__), 'import_switches.csv')

with open(csv_file, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Crea o actualiza el switch según IP para evitar duplicados
        Switch.objects.update_or_create(
            ip=row['ip'],
            defaults={
                'nombre': row['nombre'],
                'mac': row['mac'] if row['mac'] else None,
                'marca': row['marca'],
                'planta': row['planta'],
                'lugar': row['lugar'],
            }
        )

print("✔️ Importación completada.")