#!/bin/bash

echo "🌿 Starting PlantAI..."

# 1. Arrancar PostgreSQL si no está corriendo
if ! pg_isready -q 2>/dev/null; then
  echo "📦 Starting PostgreSQL..."
  sudo service postgresql start
  sleep 2
fi

# 2. Verificar que la DB existe, si no crearla
DB_EXISTS=$(sudo su -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='plantai_db'\"" postgres 2>/dev/null)
if [ "$DB_EXISTS" != "1" ]; then
  echo "🗄️  Creating database..."
  sudo su -c "psql -c \"CREATE DATABASE plantai_db;\"" postgres
fi

# 3. Crear tablas si no existen (esto lo hace Flask con db.create_all() al arrancar)
echo "🔧 Ready to start backend..."

# 4. Arrancar Flask
echo "🚀 Starting Flask backend on port 5000..."
cd /workspaces/PlantAI/backend
flask run