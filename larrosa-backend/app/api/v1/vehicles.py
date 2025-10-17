# app/api/v1/vehicles.py - RUTAS DE VEHÍCULOS CORREGIDAS

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user, get_current_active_user, get_current_superuser
from app.crud.vehicle import vehicle_crud
from app.services.image_service import image_service
from app.schemas.vehicle import (
    Vehicle, VehicleCreate, VehicleUpdate, 
    VehicleListResponse, VehicleStats
)
from app.models.user import User
import json
from datetime import datetime

router = APIRouter()

# ===== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) =====

@router.get("/", response_model=VehicleListResponse)
def get_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    search: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None, alias="type"),
    brand: Optional[str] = Query(None),
    year_min: Optional[int] = Query(None),
    year_max: Optional[int] = Query(None),
    km_min: Optional[int] = Query(None),
    km_max: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    is_featured: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener lista de vehículos con filtros - PÚBLICO"""
    
    print(f"🔍 Buscando vehículos: skip={skip}, limit={limit}, search='{search}', type='{vehicle_type}'")
    
    vehicles = vehicle_crud.get_vehicles(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        vehicle_type=vehicle_type,
        brand=brand,
        year_min=year_min,
        year_max=year_max,
        km_min=km_min,
        km_max=km_max,
        status=status,
        is_featured=is_featured
    )
    
    total = vehicle_crud.get_vehicles_count(
        db=db,
        search=search,
        vehicle_type=vehicle_type,
        brand=brand,
        year_min=year_min,
        year_max=year_max,
        km_min=km_min,
        km_max=km_max,
        status=status,
        is_featured=is_featured
    )
    
    print(f"✅ Encontrados {len(vehicles)} vehículos de {total} total")
    
    return VehicleListResponse(
        vehicles=vehicles,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit if limit > 0 else 1
    )

@router.get("/featured", response_model=List[Vehicle])
def get_featured_vehicles(
    limit: int = Query(4, le=10),
    db: Session = Depends(get_db)
):
    """Obtener vehículos destacados - PÚBLICO"""
    print(f"⭐ Obteniendo {limit} vehículos destacados")
    vehicles = vehicle_crud.get_featured_vehicles(db=db, limit=limit)
    print(f"✅ Encontrados {len(vehicles)} vehículos destacados")
    return vehicles

@router.get("/stats", response_model=VehicleStats)
def get_vehicle_stats(db: Session = Depends(get_db)):
    """Obtener estadísticas de vehículos - PÚBLICO"""
    print("📊 Obteniendo estadísticas de vehículos")
    stats = vehicle_crud.get_vehicle_stats(db=db)
    print(f"✅ Stats: {stats}")
    return VehicleStats(**stats)

@router.get("/{vehicle_id}", response_model=Vehicle)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Obtener vehículo por ID - PÚBLICO"""
    print(f"🚛 Obteniendo vehículo ID: {vehicle_id}")
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        print(f"❌ Vehículo {vehicle_id} no encontrado")
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    print(f"✅ Vehículo encontrado: {vehicle.full_name}")
    return vehicle

# ===== RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN) =====

@router.post("/", response_model=Vehicle)
async def create_vehicle(
    # Datos del vehículo como JSON string
    vehicle_data: str = Form(...),
    # Imágenes opcionales
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)  # Solo admin puede crear
):
    """Crear nuevo vehículo con imágenes - REQUIERE ADMIN"""
    
    print(f"🔐 Usuario {current_user.username} creando vehículo")
    
    try:
        # Parsear datos del vehículo
        vehicle_dict = json.loads(vehicle_data)
        vehicle = VehicleCreate(**vehicle_dict)
        print(f"📝 Datos del vehículo: {vehicle.brand} {vehicle.model}")
    except json.JSONDecodeError as e:
        print(f"❌ Error parseando JSON: {e}")
        raise HTTPException(status_code=400, detail="Datos de vehículo inválidos")
    except Exception as e:
        print(f"❌ Error en validación: {e}")
        raise HTTPException(status_code=400, detail=f"Error en validación: {str(e)}")
    
    # Crear vehículo
    try:
        db_vehicle = vehicle_crud.create_vehicle(
            db=db, 
            vehicle=vehicle, 
            created_by=current_user.id
        )
        print(f"✅ Vehículo creado con ID: {db_vehicle.id}")
    except Exception as e:
        print(f"❌ Error creando vehículo: {e}")
        raise HTTPException(status_code=500, detail=f"Error creando vehículo: {str(e)}")
    
    # Subir imágenes si las hay
    if images and len(images) > 0 and images[0].filename:
        try:
            print(f"📸 Subiendo {len(images)} imágenes")
            saved_images = await image_service.save_vehicle_images(
                db=db,
                vehicle_id=db_vehicle.id,
                files=images,
                user_id=current_user.id
            )
            print(f"✅ {len(saved_images)} imágenes guardadas")
            # Refrescar para obtener las imágenes
            db.refresh(db_vehicle)
        except Exception as e:
            print(f"⚠️ Error subiendo imágenes: {str(e)}")
            # No fallar por las imágenes, solo loggear
    
    return db_vehicle

@router.put("/{vehicle_id}", response_model=Vehicle)
def update_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)  # Solo admin puede actualizar
):
    """Actualizar vehículo - REQUIERE ADMIN"""
    
    print(f"🔐 Usuario {current_user.username} actualizando vehículo {vehicle_id}")
    
    db_vehicle = vehicle_crud.update_vehicle(
        db=db, 
        vehicle_id=vehicle_id, 
        vehicle=vehicle
    )
    
    if not db_vehicle:
        print(f"❌ Vehículo {vehicle_id} no encontrado para actualizar")
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    print(f"✅ Vehículo {vehicle_id} actualizado")
    return db_vehicle

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)  # Solo admin puede eliminar
):
    """Eliminar vehículo - REQUIERE ADMIN"""
    
    print(f"🔐 Usuario {current_user.username} eliminando vehículo {vehicle_id}")
    
    success = vehicle_crud.delete_vehicle(db=db, vehicle_id=vehicle_id)
    
    if not success:
        print(f"❌ Vehículo {vehicle_id} no encontrado para eliminar")
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    print(f"✅ Vehículo {vehicle_id} eliminado")
    return {"message": "Vehículo eliminado correctamente"}

# ===== RUTAS DE GESTIÓN DE IMÁGENES =====

@router.post("/{vehicle_id}/images")
async def upload_vehicle_images(
    vehicle_id: int,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Subir imágenes a un vehículo existente - REQUIERE ADMIN"""
    
    print(f"🔐 Usuario {current_user.username} subiendo imágenes a vehículo {vehicle_id}")
    
    # Verificar que el vehículo existe
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    try:
        saved_images = await image_service.save_vehicle_images(
            db=db,
            vehicle_id=vehicle_id,
            files=images,
            user_id=current_user.id
        )
        
        print(f"✅ {len(saved_images)} imágenes subidas")
        
        return {
            "message": f"Se subieron {len(saved_images)} imágenes correctamente",
            "images": saved_images
        }
        
    except Exception as e:
        print(f"❌ Error subiendo imágenes: {e}")
        raise HTTPException(status_code=500, detail=f"Error subiendo imágenes: {str(e)}")

@router.delete("/{vehicle_id}/images/{image_id}")
def delete_vehicle_image(
    vehicle_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Eliminar imagen de vehículo - REQUIERE ADMIN"""
    
    print(f"🔐 Usuario {current_user.username} eliminando imagen {image_id} del vehículo {vehicle_id}")
    
    success = image_service.delete_image(db=db, image_id=image_id)
    if not success:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    print(f"✅ Imagen {image_id} eliminada")
    return {"message": "Imagen eliminada correctamente"}

# ===== RUTAS PARA EL PANEL DE ADMINISTRACIÓN =====

@router.get("/admin/all")
def get_all_vehicles_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Obtener todos los vehículos para el panel de administración - REQUIERE ADMIN"""
    
    print(f"🔐 Usuario {current_user.username} obteniendo vehículos del admin")
    
    vehicles = vehicle_crud.get_vehicles(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        is_featured=None  # Mostrar todos
    )
    
    total = vehicle_crud.get_vehicles_count(
        db=db,
        search=search,
        status=status
    )
    
    print(f"✅ Admin: {len(vehicles)} vehículos de {total} total")
    
    return {
        "vehicles": vehicles,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.get("/admin/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Obtener estadísticas para el dashboard de administración - REQUIERE ADMIN"""
    
    print(f"🔐 Usuario {current_user.username} obteniendo stats del dashboard")
    
    stats = vehicle_crud.get_vehicle_stats(db=db)
    
    # Agregar estadísticas adicionales
    recent_vehicles = vehicle_crud.get_vehicles(
        db=db, 
        skip=0, 
        limit=5,
        search=None
    )
    
    return {
        "stats": stats,
        "recent_vehicles": recent_vehicles
    }

@router.patch("/{vehicle_id}/toggle-featured")
def toggle_vehicle_featured(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Alternar estado destacado de un vehículo - REQUIERE ADMIN"""
    
    print(f"🔐 Usuario {current_user.username} cambiando estado destacado del vehículo {vehicle_id}")
    
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Alternar el estado
    new_featured = not vehicle.is_featured
    updated_vehicle = vehicle_crud.update_vehicle(
        db=db,
        vehicle_id=vehicle_id,
        vehicle={"is_featured": new_featured}
    )
    
    status_text = "destacado" if new_featured else "normal"
    print(f"✅ Vehículo {vehicle_id} marcado como {status_text}")
    
    return {
        "message": f"Vehículo marcado como {status_text}",
        "is_featured": new_featured,
        "vehicle_id": vehicle_id
    }

# ===== ENDPOINT DE TESTING =====

@router.post("/test-create", response_model=Vehicle)
def create_test_vehicle(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Crear vehículo de prueba rápido - SOLO PARA TESTING"""
    
    print(f"🔐 Usuario {current_user.username} creando vehículo de prueba")
    
    from datetime import datetime
    
    test_vehicle_data = VehicleCreate(
        brand="Scania",
        model=f"R450 Test {datetime.now().strftime('%H%M%S')}",
        full_name=f"Scania R450 Test {datetime.now().strftime('%H:%M:%S')}",
        type="camion-tractor",
        type_name="Camión Tractor",
        year=2021,
        kilometers=350000,
        power=450,
        traccion="6x2",
        transmission="Manual",
        color="Blanco",
        status="Disponible",
        price=65000.00,
        is_featured=True,
        location="Villa María, Córdoba",
        description="Vehículo de prueba creado desde el panel de administración",
        observations="Testing - Sistema Larrosa Camiones",
        date_registered=datetime.now().strftime("%d/%m/%Y")
    )
    
    try:
        db_vehicle = vehicle_crud.create_vehicle(
            db=db,
            vehicle=test_vehicle_data,
            created_by=current_user.id
        )
        
        print(f"✅ Vehículo de prueba creado: {db_vehicle.full_name}")
        
        return db_vehicle
        
    except Exception as e:
        print(f"❌ Error creando vehículo de prueba: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ===== ENDPOINT DE DEBUG =====

@router.get("/debug/info")
def debug_vehicles_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Información de debug sobre vehículos - SOLO ADMIN"""
    
    total_vehicles = db.query(vehicle_crud.Vehicle).count()
    active_vehicles = db.query(vehicle_crud.Vehicle).filter(vehicle_crud.Vehicle.is_active == True).count()
    featured_vehicles = db.query(vehicle_crud.Vehicle).filter(vehicle_crud.Vehicle.is_featured == True).count()
    
    # Últimos 5 vehículos
    recent = db.query(vehicle_crud.Vehicle).order_by(vehicle_crud.Vehicle.created_at.desc()).limit(5).all()
    
    return {
        "total_vehicles": total_vehicles,
        "active_vehicles": active_vehicles,
        "featured_vehicles": featured_vehicles,
        "recent_vehicles": [
            {
                "id": v.id,
                "full_name": v.full_name,
                "created_at": v.created_at,
                "is_featured": v.is_featured,
                "status": v.status
            }
            for v in recent
        ]
    }

@router.get("/debug/vehicle/{vehicle_id}")
def debug_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db)
):
    """Debug: Ver datos completos de un vehículo"""
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    return {
        "id": vehicle.id,
        "full_name": vehicle.full_name,
        "brand": vehicle.brand,
        "model": vehicle.model,
        "year": vehicle.year,
        "color": vehicle.color,
        "price": vehicle.price,
        "kilometers": vehicle.kilometers,
        "transmission": vehicle.transmission,
        "type": vehicle.type,
        "type_name": vehicle.type_name,
        "traccion": vehicle.traccion,
        "status": vehicle.status,
        "is_featured": vehicle.is_featured,
        "images_count": len(vehicle.images) if vehicle.images else 0
    }

test_vehicle_data = VehicleCreate(
    brand="Scania",
    model=f"R450 Test {datetime.now().strftime('%H%M%S')}",
    full_name=f"Scania R450 Test {datetime.now().strftime('%H:%M:%S')}",
    type="camion-tractor",
    type_name="Camión Tractor",
    year=2021,
    kilometers=350000,
    power=450,
    traccion="6x2",
    transmission="Manual",
    color="Blanco",  # ✅ AÑADIDO
    status="Disponible",
    price=54500.00,  # ✅ AÑADIDO
    is_featured=True,
    location="Villa María, Córdoba",
    description="Vehículo de prueba",
    observations="Testing",
    date_registered=datetime.now().strftime("%d/%m/%Y")
)