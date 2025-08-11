#!/usr/bin/env python3
"""
Script para crear usuarios administradores
Ubicación: app/create_admin.py
"""
import os
import sys

# Agregar el directorio padre al path para imports absolutos
sys.path.insert(0, '/app')

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin_user():
    """Crear usuario administrador principal"""
    db = SessionLocal()
    
    try:
        # Verificar si ya existe el usuario admin
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("✅ Usuario admin ya existe")
            print(f"   • Username: {existing_user.username}")
            print(f"   • Email: {existing_user.email}")
            print(f"   • Es superusuario: {existing_user.is_superuser}")
            return existing_user
        
        # Crear nuevo usuario admin
        admin_user = User(
            username="admin",
            email="admin@larrosacamiones.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrador Larrosa",
            is_active=True,
            is_superuser=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("🎉 Usuario admin creado exitosamente!")
        print(f"   • Username: admin")
        print(f"   • Password: admin123")
        print(f"   • Email: admin@larrosacamiones.com")
        print(f"   • ID: {admin_user.id}")
        
        return admin_user
        
    except Exception as e:
        print(f"❌ Error creando usuario admin: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return None
    finally:
        db.close()

def create_sales_user():
    """Crear usuario para ventas"""
    db = SessionLocal()
    
    try:
        # Verificar si ya existe
        existing_user = db.query(User).filter(User.username == "ventas").first()
        if existing_user:
            print("✅ Usuario ventas ya existe")
            return existing_user
        
        # Crear usuario de ventas
        sales_user = User(
            username="ventas",
            email="ventas@larrosacamiones.com",
            hashed_password=get_password_hash("ventas123"),
            full_name="Equipo de Ventas",
            is_active=True,
            is_superuser=False
        )
        
        db.add(sales_user)
        db.commit()
        db.refresh(sales_user)
        
        print("🎉 Usuario ventas creado exitosamente!")
        print(f"   • Username: ventas")
        print(f"   • Password: ventas123")
        print(f"   • Email: ventas@larrosacamiones.com")
        
        return sales_user
        
    except Exception as e:
        print(f"❌ Error creando usuario ventas: {e}")
        db.rollback()
        return None
    finally:
        db.close()

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
            print("-" * 40)
            
    except Exception as e:
        print(f"❌ Error listando usuarios: {e}")
    finally:
        db.close()

def main():
    """Función principal"""
    print("🚛 Gestión de Usuarios - Larrosa Camiones")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "create":
            print("Creando usuarios por defecto...")
            create_admin_user()
            create_sales_user()
        elif command == "list":
            list_users()
        elif command == "admin":
            create_admin_user()
        else:
            print("Comandos disponibles:")
            print("  python app/create_admin.py create  - Crear usuarios por defecto")
            print("  python app/create_admin.py admin   - Crear solo usuario admin")
            print("  python app/create_admin.py list    - Listar usuarios")
    else:
        # Crear usuario admin por defecto
        create_admin_user()

if __name__ == "__main__":
    main()