#!/bin/sh

echo "Esperando a que PostgreSQL arranque..."

# Espera hasta que la base de datos esté disponible
until python -c "
import psycopg2
import time
while True:
    try:
        conn = psycopg2.connect(
            dbname='${DB_NAME}',
            user='${DB_USER}',
            password='${DB_PASSWORD}',
            host='${DB_HOST}',
            port=${DB_PORT}
        )
        conn.close()
        break
    except:
        time.sleep(1)
" ; do
  echo "Esperando..."
  sleep 1
done

echo "PostgreSQL ya está disponible"

python manage.py migrate
python manage.py runserver 0.0.0.0:8000