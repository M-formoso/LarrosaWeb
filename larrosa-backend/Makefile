.PHONY: help build up down restart logs shell db-shell test clean seed init

# Variables
COMPOSE_FILE=docker-compose.yml
BACKEND_SERVICE=backend
DB_SERVICE=postgres

# Ayuda
help:
	@echo "🚛 Larrosa Camiones - Comandos disponibles:"
	@echo ""
	@echo "📦 Docker:"
	@echo "  make init       - Inicializar proyecto completo"
	@echo "  make build      - Construir imágenes Docker"
	@echo "  make up         - Levantar todos los servicios"
	@echo "  make down       - Detener todos los servicios"
	@echo "  make restart    - Reiniciar servicios"
	@echo "  make clean      - Limpiar contenedores y volúmenes"
	@echo ""
	@echo "🔍 Desarrollo:"
	@echo "  make logs       - Ver logs del backend"
	@echo "  make shell      - Acceder al shell del backend"
	@echo "  make db-shell   - Acceder al shell de PostgreSQL"
	@echo ""
	@echo "🗄️ Base de datos:"
	@echo "  make seed       - Poblar base de datos con datos de prueba"
	@echo "  make migrate    - Ejecutar migraciones"
	@echo "  make revision   - Crear nueva migración"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test       - Ejecutar tests"
	@echo "  make test-cov   - Ejecutar tests con cobertura"

# Inicialización completa
init:
	@echo "🚛 Inicializando Larrosa Camiones..."
	@chmod +x init.sh
	@./init.sh

# Docker commands
build:
	@echo "🔨 Construyendo imágenes..."
	docker-compose -f $(COMPOSE_FILE) build

up:
	@echo "🚀 Iniciando servicios..."
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "✅ Servicios iniciados:"
	@echo "   🌐 API: http://localhost:8000"
	@echo "   📚 Docs: http://localhost:8000/api/docs"

down:
	@echo "⏹️ Deteniendo servicios..."
	docker-compose -f $(COMPOSE_FILE) down

restart:
	@echo "🔄 Reiniciando servicios..."
	docker-compose -f $(COMPOSE_FILE) restart

clean:
	@echo "🧹 Limpiando contenedores y volúmenes..."
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f

# Development commands
logs:
	@echo "📋 Mostrando logs del backend..."
	docker-compose -f $(COMPOSE_FILE) logs -f $(BACKEND_SERVICE)

shell:
	@echo "🐚 Accediendo al shell del backend..."
	docker-compose -f $(COMPOSE_FILE) exec $(BACKEND_SERVICE) bash

db-shell:
	@echo "🗄️ Accediendo a PostgreSQL..."
	docker-compose -f $(COMPOSE_FILE) exec $(DB_SERVICE) psql -U larrosa_user -d larrosa_camiones

# Database commands
seed:
	@echo "🌱 Poblando base de datos..."
	docker-compose -f $(COMPOSE_FILE) exec $(BACKEND_SERVICE) python seed_data.py

migrate:
	@echo "⬆️ Ejecutando migraciones..."
	docker-compose -f $(COMPOSE_FILE) exec $(BACKEND_SERVICE) alembic upgrade head

revision:
	@echo "📝 Creando nueva migración..."
	@read -p "Nombre de la migración: " name; \
	docker-compose -f $(COMPOSE_FILE) exec $(BACKEND_SERVICE) alembic revision --autogenerate -m "$$name"

# Testing commands
test:
	@echo "🧪 Ejecutando tests..."
	docker-compose -f $(COMPOSE_FILE) exec $(BACKEND_SERVICE) python -m pytest

test-cov:
	@echo "🧪 Ejecutando tests con cobertura..."
	docker-compose -f $(COMPOSE_FILE) exec $(BACKEND_SERVICE) python -m pytest --cov=app --cov-report=html

test-auth:
	@echo "🔐 Probando sistema de autenticación..."
	python test_auth.py

# Status check
status:
	@echo "📊 Estado de los servicios:"
	docker-compose -f $(COMPOSE_FILE) ps

# Database backup
backup:
	@echo "💾 Creando backup de la base de datos..."
	@mkdir -p backups
	docker-compose -f $(COMPOSE_FILE) exec $(DB_SERVICE) pg_dump -U larrosa_user larrosa_camiones > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup creado en backups/"

# Database restore
restore:
	@echo "♻️ Restaurando base de datos..."
	@read -p "Archivo de backup: " file; \
	if [ -f "$$file" ]; then \
		docker-compose -f $(COMPOSE_FILE) exec -T $(DB_SERVICE) psql -U larrosa_user -d larrosa_camiones < "$$file"; \
		echo "✅ Base de datos restaurada"; \
	else \
		echo "❌ Archivo no encontrado"; \
	fi

# Development setup without Docker
dev-install:
	@echo "🔧 Instalando dependencias para desarrollo local..."
	pip install -r requirements.txt
	@echo "✅ Dependencias instaladas"

dev-run:
	@echo "🚀 Iniciando servidor de desarrollo..."
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API testing
test-api:
	@echo "🌐 Probando endpoints de la API..."
	curl -s http://localhost:8000/health | jq .
	@echo ""
	curl -s http://localhost:8000/api/v1/vehicles/stats | jq .