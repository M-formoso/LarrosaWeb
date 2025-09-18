# app/services/image_service.py - VERSIÓN CORREGIDA

import os
import uuid
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from PIL import Image
from sqlalchemy.orm import Session
from app.models.vehicle import VehicleImage
from app.core.config import settings
import aiofiles
import logging

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = settings.ALLOWED_EXTENSIONS
        
        # Crear directorios si no existen
        self.ensure_directories()
    
    def ensure_directories(self):
        """Crear todos los directorios necesarios"""
        directories = [
            self.upload_dir,
            f"{self.upload_dir}/vehicles",
            f"{self.upload_dir}/vehicles/thumbnails"
        ]
        
        for directory in directories:
            if not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
                logger.info(f"📁 Directory created: {directory}")
            else:
                logger.info(f"📁 Directory exists: {directory}")
    
    def validate_image(self, file: UploadFile) -> bool:
        """Validar imagen antes de subir"""
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
            
        # Verificar extensión
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in self.allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Formato de archivo no permitido. Formatos válidos: {', '.join(self.allowed_extensions)}"
            )
        
        # Verificar tipo MIME
        if not file.content_type or not file.content_type.startswith('image/'):
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
        
        # RUTAS CORREGIDAS - sin duplicar 'static'
        original_path = f"{self.upload_dir}/vehicles/{unique_filename}"
        thumbnail_path = f"{self.upload_dir}/vehicles/thumbnails/{unique_filename}"
        
        logger.info(f"💾 Saving image to: {original_path}")
        logger.info(f"🖼️ Creating thumbnail at: {thumbnail_path}")
        
        try:
            # Leer contenido del archivo
            content = await file.read()
            
            if len(content) > self.max_file_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"Archivo demasiado grande. Máximo: {self.max_file_size} bytes"
                )
            
            # Guardar archivo original
            async with aiofiles.open(original_path, 'wb') as buffer:
                await buffer.write(content)
            
            logger.info(f"✅ Image saved: {original_path}")
            
            # Crear thumbnail
            with Image.open(original_path) as img:
                # Obtener dimensiones originales
                width, height = img.size
                logger.info(f"📏 Original dimensions: {width}x{height}")
                
                # Crear thumbnail
                img.thumbnail((400, 300), Image.Resampling.LANCZOS)
                img.save(thumbnail_path, quality=85, optimize=True)
                logger.info(f"✅ Thumbnail created: {thumbnail_path}")
            
            # RETURN CON RUTAS CORRECTAS
            return {
                "filename": unique_filename,
                "original_filename": file.filename,
                "file_path": f"static/uploads/vehicles/{unique_filename}",  # RUTA RELATIVA CORRECTA
                "thumbnail_path": f"static/uploads/vehicles/thumbnails/{unique_filename}",
                "file_size": len(content),
                "mime_type": file.content_type,
                "width": width,
                "height": height
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing image: {str(e)}")
            
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
        
        logger.info(f"📸 Saving {len(files)} images for vehicle {vehicle_id}")
        
        for i, file in enumerate(files):
            try:
                # Verificar que el archivo tenga nombre
                if not file.filename:
                    logger.warning(f"⚠️ Skipping file without filename")
                    continue
                
                logger.info(f"📷 Processing image {i+1}: {file.filename}")
                
                # Guardar imagen física
                image_data = await self.save_image(file, vehicle_id)
                
                # Crear registro en BD
                db_image = VehicleImage(
                    vehicle_id=vehicle_id,
                    filename=image_data["filename"],
                    original_filename=image_data["original_filename"],
                    file_path=image_data["file_path"],  # RUTA CORREGIDA
                    file_size=image_data["file_size"],
                    mime_type=image_data["mime_type"],
                    width=image_data["width"],
                    height=image_data["height"],
                    is_primary=(i == 0),  # Primera imagen como principal
                    display_order=i
                )
                
                db.add(db_image)
                saved_images.append(db_image)
                
                # LOG DETALLADO PARA DEBUG
                logger.info(f"🗄️ Database entry: vehicle_id={vehicle_id}, filename={db_image.filename}, file_path={db_image.file_path}")
                
                # GENERAR Y LOGGEAR URL
                url = f"http://localhost:8000/{image_data['file_path']}"
                logger.info(f"🌐 URL: {url}")
                
            except Exception as e:
                logger.error(f"❌ Error guardando imagen {file.filename}: {str(e)}")
                continue
        
        if saved_images:
            try:
                db.commit()
                logger.info(f"✅ Committed {len(saved_images)} images to database")
                
                # Refrescar objetos
                for img in saved_images:
                    db.refresh(img)
                    
            except Exception as e:
                logger.error(f"❌ Error committing to database: {str(e)}")
                db.rollback()
                raise HTTPException(
                    status_code=500,
                    detail=f"Error guardando en base de datos: {str(e)}"
                )
        
        return saved_images
    
    def delete_image(self, db: Session, image_id: int) -> bool:
        """Eliminar imagen física y registro"""
        db_image = db.query(VehicleImage).filter(VehicleImage.id == image_id).first()
        if not db_image:
            return False
        
        try:
            # Construir rutas de archivos físicos
            original_path = db_image.file_path
            if not original_path.startswith('/'):
                original_path = original_path
            
            thumbnail_path = original_path.replace('/vehicles/', '/vehicles/thumbnails/')
            
            # Eliminar archivos físicos
            if os.path.exists(original_path):
                os.remove(original_path)
                logger.info(f"🗑️ Deleted original: {original_path}")
            
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
                logger.info(f"🗑️ Deleted thumbnail: {thumbnail_path}")
            
            # Eliminar registro
            db.delete(db_image)
            db.commit()
            
            logger.info(f"✅ Image {image_id} deleted successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error eliminando imagen: {str(e)}")
            db.rollback()
            return False
    
    def set_primary_image(self, db: Session, vehicle_id: int, image_id: int) -> bool:
        """Establecer imagen como principal"""
        try:
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
            logger.info(f"✅ Set image {image_id} as primary for vehicle {vehicle_id}")
            return result > 0
            
        except Exception as e:
            logger.error(f"❌ Error setting primary image: {str(e)}")
            db.rollback()
            return False
    
    def reorder_images(self, db: Session, vehicle_id: int, image_orders: List[dict]) -> bool:
        """Reordenar imágenes de un vehículo"""
        try:
            for item in image_orders:
                db.query(VehicleImage).filter(
                    VehicleImage.id == item["image_id"],
                    VehicleImage.vehicle_id == vehicle_id
                ).update({"display_order": item["order"]})
            
            db.commit()
            logger.info(f"✅ Reordered {len(image_orders)} images for vehicle {vehicle_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error reordenando imágenes: {str(e)}")
            db.rollback()
            return False
    
    def get_vehicle_images(self, db: Session, vehicle_id: int) -> List[VehicleImage]:
        """Obtener todas las imágenes de un vehículo"""
        images = db.query(VehicleImage).filter(
            VehicleImage.vehicle_id == vehicle_id
        ).order_by(VehicleImage.display_order).all()
        
        logger.info(f"📋 Found {len(images)} images for vehicle {vehicle_id}")
        for img in images:
            logger.info(f"   📷 {img.filename} -> {img.file_path}")
        
        return images

# Instancia global del servicio
image_service = ImageService()