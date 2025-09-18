#!/bin/bash
# fix_images.sh - Script para corregir problemas de imágenes

echo "🔧 CORRECCIÓN DE IMÁGENES - Larrosa Camiones"
echo "=============================================="

# Función para mostrar mensajes
log_info() {
    echo -e "ℹ️  $1"
}

log_success() {
    echo -e "✅ $1"
}

log_warning() {
    echo -e "⚠️  $1"
}

log_error() {
    echo -e "❌ $1"
}

# 1. Verificar que Docker está corriendo
log_info "Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    log_error "Docker no está corriendo. Ejecuta: docker-compose up -d"
    exit 1
fi

# 2. Parar servicios para hacer cambios
log_info "Parando servicios..."
docker-compose down

# 3. Verificar estructura de directorios
log_info "Verificando estructura de directorios..."
mkdir -p static/uploads/vehicles/thumbnails
chmod -R 755 static/
log_success "Directorios creados/verificados"

# 4. Limpiar contenedores y volúmenes
log_info "Limpiando contenedores..."
docker system prune -f

# 5. Reconstruir servicios
log_info "Reconstruyendo servicios..."
docker-compose build --no-cache backend

# 6. Iniciar servicios
log_info "Iniciando servicios..."
docker-compose up -d

# 7. Esperar que los servicios estén listos
log_info "Esperando que los servicios estén listos..."
sleep 15

# 8. Verificar que la API responda
log_info "Verificando API..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null; then
        log_success "API está respondiendo"
        break
    fi
    
    if [ $i -eq 30 ]; then
        log_error "Timeout esperando la API"
        docker-compose logs backend
        exit 1
    fi
    
    sleep 2
done

# 9. Crear directorios dentro del contenedor
log_info "Creando directorios en el contenedor..."
docker-compose exec backend mkdir -p static/uploads/vehicles/thumbnails
docker-compose exec backend chmod -R 755 static/

# 10. Verificar estructura de archivos
log_info "Verificando estructura de archivos..."
docker-compose exec backend ls -la static/
docker-compose exec backend ls -la static/uploads/
docker-compose exec backend ls -la static/uploads/vehicles/

# 11. Probar endpoints críticos
log_info "Probando endpoints críticos..."

# Health check
if curl -s http://localhost:8000/health | jq . > /dev/null 2>&1; then
    log_success "Health check OK"
else
    log_warning "Health check failed"
fi

# Debug files endpoint
if curl -s http://localhost:8000/debug/files > /dev/null; then
    log_success "Debug files endpoint OK"
else
    log_warning "Debug files endpoint failed"
fi

# Vehicles endpoint
if curl -s http://localhost:8000/api/v1/vehicles/stats > /dev/null; then
    log_success "Vehicles endpoint OK"
else
    log_warning "Vehicles endpoint failed"
fi

# 12. Crear usuario admin si no existe
log_info "Creando usuario admin..."
docker-compose exec backend python /app/create_admin_user.py > /dev/null 2>&1

# 13. Mostrar información del sistema
log_success "Sistema corregido!"
echo ""
echo "📋 INFORMACIÓN DEL SISTEMA:"
echo "   🌐 API: http://localhost:8000"
echo "   📚 Docs: http://localhost:8000/api/docs"
echo "   🗄️  Debug: http://localhost:8000/debug/files"
echo "   🏥 Health: http://localhost:8000/health"
echo ""
echo "🔑 Credenciales de admin:"
echo "   • Usuario: admin"
echo "   • Contraseña: admin123"
echo ""
echo "🛠️  Para debug en el navegador, usa:"
echo "   • debugImages()"
echo "   • checkBackendSetup()"
echo "   • fixImages()"
echo ""

# 14. Mostrar logs recientes
log_info "Logs recientes del backend:"
docker-compose logs --tail=10 backend

echo ""
echo "=============================================="
echo "✅ CORRECCIÓN COMPLETADA"
echo "Si aún hay problemas, revisa los logs con:"
echo "docker-compose logs -f backend"