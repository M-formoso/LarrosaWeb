from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime

# Schemas para imágenes de vehículos
class VehicleImageBase(BaseModel):
    alt_text: Optional[str] = None
    is_primary: bool = False
    display_order: int = 0

class VehicleImageCreate(VehicleImageBase):
    pass

class VehicleImage(VehicleImageBase):
    id: int
    vehicle_id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: Optional[int]
    mime_type: Optional[str]
    width: Optional[int]
    height: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schemas para vehículos
class VehicleBase(BaseModel):
    brand: str
    model: str
    full_name: str
    type: str
    type_name: str
    year: int
    kilometers: int
    power: Optional[int] = None
    traccion: Optional[str] = None
    transmission: Optional[str] = None
    color: Optional[str] = None
    status: str = "Disponible"
    price: Optional[float] = None
    is_featured: bool = False
    location: str = "Villa María, Córdoba"
    description: Optional[str] = None
    observations: Optional[str] = None
    date_registered: Optional[str] = None

    @validator('year')
    def validate_year(cls, v):
        current_year = datetime.now().year
        if v < 1990 or v > current_year + 1:
            raise ValueError(f'Año debe estar entre 1990 y {current_year + 1}')
        return v

    @validator('kilometers')
    def validate_kilometers(cls, v):
        if v < 0:
            raise ValueError('Kilómetros no puede ser negativo')
        return v

    @validator('power')
    def validate_power(cls, v):
        if v is not None and v < 0:
            raise ValueError('Potencia no puede ser negativa')
        return v

    @validator('price')
    def validate_price(cls, v):
        if v is not None and v < 0:
            raise ValueError('Precio no puede ser negativo')
        return v

class VehicleCreate(VehicleBase):
        color: str = "Blanco"  # Valor por defecto


class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    full_name: Optional[str] = None
    type: Optional[str] = None
    type_name: Optional[str] = None
    year: Optional[int] = None
    kilometers: Optional[int] = None
    power: Optional[int] = None
    traccion: Optional[str] = None
    transmission: Optional[str] = None
    color: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    is_featured: Optional[bool] = None
    location: Optional[str] = None
    description: Optional[str] = None
    observations: Optional[str] = None
    date_registered: Optional[str] = None
    is_active: Optional[bool] = None

class Vehicle(VehicleBase):
    id: int
    is_active: bool
    date_added: datetime
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[int]
    images: List[VehicleImage] = []
    
    class Config:
        from_attributes = True

# Schema para respuesta de lista de vehículos
class VehicleListResponse(BaseModel):
    vehicles: List[Vehicle]
    total: int
    page: int
    size: int
    pages: int

# Schema para estadísticas
class VehicleStats(BaseModel):
    total: int
    available: int
    reserved: int
    sold: int
    featured: int