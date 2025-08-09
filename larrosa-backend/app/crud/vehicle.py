from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.vehicle import Vehicle, VehicleImage
from app.schemas.vehicle import VehicleCreate, VehicleUpdate
import os

class VehicleCRUD:
    def get_vehicle(self, db: Session, vehicle_id: int) -> Optional[Vehicle]:
        """Obtener un vehículo por ID"""
        return db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.is_active == True).first()
    
    def get_vehicles(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        brand: Optional[str] = None,
        year_min: Optional[int] = None,
        year_max: Optional[int] = None,
        km_min: Optional[int] = None,
        km_max: Optional[int] = None,
        status: Optional[str] = None,
        is_featured: Optional[bool] = None
    ) -> List[Vehicle]:
        """Obtener vehículos con filtros"""
        query = db.query(Vehicle).filter(Vehicle.is_active == True)
        
        # Filtro de búsqueda
        if search:
            query = query.filter(
                or_(
                    Vehicle.brand.ilike(f"%{search}%"),
                    Vehicle.model.ilike(f"%{search}%"),
                    Vehicle.full_name.ilike(f"%{search}%")
                )
            )
        
        # Filtros específicos
        if vehicle_type:
            query = query.filter(Vehicle.type == vehicle_type)
        
        if brand:
            query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
            
        if year_min:
            query = query.filter(Vehicle.year >= year_min)
            
        if year_max:
            query = query.filter(Vehicle.year <= year_max)
            
        if km_min:
            query = query.filter(Vehicle.kilometers >= km_min)
            
        if km_max:
            query = query.filter(Vehicle.kilometers <= km_max)
            
        if status:
            query = query.filter(Vehicle.status == status)
            
        if is_featured is not None:
            query = query.filter(Vehicle.is_featured == is_featured)
        
        return query.offset(skip).limit(limit).all()
    
    def get_vehicles_count(
        self,
        db: Session,
        search: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        brand: Optional[str] = None,
        year_min: Optional[int] = None,
        year_max: Optional[int] = None,
        km_min: Optional[int] = None,
        km_max: Optional[int] = None,
        status: Optional[str] = None,
        is_featured: Optional[bool] = None
    ) -> int:
        """Contar vehículos con filtros"""
        query = db.query(Vehicle).filter(Vehicle.is_active == True)
        
        # Aplicar los mismos filtros que en get_vehicles
        if search:
            query = query.filter(
                or_(
                    Vehicle.brand.ilike(f"%{search}%"),
                    Vehicle.model.ilike(f"%{search}%"),
                    Vehicle.full_name.ilike(f"%{search}%")
                )
            )
        
        if vehicle_type:
            query = query.filter(Vehicle.type == vehicle_type)
        
        if brand:
            query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
            
        if year_min:
            query = query.filter(Vehicle.year >= year_min)
            
        if year_max:
            query = query.filter(Vehicle.year <= year_max)
            
        if km_min:
            query = query.filter(Vehicle.kilometers >= km_min)
            
        if km_max:
            query = query.filter(Vehicle.kilometers <= km_max)
            
        if status:
            query = query.filter(Vehicle.status == status)
            
        if is_featured is not None:
            query = query.filter(Vehicle.is_featured == is_featured)
        
        return query.count()
    
    def create_vehicle(self, db: Session, vehicle: VehicleCreate, created_by: int) -> Vehicle:
        """Crear un nuevo vehículo"""
        db_vehicle = Vehicle(
            **vehicle.dict(),
            created_by=created_by
        )
        db.add(db_vehicle)
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle
    
    def update_vehicle(self, db: Session, vehicle_id: int, vehicle: VehicleUpdate) -> Optional[Vehicle]:
        """Actualizar un vehículo"""
        db_vehicle = self.get_vehicle(db, vehicle_id)
        if not db_vehicle:
            return None
        
        vehicle_data = vehicle.dict(exclude_unset=True)
        for field, value in vehicle_data.items():
            setattr(db_vehicle, field, value)
        
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle
    
    def delete_vehicle(self, db: Session, vehicle_id: int) -> bool:
        """Eliminar un vehículo (soft delete)"""
        db_vehicle = self.get_vehicle(db, vehicle_id)
        if not db_vehicle:
            return False
        
        db_vehicle.is_active = False
        db.commit()
        return True
    
    def get_featured_vehicles(self, db: Session, limit: int = 4) -> List[Vehicle]:
        """Obtener vehículos destacados"""
        return db.query(Vehicle).filter(
            Vehicle.is_active == True,
            Vehicle.is_featured == True
        ).limit(limit).all()
    
    def get_vehicle_stats(self, db: Session) -> dict:
        """Obtener estadísticas de vehículos"""
        total = db.query(Vehicle).filter(Vehicle.is_active == True).count()
        available = db.query(Vehicle).filter(
            Vehicle.is_active == True,
            Vehicle.status == "Disponible"
        ).count()
        reserved = db.query(Vehicle).filter(
            Vehicle.is_active == True,
            Vehicle.status == "Reservado"
        ).count()
        sold = db.query(Vehicle).filter(
            Vehicle.is_active == True,
            Vehicle.status == "Vendido"
        ).count()
        featured = db.query(Vehicle).filter(
            Vehicle.is_active == True,
            Vehicle.is_featured == True
        ).count()
        
        return {
            "total": total,
            "available": available,
            "reserved": reserved,
            "sold": sold,
            "featured": featured
        }

# Instancia global del CRUD
vehicle_crud = VehicleCRUD()