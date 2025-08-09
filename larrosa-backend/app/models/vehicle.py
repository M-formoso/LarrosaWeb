from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    # ID
    id = Column(Integer, primary_key=True, index=True)
    
    # Información básica
    brand = Column(String(50), nullable=False, index=True)
    model = Column(String(100), nullable=False)
    full_name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False, index=True)  # camion-tractor, camion-chasis, etc.
    type_name = Column(String(100), nullable=False)
    
    # Especificaciones técnicas
    year = Column(Integer, nullable=False, index=True)
    kilometers = Column(Integer, nullable=False)
    power = Column(Integer)  # HP
    traccion = Column(String(10))  # 4x2, 6x2, etc.
    transmission = Column(String(20))  # Manual, Automática
    color = Column(String(50))
    
    # Estado y disponibilidad
    status = Column(String(50), default="Disponible", index=True)
    price = Column(Float)  # Precio opcional
    is_active = Column(Boolean, default=True, index=True)
    is_featured = Column(Boolean, default=False, index=True)
    
    # Ubicación
    location = Column(String(100), default="Villa María, Córdoba")
    
    # Descripción y observaciones
    description = Column(Text)
    observations = Column(Text)
    
    # Metadatos
    date_registered = Column(String(20))  # Fecha de registro como string
    date_added = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relaciones
    images = relationship("VehicleImage", back_populates="vehicle", cascade="all, delete-orphan")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<Vehicle(id={self.id}, full_name='{self.full_name}', year={self.year})>"

class VehicleImage(Base):
    __tablename__ = "vehicle_images"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    width = Column(Integer)
    height = Column(Integer)
    is_primary = Column(Boolean, default=False)
    alt_text = Column(String(255))
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relación
    vehicle = relationship("Vehicle", back_populates="images")
    
    def __repr__(self):
        return f"<VehicleImage(id={self.id}, vehicle_id={self.vehicle_id}, filename='{self.filename}')>"