#!/bin/bash

echo "🚛 Inicializando Larrosa Camiones Backend..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "requirements.txt" ]; then
    log_error "Este script debe ejecutarse desde el directorio larrosa-backend"
    exit 1
fi

# Verificar si existe .env
if [ ! -f ".env" ]; then
    log_warning "Archivo .env no encontrado. Creando desde template..."
    cat > .env << EOL
# Base de datos
DATABASE_URL=postgresql://larrosa_user:larrosa_password@localhost:5432/larrosa_camiones

# Seguridad
SECRET_KEY=tu-clave-super-secreta-cambia-esto-en-produccion-debe-ser-muy-larga-y-aleatoria-123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_HOSTS=["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"]

# Archivos
UPLOAD_DIR=static/uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=["jpg", "jpeg", "png", "webp"]

# Entorno
ENVIRONMENT=development

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# AWS S3 (opcional - para producción)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1
EOL
    log_success "Archivo .env creado"
fi

# Crear directorios necesarios
log_info "Creando directorios necesarios..."
mkdir -p static/uploads/vehicles
mkdir -p static/uploads/vehicles/thumbnails
mkdir -p logs
log_success "Directorios creados"

# Verificar Docker
log_info "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado. Por favor instalar Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose no está instalado. Por favor instalar Docker Compose primero."
    exit 1
fi

log_success "Docker verificado"

# Dar permisos de ejecución a scripts
chmod +x init.sh
chmod +x seed_data.py

# Preguntar si quiere iniciar con Docker
echo ""
read -p "¿Quieres iniciar los servicios con Docker? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Iniciando servicios con Docker..."
    
    # Construir e iniciar contenedores
    docker-compose up -d postgres redis
    
    log_info "Esperando que la base de datos esté lista..."
    sleep 10
    
    # Verificar que la base de datos esté funcionando
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U larrosa_user -d larrosa_camiones; then
            log_success "Base de datos lista"
            break
        fi
        
        if [ $i -eq 30 ]; then
            log_error "Timeout esperando la base de datos"
            exit 1
        fi
        
        sleep 2
    done
    
    # Ejecutar migraciones
    log_info "Ejecutando migraciones..."
    docker-compose exec -T backend alembic upgrade head || {
        log_warning "Error en migraciones, intentando crear tablas directamente..."
        docker-compose exec -T backend python create_tables.py
    }
    
    # Poblar base de datos
    echo ""
    read -p "¿Quieres poblar la base de datos con datos de prueba? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Poblando base de datos..."
        docker-compose exec -T backend python seed_data.py
    fi
    
    # Iniciar backend
    log_info "Iniciando backend..."
    docker-compose up -d backend
    
    echo ""
    log_success "🎉 Servicios iniciados correctamente!"
    echo ""
    echo "📋 Servicios disponibles:"
    echo "   🌐 API Backend: http://localhost:8000"
    echo "   📚 Documentación API: http://localhost:8000/api/docs"
    echo "   🗄️  PostgreSQL: localhost:5432"
    echo "   🔄 Redis: localhost:6379"
    echo ""
    echo "🔑 Usuario de prueba creado:"
    echo "   • Username: admin"
    echo "   • Password: admin123"
    echo "   • Email: admin@larrosacamiones.com"
    echo ""
    echo "🐳 Comandos útiles:"
    echo "   • Ver logs: docker-compose logs -f backend"
    echo "   • Detener servicios: docker-compose down"
    echo "   • Reiniciar backend: docker-compose restart backend"
    echo "   • Acceder al contenedor: docker-compose exec backend bash"
    echo ""
    
else
    log_info "Configuración manual seleccionada"
    echo ""
    echo "📋 Para configurar manualmente:"
    echo "1. Instalar PostgreSQL y Redis"
    echo "2. Crear base de datos 'larrosa_camiones'"
    echo "3. Instalar dependencias Python: pip install -r requirements.txt"
    echo "4. Ejecutar migraciones: alembic upgrade head"
    echo "5. Poblar datos: python seed_data.py"
    echo "6. Iniciar servidor: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
fi

echo ""
log_info "Inicialización completada"