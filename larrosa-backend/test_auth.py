#!/usr/bin/env python3
"""
Script para probar la autenticación de la API
"""
import requests
import json
import sys

# Configuración
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_register():
    """Probar registro de usuario"""
    print("🔐 Probando registro de usuario...")
    
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Usuario de Prueba"
    }
    
    response = requests.post(f"{API_BASE}/auth/register", json=user_data)
    
    if response.status_code == 200:
        print("✅ Usuario registrado correctamente")
        user = response.json()
        print(f"   ID: {user['id']}")
        print(f"   Username: {user['username']}")
        print(f"   Email: {user['email']}")
        return True
    else:
        print(f"❌ Error en registro: {response.status_code}")
        print(f"   Detalle: {response.text}")
        return False

def test_login():
    """Probar login y obtener token"""
    print("\n🔑 Probando login...")
    
    # Login con JSON
    login_data = {
        "username": "admin",  # Usuario creado en seed_data.py
        "password": "admin123"
    }
    
    response = requests.post(f"{API_BASE}/auth/login-json", json=login_data)
    
    if response.status_code == 200:
        print("✅ Login exitoso")
        token_data = response.json()
        token = token_data["access_token"]
        user = token_data["user"]
        
        print(f"   Token: {token[:20]}...")
        print(f"   Usuario: {user['username']}")
        print(f"   Email: {user['email']}")
        print(f"   Es admin: {user['is_superuser']}")
        
        return token
    else:
        print(f"❌ Error en login: {response.status_code}")
        print(f"   Detalle: {response.text}")
        return None

def test_protected_route(token):
    """Probar ruta protegida"""
    print("\n🛡️ Probando ruta protegida...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/auth/protected", headers=headers)
    
    if response.status_code == 200:
        print("✅ Acceso a ruta protegida exitoso")
        data = response.json()
        print(f"   Mensaje: {data['message']}")
        print(f"   Usuario: {data['user']}")
        return True
    else:
        print(f"❌ Error accediendo a ruta protegida: {response.status_code}")
        print(f"   Detalle: {response.text}")
        return False

def test_user_info(token):
    """Probar obtener información del usuario"""
    print("\n👤 Probando obtener info del usuario...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/auth/me", headers=headers)
    
    if response.status_code == 200:
        print("✅ Información del usuario obtenida")
        user = response.json()
        print(f"   ID: {user['id']}")
        print(f"   Username: {user['username']}")
        print(f"   Email: {user['email']}")
        print(f"   Nombre completo: {user.get('full_name', 'N/A')}")
        print(f"   Activo: {user['is_active']}")
        print(f"   Superusuario: {user['is_superuser']}")
        return True
    else:
        print(f"❌ Error obteniendo info del usuario: {response.status_code}")
        print(f"   Detalle: {response.text}")
        return False

def test_admin_route(token):
    """Probar ruta de administrador"""
    print("\n👑 Probando ruta de administrador...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/auth/admin-only", headers=headers)
    
    if response.status_code == 200:
        print("✅ Acceso a ruta de admin exitoso")
        data = response.json()
        print(f"   Mensaje: {data['message']}")
        print(f"   Admin: {data['admin']}")
        return True
    elif response.status_code == 403:
        print("⚠️ Acceso denegado (usuario no es admin)")
        return True  # Es el comportamiento esperado para usuarios normales
    else:
        print(f"❌ Error accediendo a ruta de admin: {response.status_code}")
        print(f"   Detalle: {response.text}")
        return False

def test_vehicle_creation(token):
    """Probar creación de vehículo con autenticación"""
    print("\n🚛 Probando creación de vehículo autenticado...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Datos del vehículo
    vehicle_data = {
        "brand": "Mercedes-Benz",
        "model": "Actros 1844",
        "full_name": "Mercedes-Benz Actros 1844",
        "type": "camion-tractor",
        "type_name": "Camión Tractor",
        "year": 2022,
        "kilometers": 45000,
        "power": 440,
        "traccion": "4x2",
        "transmission": "Automática",
        "color": "Blanco",
        "status": "Disponible",
        "price": 85000,
        "is_featured": False,
        "location": "Villa María, Córdoba",
        "description": "Mercedes-Benz Actros en excelente estado, creado via API autenticada.",
        "observations": "Vehículo de prueba creado por API",
        "date_registered": "09/01/2025"
    }
    
    # Crear formulario multipart
    files = {
        'vehicle_data': (None, json.dumps(vehicle_data))
    }
    
    response = requests.post(f"{API_BASE}/vehicles/", files=files, headers=headers)
    
    if response.status_code == 200:
        print("✅ Vehículo creado correctamente")
        vehicle = response.json()
        print(f"   ID: {vehicle['id']}")
        print(f"   Nombre: {vehicle['full_name']}")
        print(f"   Creado por: {vehicle['created_by']}")
        return vehicle['id']
    else:
        print(f"❌ Error creando vehículo: {response.status_code}")
        print(f"   Detalle: {response.text}")
        return None

def test_vehicle_update(token, vehicle_id):
    """Probar actualización de vehículo"""
    print(f"\n📝 Probando actualización de vehículo {vehicle_id}...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    update_data = {
        "description": "Mercedes-Benz Actros actualizado via API autenticada",
        "price": 87000,
        "kilometers": 46000
    }
    
    response = requests.put(f"{API_BASE}/vehicles/{vehicle_id}", 
                          json=update_data, headers=headers)
    
    if response.status_code == 200:
        print("✅ Vehículo actualizado correctamente")
        vehicle = response.json()
        print(f"   Nuevo precio: ${vehicle['price']}")
        print(f"   Nueva descripción: {vehicle['description'][:50]}...")
        return True
    else:
        print(f"❌ Error actualizando vehículo: {response.status_code}")
        print(f"   Detalle: {response.text}")
        return False

def test_unauthorized_access():
    """Probar acceso sin token"""
    print("\n🚫 Probando acceso sin autenticación...")
    
    # Intentar crear vehículo sin token
    vehicle_data = {
        "brand": "Test",
        "model": "Test",
        "full_name": "Test Vehicle",
        "type": "camion-tractor",
        "type_name": "Camión Tractor",
        "year": 2020,
        "kilometers": 50000
    }
    
    files = {
        'vehicle_data': (None, json.dumps(vehicle_data))
    }
    
    response = requests.post(f"{API_BASE}/vehicles/", files=files)
    
    if response.status_code == 401:
        print("✅ Acceso correctamente denegado sin autenticación")
        return True
    else:
        print(f"❌ Error: debería denegar acceso sin token. Status: {response.status_code}")
        return False

def test_token_verification(token):
    """Probar verificación de token"""
    print("\n🔍 Probando verificación de token...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{API_BASE}/auth/verify-token", headers=headers)
    
    if response.status_code == 200:
        print("✅ Token verificado correctamente")
        data = response.json()
        print(f"   Válido: {data['valid']}")
        print(f"   Usuario: {data['username']}")
        print(f"   Es superusuario: {data['is_superuser']}")
        return True
    else:
        print(f"❌ Error verificando token: {response.status_code}")
        return False

def main():
    """Función principal"""
    print("🚛 Iniciando pruebas de autenticación API Larrosa Camiones")
    print("=" * 60)
    
    # Verificar que la API esté funcionando
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("❌ API no está funcionando")
            sys.exit(1)
        print("✅ API funcionando correctamente")
    except requests.ConnectionError:
        print("❌ No se puede conectar a la API. ¿Está corriendo en localhost:8000?")
        sys.exit(1)
    
    success_count = 0
    total_tests = 0
    
    # Pruebas
    tests = [
        ("Registro de usuario", test_register),
        ("Login", lambda: test_login()),
        ("Acceso sin autenticación", test_unauthorized_access),
    ]
    
    # Ejecutar pruebas básicas
    token = None
    for test_name, test_func in tests:
        total_tests += 1
        try:
            if test_name == "Login":
                result = test_func()
                token = result
                if token:
                    success_count += 1
            else:
                if test_func():
                    success_count += 1
        except Exception as e:
            print(f"❌ Error en {test_name}: {e}")
    
    # Si tenemos token, continuar con pruebas autenticadas
    if token:
        auth_tests = [
            ("Información del usuario", lambda: test_user_info(token)),
            ("Ruta protegida", lambda: test_protected_route(token)),
            ("Ruta de administrador", lambda: test_admin_route(token)),
            ("Verificación de token", lambda: test_token_verification(token)),
            ("Creación de vehículo", lambda: test_vehicle_creation(token)),
        ]
        
        vehicle_id = None
        for test_name, test_func in auth_tests:
            total_tests += 1
            try:
                result = test_func()
                if test_name == "Creación de vehículo" and result:
                    vehicle_id = result
                    success_count += 1
                elif test_name != "Creación de vehículo" and result:
                    success_count += 1
            except Exception as e:
                print(f"❌ Error en {test_name}: {e}")
        
        # Probar actualización si se creó un vehículo
        if vehicle_id:
            total_tests += 1
            try:
                if test_vehicle_update(token, vehicle_id):
                    success_count += 1
            except Exception as e:
                print(f"❌ Error en actualización de vehículo: {e}")
    
    # Resumen
    print("\n" + "=" * 60)
    print(f"📊 Resumen de pruebas:")
    print(f"   ✅ Exitosas: {success_count}/{total_tests}")
    print(f"   ❌ Fallidas: {total_tests - success_count}/{total_tests}")
    
    if success_count == total_tests:
        print("\n🎉 ¡Todas las pruebas pasaron! Sistema de autenticación funcionando correctamente.")
    else:
        print(f"\n⚠️ {total_tests - success_count} pruebas fallaron. Revisar configuración.")
    
    return success_count == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)