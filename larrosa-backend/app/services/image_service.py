import os
import uuid
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from PIL import Image
from sqlalchemy.orm import Session
from app.models.vehicle import VehicleImage
from app.core.config import settings
import aiofiles

class ImageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = settings.ALLOWED_EXTENSIONS
        
        # Crear directorios si no existen
        os.makedirs(f"{self.upload_dir}/vehicles", exist_ok=True)
        os.makedirs(f"{self.upload_dir}/vehicles/thumbnails", exist_ok=True)
    
    def validate_image(self, file: UploadFile) -> bool:
        """Validar imagen antes de subir"""
        # Verificar extensión
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in self.allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Formato de archivo no permitido. Formatos válidos: {', '.join(self.allowed_extensions)}"
            )
        
        # Verificar tipo MIME
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="El archivo debe ser una imagen"
            )
        
        return True
    
    async def save_image(self, file: UploadFile, vehicle_id: int) -> dict:
        """Guardar imagen y crear thumbnail"""
        self.validate_image(file)
        
        # Generar nombre único
        file_extension = file.filename.split('.')[-1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Rutas de archivos
        original_path = f"{self.upload_dir}/vehicles/{unique_filename}"
        thumbnail_path = f"{self.upload_dir}/vehicles/thumbnails/{unique_filename}"
        
        try:
            # Guardar archivo original
            async with aiofiles.open(original_path, 'wb') as buffer:
                content = await file.read()
                await buffer.write(content)
            
            # Crear thumbnail
            with Image.open(original_path) as img:
                # Obtener dimensiones originales
                width, height = img.size
                
                # Crear thumbnail
                img.thumbnail((400, 300), Image.Resampling.LANCZOS)
                img.save(thumbnail_path, quality=85, optimize=True)
            
            return {
                "filename": unique_filename,
                "original_filename": file.filename,
                "file_path": original_path,
                "thumbnail_path": thumbnail_path,
                "file_size": len(content),
                "mime_type": file.content_type,
                "width": width,
                "height": height
            }
            
        except Exception as e:
            # Limpiar archivos si algo sale mal
            if os.path.exists(original_path):
                os.remove(original_path)
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
            
            raise HTTPException(
                status_code=500,
                detail=f"Error al procesar la imagen: {str(e)}"
            )
    
    async def save_vehicle_images(
        self, 
        db: Session, 
        vehicle_id: int, 
        files: List[UploadFile],
        user_id: int
    ) -> List[VehicleImage]:
        """Guardar múltiples imágenes para un vehículo"""
        saved_images = []
        
        for i, file in enumerate(files):
            try:
                # Guardar imagen física
                image_data = await self.save_image(file, vehicle_id)
                
                # Crear registro en BD
                db_image = VehicleImage(
                    vehicle_id=vehicle_id,
                    filename=image_data["filename"],
                    original_filename=image_data["original_filename"],
                    file_path=image_data["file_path"],
                    file_size=image_data["file_size"],
                    mime_type=image_data["mime_type"],
                    width=image_data["width"],
                    height=image_data["height"],
                    is_primary=(i == 0),  # Primera imagen como principal
                    display_order=i
                )
                
                db.add(db_image)
                saved_images.append(db_image)
                
            except Exception as e:
                # Si falla una imagen, continuar con las demás
                print(f"Error guardando imagen {file.filename}: {str(e)}")
                continue
        
        db.commit()
        
        # Refrescar objetos
        for img in saved_images:
            db.refresh(img)
        
        return saved_images
    
    def delete_image(self, db: Session, image_id: int) -> bool:
        """Eliminar imagen física y registro"""
        db_image = db.query(VehicleImage).filter(VehicleImage.id == image_id).first()
        if not db_image:
            return False
        
        try:
            # Eliminar archivos físicos
            if os.path.exists(db_image.file_path):
                os.remove(db_image.file_path)
            
            thumbnail_path = db_image.file_path.replace('/vehicles/', '/vehicles/thumbnails/')
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
            
            # Eliminar registro
            db.delete(db_image)
            db.commit()
            
            return True
            
        except Exception as e:
            print(f"Error eliminando imagen: {str(e)}")
            return False
    
    def set_primary_image(self, db: Session, vehicle_id: int, image_id: int) -> bool:
        """Establecer imagen como principal"""
        # Quitar primary de todas las imágenes del vehículo
        db.query(VehicleImage).filter(
            VehicleImage.vehicle_id == vehicle_id
        ).update({"is_primary": False})
        
        # Establecer nueva imagen principal
        result = db.query(VehicleImage).filter(
            VehicleImage.id == image_id,
            VehicleImage.vehicle_id == vehicle_id
        ).update({"is_primary": True})
        
        db.commit()
        return result > 0
    
    def reorder_images(self, db: Session, vehicle_id: int, image_orders: List[dict]) -> bool:
        """Reordenar imágenes de un vehículo"""
        try:
            for item in image_orders:
                db.query(VehicleImage).filter(
                    VehicleImage.id == item["image_id"],
                    VehicleImage.vehicle_id == vehicle_id
                ).update({"display_order": item["order"]})
            
            db.commit()
            return True
            
        except Exception as e:
            print(f"Error reordenando imágenes: {str(e)}")
            return False
    
    def get_vehicle_images(self, db: Session, vehicle_id: int) -> List[VehicleImage]:
        """Obtener todas las imágenes de un vehículo"""
        return db.query(VehicleImage).filter(
            VehicleImage.vehicle_id == vehicle_id
        ).order_by(VehicleImage.display_order).all()

# Instancia global del servicio
image_service = ImageService()