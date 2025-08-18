#!/bin/bash
# Script de diagnóstico para Larrosa Camiones Backend

echo "🚛 DIAGNÓSTICO LARROSA CAMIONES BACKEND"
echo "========================================"

# 1. Verificar si el backend está corriendo
echo "1. Verificando estado del backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend respondiendo en http://localhost:8000"
    curl -s http://localhost:8000/health | jq . 2>/dev/null || curl -s http://localhost:8000/health
else
    echo "❌ Backend NO está respondiendo en puerto 8000"
    echo "   Verificar si el servidor está iniciado"
fi

echo ""

# 2. Verificar estado de Docker
echo "2. Verificando contenedores Docker..."
if command -v docker &> /dev/null; then
    echo "Docker containers:"
    docker ps | grep -E "(larrosa|postgres|redis)" || echo "   No se encontraron contenedores de Larrosa"
    echo ""
    echo "Docker logs del backend (últimas 10 líneas):"
    docker-compose logs --tail=10 backend 2>/dev/null || echo "   No se pudieron obtener logs"
else
    echo "❌ Docker no está instalado o no está disponible"
fi

echo ""

# 3. Verificar base de datos
echo "3. Verificando conexión a base de datos..."
if command -v docker &> /dev/null; then
    docker-compose exec -T postgres pg_isready -U larrosa_user -d larrosa_camiones 2>/dev/null && echo "✅ Base de datos PostgreSQL está lista" || echo "❌ Base de datos no responde"
else
    echo "   Verificando conexión local..."
    if command -v psql &> /dev/null; then
        PGPASSWORD=larrosa_password psql -h localhost -U larrosa_user -d larrosa_camiones -c "SELECT 1;" > /dev/null 2>&1 && echo "✅ Conexión local a PostgreSQL exitosa" || echo "❌ No se puede conectar a PostgreSQL local"
    else
        echo "   psql no está instalado para verificar conexión local"
    fi
fi

echo ""

# 4. Verificar endpoints de la API
echo "4. Verificando endpoints de la API..."
endpoints=(
    "/health"
    "/api/v1/auth/login-json"
    "/api/v1/vehicles/stats"
)

for endpoint in "${endpoints[@]}"; do
    if curl -s "http://localhost:8000$endpoint" > /dev/null; then
        echo "✅ $endpoint - Responde"
    else
        echo "❌ $endpoint - No responde"
    fi
done

echo ""

# 5. Verificar archivos de configuración
echo "5. Verificando archivos de configuración..."
if [ -f ".env" ]; then
    echo "✅ Archivo .env encontrado"
    echo "   Variables importantes:"
    grep -E "(DATABASE_URL|SECRET_KEY|ALLOWED_HOSTS)" .env | head -3
else
    echo "❌ Archivo .env NO encontrado"
fi

echo ""

# 6. Verificar puertos
echo "6. Verificando puertos en uso..."
if command -v netstat &> /dev/null; then
    echo "Puerto 8000 (Backend):"
    netstat -tulpn 2>/dev/null | grep :8000 || echo "   Puerto 8000 no está en uso"
    echo "Puerto 5432 (PostgreSQL):"
    netstat -tulpn 2>/dev/null | grep :5432 || echo "   Puerto 5432 no está en uso"
elif command -v lsof &> /dev/null; then
    echo "Puerto 8000 (Backend):"
    lsof -i :8000 2>/dev/null || echo "   Puerto 8000 no está en uso"
    echo "Puerto 5432 (PostgreSQL):"
    lsof -i :5432 2>/dev/null || echo "   Puerto 5432 no está en uso"
else
    echo "   No se pueden verificar puertos (netstat/lsof no disponibles)"
fi

echo ""
echo "========================================"
echo "🔍 DIAGNÓSTICO COMPLETADO"
echo ""
echo "ACCIONES RECOMENDADAS:"
echo "1. Si el backend no responde:"
echo "   - Ejecutar: docker-compose up -d backend"
echo "   - O: cd larrosa-backend && python -m uvicorn app.main:app --reload"
echo ""
echo "2. Si la base de datos no responde:"
echo "   - Ejecutar: docker-compose up -d postgres"
echo ""
echo "3. Si faltan migraciones:"
echo "   - Ejecutar: docker-compose exec backend alembic upgrade head"
echo ""
echo "4. Para ver logs detallados:"
echo "   - Ejecutar: docker-compose logs -f backend"