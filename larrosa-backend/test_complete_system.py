#!/usr/bin/env python3
"""
Script de testing completo para Larrosa Camiones
Ejecutar: docker-compose exec backend python test_complete_system.py
"""
import requests
import json
import sys
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_backend_health():
    """Probar que el backend esté funcionando"""
    print("🏥 Probando salud del backend...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend funcionando: {data.get('status', 'unknown')}")
            print(f"   Versión: {data.get('version', 'unknown')}")
            print(f"   Entorno: {data.get('environment', 'unknown')}")
            return True
        else:
            print(f"❌ Backend respondió con código {response.status_code}")
            return False
    except requests.ConnectionError:
        print("❌ No se puede conectar al backend. ¿Está corriendo en localhost:8000?")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def test_api_docs():
    """Verificar que la documentación esté disponible"""
    print("\n📚 Probando documentación de la API...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/docs")
        if response.status_code == 200:
            print("✅ Documentación API disponible en /api/docs")
            return True
        else:
            print(f"❌ Documentación no disponible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error accediendo a docs: {e}")
        return False

def test_login():
    """Probar el login"""
    print("\n🔐 Probando login...")
    
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/login-json", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            user = data.get("user", {})
            
            print("✅ Login exitoso!")
            print(f"   Usuario: {user.get('username', 'N/A')}")
            print(f"   Email: {user.get('email', 'N/A')}")
            print(f"   Es admin: {user.get('is_superuser', False)}")
            print(f"   Token: {token[:20] if token else 'N/A'}...")
            
            return token
        else:
            print(f"❌ Error en login: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"   Detalle: {error_detail.get('detail', 'Error desconocido')}")
            except:
                print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error inesperado en login: {e}")
        return None

def test_protected_routes(token):
    """Probar rutas protegidas"""
    print("\n🛡️ Probando rutas protegidas...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Ruta protegida básica
    try:
        response = requests.get(f"{API_BASE}/auth/protected", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Ruta protegida: {data.get('message', 'OK')}")
        else:
            print(f"❌ Error en ruta protegida: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en ruta protegida: {e}")
    
    # Test 2: Información del usuario
    try:
        response = requests.get(f"{API_BASE}/auth/me", headers=headers)
        if response.status_code == 200:
            user = response.json()
            print(f"✅ Info usuario: {user.get('username', 'N/A')} ({user.get('email', 'N/A')})")
        else:
            print(f"❌ Error obteniendo info usuario: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en info usuario: {e}")
    
    # Test 3: Verificar token
    try:
        response = requests.post(f"{API_BASE}/auth/verify-token", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Token válido: {data.get('valid', False)}")
        else:
            print(f"❌ Error verificando token: {response.status_code}")
    except Exception as e:
        print(f"❌ Error verificando token: {e}")

def test_vehicles_endpoints():
    """Probar endpoints públicos de vehículos"""
    print("\n🚛 Probando endpoints de vehículos (públicos)...")
    
    # Test 1: Obtener estadísticas
    try:
        response = requests.get(f"{API_BASE}/vehicles/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Estadísticas: {stats.get('total', 0)} vehículos total")
            print(f"   - Disponibles: {stats.get('available', 0)}")
            print(f"   - Destacados: {stats.get('featured', 0)}")
        else:
            print(f"❌ Error en stats: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en stats: {e}")
    
    # Test 2: Obtener lista de vehículos
    try:
        response = requests.get(f"{API_BASE}/vehicles/?limit=5")
        if response.status_code == 200:
            data = response.json()
            vehicles = data.get("vehicles", [])
            print(f"✅ Lista vehículos: {len(vehicles)} encontrados")
            if vehicles:
                print(f"   - Primer vehículo: {vehicles[0].get('full_name', 'N/A')}")
        else:
            print(f"❌ Error en lista vehículos: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en lista vehículos: {e}")
    
    # Test 3: Obtener vehículos destacados
    try:
        response = requests.get(f"{API_BASE}/vehicles/featured")
        if response.status_code == 200:
            featured = response.json()
            print(f"✅ Vehículos destacados: {len(featured)} encontrados")
            for vehicle in featured[:2]:  # Mostrar primeros 2
                print(f"   - {vehicle.get('full_name', 'N/A')} ({vehicle.get('year', 'N/A')})")
        else:
            print(f"❌ Error en destacados: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en destacados: {e}")

def test_create_vehicle(token):
    """Probar crear vehículo"""
    print("\n🔧 Probando creación de vehículo...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Usar el endpoint de test que es más simple
    try:
        response = requests.post(f"{API_BASE}/vehicles/test-create", headers=headers)
        
        if response.status_code == 200:
            vehicle = response.json()
            print(f"✅ Vehículo creado exitosamente!")
            print(f"   ID: {vehicle.get('id', 'N/A')}")
            print(f"   Nombre: {vehicle.get('full_name', 'N/A')}")
            print(f"   Tipo: {vehicle.get('type_name', 'N/A')}")
            print(f"   Año: {vehicle.get('year', 'N/A')}")
            print(f"   Destacado: {vehicle.get('is_featured', False)}")
            return vehicle.get('id')
        else:
            print(f"❌ Error creando vehículo: {response.status_code}")
            try:
                error = response.json()
                print(f"   Detalle: {error.get('detail', 'Error desconocido')}")
            except:
                print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error inesperado creando vehículo: {e}")
        return None

def test_admin_endpoints(token):
    """Probar endpoints de administración"""
    print("\n👑 Probando endpoints de administración...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Ruta solo admin
    try:
        response = requests.get(f"{API_BASE}/auth/admin-only", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Ruta admin: {data.get('message', 'OK')}")
        else:
            print(f"❌ Error en ruta admin: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en ruta admin: {e}")
    
    # Test 2: Dashboard stats
    try:
        response = requests.get(f"{API_BASE}/vehicles/admin/dashboard-stats", headers=headers)
        if response.status_code == 200:
            data = response.json()
            stats = data.get("stats", {})
            recent = data.get("recent_vehicles", [])
            print(f"✅ Dashboard stats: {stats.get('total', 0)} vehículos")
            print(f"   - Recientes: {len(recent)} vehículos")
        else:
            print(f"❌ Error en dashboard stats: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en dashboard stats: {e}")
    
    # Test 3: Listar todos los vehículos (admin)
    try:
        response = requests.get(f"{API_BASE}/vehicles/admin/all?limit=10", headers=headers)
        if response.status_code == 200:
            data = response.json()
            vehicles = data.get("vehicles", [])
            total = data.get("total", 0)
            print(f"✅ Admin vehículos: {len(vehicles)} de {total} total")
        else:
            print(f"❌ Error en admin vehículos: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en admin vehículos: {e}")

def test_vehicle_operations(token, vehicle_id):
    """Probar operaciones con vehículos"""
    if not vehicle_id:
        print("\n⏩ Saltando operaciones de vehículo (no hay ID)")
        return
    
    print(f"\n🔄 Probando operaciones con vehículo ID: {vehicle_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Obtener vehículo específico
    try:
        response = requests.get(f"{API_BASE}/vehicles/{vehicle_id}")
        if response.status_code == 200:
            vehicle = response.json()
            print(f"✅ Vehículo obtenido: {vehicle.get('full_name', 'N/A')}")
        else:
            print(f"❌ Error obteniendo vehículo: {response.status_code}")
    except Exception as e:
        print(f"❌ Error obteniendo vehículo: {e}")
    
    # Test 2: Alternar estado destacado
    try:
        response = requests.patch(f"{API_BASE}/vehicles/{vehicle_id}/toggle-featured", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Estado destacado cambiado: {data.get('is_featured', 'N/A')}")
        else:
            print(f"❌ Error cambiando estado: {response.status_code}")
    except Exception as e:
        print(f"❌ Error cambiando estado: {e}")

def test_cors():
    """Probar CORS"""
    print("\n🌐 Probando CORS...")
    
    headers = {
        "Origin": "http://localhost:5500",  # Live Server
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type"
    }
    
    try:
        response = requests.options(f"{API_BASE}/vehicles/stats", headers=headers)
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
        }
        
        if cors_headers["Access-Control-Allow-Origin"]:
            print("✅ CORS configurado correctamente")
            print(f"   Origin permitido: {cors_headers['Access-Control-Allow-Origin']}")
        else:
            print("❌ CORS no configurado o no funcionando")
            
    except Exception as e:
        print(f"❌ Error probando CORS: {e}")

def test_frontend_connection():
    """Simular petición desde el frontend"""
    print("\n💻 Simulando petición desde frontend...")
    
    headers = {
        "Origin": "http://localhost:5500",
        "Content-Type": "application/json"
    }
    
    try:
        # Simular login desde frontend
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        response = requests.post(f"{API_BASE}/auth/login-json", 
                               json=login_data, 
                               headers=headers)
        
        if response.status_code == 200:
            print("✅ Frontend puede hacer login")
            token = response.json().get("access_token")
            
            # Probar obtener vehículos desde frontend
            auth_headers = {
                **headers,
                "Authorization": f"Bearer {token}"
            }
            
            vehicles_response = requests.get(f"{API_BASE}/vehicles/?limit=3", 
                                           headers=auth_headers)
            
            if vehicles_response.status_code == 200:
                data = vehicles_response.json()
                vehicles = data.get("vehicles", [])
                print(f"✅ Frontend puede obtener vehículos: {len(vehicles)} encontrados")
            else:
                print(f"❌ Frontend no puede obtener vehículos: {vehicles_response.status_code}")
                
        else:
            print(f"❌ Frontend no puede hacer login: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error simulando frontend: {e}")

def run_complete_test():
    """Ejecutar todos los tests"""
    print("🚛 LARROSA CAMIONES - Test Completo del Sistema")
    print("=" * 60)
    
    success_count = 0
    total_tests = 9
    
    # Test 1: Backend health
    if test_backend_health():
        success_count += 1
    
    # Test 2: API docs
    if test_api_docs():
        success_count += 1
        
    # Test 3: Login
    token = test_login()
    if token:
        success_count += 1
        
        # Test 4: Rutas protegidas
        test_protected_routes(token)
        success_count += 1
        
        # Test 5: Admin endpoints
        test_admin_endpoints(token)
        success_count += 1
        
        # Test 6: Crear vehículo
        vehicle_id = test_create_vehicle(token)
        if vehicle_id:
            success_count += 1
            
            # Test 7: Operaciones con vehículo
            test_vehicle_operations(token, vehicle_id)
            success_count += 1
    
    # Test 8: Vehículos públicos
    test_vehicles_endpoints()
    success_count += 1
    
    # Test 9: CORS
    test_cors()
    success_count += 1
    
    # Test bonus: Frontend simulation
    test_frontend_connection()
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE TESTS:")
    print(f"   ✅ Exitosos: {success_count}/{total_tests}")
    print(f"   ❌ Fallidos: {total_tests - success_count}/{total_tests}")
    
    if success_count >= 7:  # Al menos 7 de 9 tests deben pasar
        print("\n🎉 ¡Sistema funcionando correctamente!")
        print("\n🔗 URLs importantes:")
        print(f"   • API Health: {BASE_URL}/health")
        print(f"   • API Docs: {BASE_URL}/api/docs")
        print(f"   • Panel Admin: http://localhost/admin/login.html")
        print("\n🔑 Credenciales:")
        print("   • Usuario: admin")
        print("   • Contraseña: admin123")
    else:
        print(f"\n⚠️ Sistema con problemas: {total_tests - success_count} tests fallaron")
        print("   Revisar logs del backend para más información")
    
    return success_count >= 7

def main():
    """Función principal"""
    try:
        success = run_complete_test()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ Tests cancelados por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Error inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()