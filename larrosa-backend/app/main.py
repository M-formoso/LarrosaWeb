# app/main.py - VERSIÓN CORREGIDA PARA SERVIR IMÁGENES

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.api.v1 import auth, vehicles
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear la aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:5500",  # Live Server
        "http://localhost:5500",   # Live Server  
        "http://127.0.0.1:5501",  # Live Server alternativo
        "http://localhost:5501",   # Live Server alternativo
        "*"  # TEMPORAL - para desarrollo únicamente
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# CREAR DIRECTORIOS NECESARIOS AL INICIO
def ensure_directories():
    """Crear directorios necesarios para archivos estáticos"""
    directories = [
        "static",
        "static/uploads", 
        "static/uploads/vehicles",
        "static/uploads/vehicles/thumbnails"
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            logger.info(f"📁 Directory created: {directory}")
        else:
            logger.info(f"📁 Directory exists: {directory}")

# Crear directorios al iniciar la aplicación
ensure_directories()

# CONFIGURAR ARCHIVOS ESTÁTICOS CORRECTAMENTE
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    logger.info("✅ Static files mounted at /static")
else:
    logger.error("❌ Static directory not found!")

# RUTA PERSONALIZADA PARA SERVIR IMÁGENES
@app.get("/images/{file_path:path}")
async def serve_images(file_path: str):
    """Servir imágenes con manejo de errores mejorado"""
    
    # Construir la ruta completa del archivo
    full_path = os.path.join("static", "uploads", "vehicles", file_path)
    
    logger.info(f"🖼️ Serving image: {full_path}")
    
    # Verificar que el archivo existe y es un archivo
    if not os.path.exists(full_path):
        logger.error(f"❌ File not found: {full_path}")
        raise HTTPException(status_code=404, detail="Image not found")
    
    if not os.path.isfile(full_path):
        logger.error(f"❌ Path is not a file: {full_path}")
        raise HTTPException(status_code=404, detail="Invalid file path")
    
    # Servir el archivo
    return FileResponse(
        full_path,
        media_type="image/jpeg",  # Ajustar según el tipo de archivo
        headers={"Cache-Control": "max-age=86400"}  # Cache por 24 horas
    )

# RUTA ALTERNATIVA PARA COMPATIBILIDAD
@app.get("/media/{file_path:path}")
async def serve_media(file_path: str):
    """Ruta alternativa para servir medios"""
    return await serve_images(file_path)

@app.get("/uploads/{file_path:path}")
async def serve_uploads(file_path: str):
    """Ruta alternativa para uploads"""
    return await serve_images(file_path)

# INCLUIR LAS RUTAS DE LA API
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(vehicles.router, prefix="/api/v1/vehicles", tags=["vehicles"])

# Rutas básicas
@app.get("/")
async def root():
    return {
        "message": "Larrosa Camiones API",
        "version": settings.VERSION,
        "docs": "/api/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    static_exists = os.path.exists("static")
    uploads_exists = os.path.exists("static/uploads/vehicles")
    
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
        "cors_enabled": True,
        "static_files": {
            "static_dir": static_exists,
            "uploads_dir": uploads_exists,
            "static_path": os.path.abspath("static") if static_exists else "Not found"
        }
    }

# RUTA DE DEBUG PARA LISTAR ARCHIVOS
@app.get("/debug/files")
async def debug_files():
    """Listar archivos en el directorio de uploads para debugging"""
    try:
        uploads_dir = "static/uploads/vehicles"
        if not os.path.exists(uploads_dir):
            return {"error": "Uploads directory not found", "path": uploads_dir}
        
        files = []
        for file in os.listdir(uploads_dir):
            file_path = os.path.join(uploads_dir, file)
            if os.path.isfile(file_path):
                files.append({
                    "name": file,
                    "path": file_path,
                    "size": os.path.getsize(file_path),
                    "url": f"/images/{file}"
                })
        
        return {
            "uploads_directory": uploads_dir,
            "total_files": len(files),
            "files": files[:10]  # Primeros 10 archivos
        }
    except Exception as e:
        return {"error": str(e)}

# Middleware para debugging en desarrollo
@app.middleware("http")
async def debug_middleware(request, call_next):
    if settings.ENVIRONMENT == "development":
        # Log de todas las requests de archivos estáticos
        if "/static/" in str(request.url) or "/images/" in str(request.url):
            logger.info(f"📁 Static request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    if settings.ENVIRONMENT == "development":
        if "/static/" in str(request.url) or "/images/" in str(request.url):
            logger.info(f"📁 Static response: {response.status_code}")
    
    return response