#!/usr/bin/env python3
"""
Script para crear usuario administrador
Ejecutar desde el contenedor del backend:
docker-compose exec backend python create_admin_user.py
"""
import sys
import os
sys.path.append('/app')

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleImage
from app.core.security import get_password_hash
from datetime import datetime

def create_database_tables():
    """Crear todas las tablas si no existen"""
    try:
        print("📋 Creando tablas de base de datos...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas correctamente")
        return True
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")
        return False

def create_admin_user():
    """Crear usuario administrador"""
    db = SessionLocal()
    
    try:
        # Verificar si ya existe el usuario admin
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("✅ Usuario admin ya existe")
            print(f"   • ID: {existing_admin.id}")
            print(f"   • Username: {existing_admin.username}")
            print(f"   • Email: {existing_admin.email}")
            print(f"   • Es superusuario: {existing_admin.is_superuser}")
            print(f"   • Activo: {existing_admin.is_active}")
            return existing_admin
        
        # Crear nuevo usuario admin
        admin_user = User(
            username="admin",
            email="admin@larrosacamiones.com", 
            hashed_password=get_password_hash("admin123"),
            full_name="Administrador Principal",
            is_active=True,
            is_superuser=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("🎉 Usuario administrador creado exitosamente!")
        print(f"   • ID: {admin_user.id}")
        print(f"   • Username: admin")
        print(f"   • Password: admin123")
        print(f"   • Email: admin@larrosacamiones.com")
        print(f"   • Es superusuario: {admin_user.is_superuser}")
        
        return admin_user
        
    except Exception as e:
        print(f"❌ Error creando usuario admin: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def create_test_vehicle(admin_user_id):
    """Crear vehículo de prueba"""
    db = SessionLocal()
    
    try:
        # Verificar si ya existe un vehículo de prueba
        existing_vehicle = db.query(Vehicle).filter(Vehicle.brand == "Scania", Vehicle.model.like("%Test%")).first()
        if existing_vehicle:
            print("✅ Vehículo de prueba ya existe")
            return existing_vehicle
        
        # Crear vehículo de prueba
        test_vehicle = Vehicle(
            brand="Scania",
            model="R450 Test",
            full_name="Scania R450 Test - Vehículo de Prueba",
            type="camion-tractor",
            type_name="Camión Tractor",
            year=2020,
            kilometers=450000,
            power=450,
            traccion="6x2",
            transmission="Manual",
            color="Blanco",
            status="Disponible",
            price=75000.00,
            is_active=True,
            is_featured=True,
            location="Villa María, Córdoba",
            description="Vehículo de prueba creado automáticamente para testing del sistema",
            observations="Vehículo de prueba - Sistema Larrosa Camiones",
            date_registered=datetime.now().strftime("%d/%m/%Y"),
            created_by=admin_user_id
        )
        
        db.add(test_vehicle)
        db.commit()
        db.refresh(test_vehicle)
        
        print("🚛 Vehículo de prueba creado exitosamente!")
        print(f"   • ID: {test_vehicle.id}")
        print(f"   • Nombre: {test_vehicle.full_name}")
        print(f"   • Tipo: {test_vehicle.type_name}")
        print(f"   • Año: {test_vehicle.year}")
        print(f"   • Destacado: {test_vehicle.is_featured}")
        
        return test_vehicle
        
    except Exception as e:
        print(f"❌ Error creando vehículo de prueba: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def check_database_connection():
    """Verificar conexión a la base de datos"""
    try:
        db = SessionLocal()
        # Intentar hacer una query simple
        result = db.execute("SELECT 1").fetchone()
        db.close()
        print("✅ Conexión a base de datos exitosa")
        return True
    except Exception as e:
        print(f"❌ Error conectando a base de datos: {e}")
        return False

def list_users():
    """Listar todos los usuarios"""
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        
        if not users:
            print("📝 No hay usuarios en el sistema")
            return
        
        print("📋 Usuarios en el sistema:")
        print("=" * 60)
        for user in users:
            print(f"👤 {user.username} - {user.full_name}")
            print(f"   📧 {user.email}")
            print(f"   {'👑 Admin' if user.is_superuser else '👤 Usuario'}")
            print(f"   {'✅ Activo' if user.is_active else '❌ Inactivo'}")
            print(f"   🆔 ID: {user.id}")
            print(f"   📅 Creado: {user.created_at}")
            print("-" * 40)
            
    except Exception as e:
        print(f"❌ Error listando usuarios: {e}")
    finally:
        db.close()

def list_vehicles():
    """Listar todos los vehículos"""
    db = SessionLocal()
    
    try:
        vehicles = db.query(Vehicle).filter(Vehicle.is_active == True).all()
        
        if not vehicles:
            print("📝 No hay vehículos en el sistema")
            return
        
        print("📋 Vehículos en el sistema:")
        print("=" * 60)
        for vehicle in vehicles:
            print(f"🚛 {vehicle.full_name}")
            print(f"   🔧 {vehicle.type_name}")
            print(f"   📅 Año: {vehicle.year}")
            print(f"   🛣️ Km: {vehicle.kilometers:,}")
            print(f"   📍 {vehicle.status}")
            print(f"   {'⭐ Destacado' if vehicle.is_featured else '   Normal'}")
            print(f"   🆔 ID: {vehicle.id}")
            print("-" * 40)
            
    except Exception as e:
        print(f"❌ Error listando vehículos: {e}")
    finally:
        db.close()

def main():
    """Función principal"""
    print("🚛 LARROSA CAMIONES - Setup Base de Datos")
    print("=" * 50)
    
    # 1. Verificar conexión
    if not check_database_connection():
        print("❌ No se puede conectar a la base de datos")
        return False
    
    # 2. Crear tablas
    if not create_database_tables():
        print("❌ No se pudieron crear las tablas")
        return False
    
    # 3. Crear usuario admin
    admin_user = create_admin_user()
    if not admin_user:
        print("❌ No se pudo crear el usuario administrador")
        return False
    
    # 4. Crear vehículo de prueba
    if admin_user:
        test_vehicle = create_test_vehicle(admin_user.id)
        
    print("\n" + "=" * 50)
    print("📊 RESUMEN FINAL:")
    list_users()
    print()
    list_vehicles()
    
    print("\n" + "=" * 50)
    print("🎉 SETUP COMPLETADO!")
    print("\n🔑 Credenciales de acceso:")
    print("   • Usuario: admin")
    print("   • Contraseña: admin123")
    print("   • URL: http://localhost:8000/api/docs")
    print("\n🌐 Panel de administración:")
    print("   • URL: http://localhost/admin/login.html")
    print("   • Usuario: admin")
    print("   • Contraseña: admin123")
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⏹️ Proceso cancelado por el usuario")
    except Exception as e:
        print(f"\n💥 Error inesperado: {e}")
        import traceback
        traceback.print_exc()