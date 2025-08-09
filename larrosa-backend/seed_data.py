#!/usr/bin/env python3
"""
Script para poblar la base de datos con datos de prueba
"""
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleImage
from app.core.security import get_password_hash
import random
from datetime import datetime, timedelta

def create_test_user(db: Session):
    """Crear usuario de prueba"""
    test_user = db.query(User).filter(User.username == "admin").first()
    if test_user:
        print("Usuario admin ya existe")
        return test_user
    
    user = User(
        username="admin",
        email="admin@larrosacamiones.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Administrador Larrosa",
        is_active=True,
        is_superuser=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"✅ Usuario creado: {user.username}")
    return user

def main():
    """Función principal"""
    print("🚛 Iniciando población de base de datos...")
    
    # Crear sesión
    db = SessionLocal()
    
    try:
        # Crear usuario de prueba
        user = create_test_user(db)
        print("✅ Base de datos poblada correctamente!")
        print(f"\n🔑 Usuario admin creado:")
        print(f"   • Username: admin")
        print(f"   • Password: admin123")
        print(f"   • Email: admin@larrosacamiones.com")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
