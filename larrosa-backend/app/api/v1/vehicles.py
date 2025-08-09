from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.vehicle import vehicle_crud
from app.services.image_service import image_service
from app.schemas.vehicle import Vehicle, VehicleCreate, VehicleUpdate, VehicleListResponse, VehicleStats
from app.models.user import User
import json

router = APIRouter()

@router.get("/", response_model=VehicleListResponse)
def get_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    search: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    year_min: Optional[int] = Query(None),
    year_max: Optional[int] = Query(None),
    km_min: Optional[int] = Query(None),
    km_max: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    is_featured: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener lista de vehículos con filtros"""
    
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
    
    return VehicleListResponse(
        vehicles=vehicles,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/featured", response_model=List[Vehicle])
def get_featured_vehicles(
    limit: int = Query(4, le=10),
    db: Session = Depends(get_db)
):
    """Obtener vehículos destacados"""
    return vehicle_crud.get_featured_vehicles(db=db, limit=limit)

@router.get("/stats", response_model=VehicleStats)
def get_vehicle_stats(db: Session = Depends(get_db)):
    """Obtener estadísticas de vehículos"""
    stats = vehicle_crud.get_vehicle_stats(db=db)
    return VehicleStats(**stats)

@router.get("/{vehicle_id}", response_model=Vehicle)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Obtener vehículo por ID"""
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return vehicle

@router.post("/", response_model=Vehicle)
async def create_vehicle(
    # Datos del vehículo como JSON string
    vehicle_data: str = Form(...),
    # Imágenes opcionales
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    # TODO: Agregar autenticación
    # current_user: User = Depends(get_current_user)
):
    """Crear nuevo vehículo con imágenes"""
    
    try:
        # Parsear datos del vehículo
        vehicle_dict = json.loads(vehicle_data)
        vehicle = VehicleCreate(**vehicle_dict)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Datos de vehículo inválidos")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en validación: {str(e)}")
    
    # TODO: Usar current_user.id cuando tengamos autenticación
    created_by = 1  # Temporal
    
    # Crear vehículo
    db_vehicle = vehicle_crud.create_vehicle(
        db=db, 
        vehicle=vehicle, 
        created_by=created_by
    )
    
    # Subir imágenes si las hay
    if images and images[0].filename:  # Verificar que no sea una lista vacía
        try:
            await image_service.save_vehicle_images(
                db=db,
                vehicle_id=db_vehicle.id,
                files=images,
                user_id=created_by
            )
            # Refrescar para obtener las imágenes
            db.refresh(db_vehicle)
        except Exception as e:
            print(f"Error subiendo imágenes: {str(e)}")
            # No fallar por las imágenes, solo loggear
    
    return db_vehicle

@router.put("/{vehicle_id}", response_model=Vehicle)
def update_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    db: Session = Depends(get_db),
    # TODO: Agregar autenticación
    # current_user: User = Depends(get_current_user)
):
    """Actualizar vehículo"""
    db_vehicle = vehicle_crud.update_vehicle(db=db, vehicle_id=vehicle_id, vehicle=vehicle)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return db_vehicle

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    # TODO: Agregar autenticación
    # current_user: User = Depends(get_current_user)
):
    """Eliminar vehículo"""
    success = vehicle_crud.delete_vehicle(db=db, vehicle_id=vehicle_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return {"message": "Vehículo eliminado correctamente"}

# Rutas para manejo de imágenes
@router.post("/{vehicle_id}/images")
async def upload_vehicle_images(
    vehicle_id: int,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    # TODO: Agregar autenticación
    # current_user: User = Depends(get_current_user)
):
    """Subir imágenes a un vehículo existente"""
    
    # Verificar que el vehículo existe
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # TODO: Usar current_user.id cuando tengamos autenticación
    user_id = 1  # Temporal
    
    try:
        saved_images = await image_service.save_vehicle_images(
            db=db,
            vehicle_id=vehicle_id,
            files=images,
            user_id=user_id
        )
        
        return {
            "message": f"Se subieron {len(saved_images)} imágenes correctamente",
            "images": saved_images
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subiendo imágenes: {str(e)}")

@router.delete("/{vehicle_id}/images/{image_id}")
def delete_vehicle_image(
    vehicle_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    # TODO: Agregar autenticación
    # current_user: User = Depends(get_current_user)
):
    """Eliminar imagen de vehículo"""
    
    success = image_service.delete_image(db=db, image_id=image_id)
    if not success:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    return {"message": "Imagen eliminada correctamente"}

@router.put("/{vehicle_id}/images/{image_id}/primary")
def set_primary_image(
    vehicle_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    # TODO: Agregar autenticación
    # current_user: User = Depends(get_current_user)
):
    """Establecer imagen como principal"""
    
    success = image_service.set_primary_image(db=db, vehicle_id=vehicle_id, image_id=image_id)
    if not success:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    return {"message": "Imagen principal actualizada"}

@router.put("/{vehicle_id}/images/reorder")
def reorder_vehicle_images(
    vehicle_id: int,
    image_orders: List[dict],  # [{"image_id": 1, "order": 0}, ...]
    db: Session = Depends(get_db),
    # TODO: Agregar autenticación
    # current_user: User = Depends(get_current_user)
):
    """Reordenar imágenes de vehículo"""
    
    success = image_service.reorder_images(db=db, vehicle_id=vehicle_id, image_orders=image_orders)
    if not success:
        raise HTTPException(status_code=400, detail="Error reordenando imágenes")
    
    return {"message": "Imágenes reordenadas correctamente"}

@router.get("/{vehicle_id}/images")
def get_vehicle_images(
    vehicle_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todas las imágenes de un vehículo"""
    
    # Verificar que el vehículo existe
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    images = image_service.get_vehicle_images(db=db, vehicle_id=vehicle_id)
    return images

@router.get("/{vehicle_id}/images")
def get_vehicle_images(
    vehicle_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todas las imágenes de un vehículo"""
    
    # Verificar que el vehículo existe
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    images = image_service.get_vehicle_images(db=db, vehicle_id=vehicle_id)
    return images

# === ENDPOINTS PARA EL PANEL DE ADMINISTRACIÓN ===

@router.get("/admin/all")
def get_all_vehicles_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # TODO: Agregar autenticación de admin
    # current_user: User = Depends(get_current_superuser)
):
    """Obtener todos los vehículos para el panel de administración"""
    
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
    
    return {
        "vehicles": vehicles,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/admin/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    # TODO: Agregar autenticación de admin
    # current_user: User = Depends(get_current_superuser)
):
    """Obtener estadísticas para el dashboard de administración"""
    
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
    # TODO: Agregar autenticación de admin
    # current_user: User = Depends(get_current_superuser)
):
    """Alternar estado destacado de un vehículo"""
    
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
    
    return {
        "message": f"Vehículo {'marcado como destacado' if new_featured else 'desmarcado como destacado'}",
        "is_featured": new_featured,
        "vehicle": updated_vehicle
    }