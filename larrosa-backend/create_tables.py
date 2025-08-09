import os
import sys

# Agregar el directorio app al path
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from app.core.database import engine, Base
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleImage

def create_tables():
    """Crear todas las tablas en la base de datos"""
    try:
        print("🔨 Creando tablas...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas correctamente!")
        
        # Verificar que se crearon
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"📋 Tablas creadas: {tables}")
        
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")

if __name__ == "__main__":
    create_tables()
