# app/main.py - ACTUALIZADO CON CORS CORREGIDO

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1 import auth, vehicles
import os

# Crear la aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configurar CORS - ACTUALIZADO
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

# Montar archivos estáticos
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

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
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
        "cors_enabled": True
    }

# Middleware para debugging CORS en desarrollo
@app.middleware("http")
async def cors_debug_middleware(request, call_next):
    if settings.ENVIRONMENT == "development":
        print(f"🌐 Request from: {request.headers.get('origin', 'No origin')}")
        print(f"🌐 Method: {request.method}")
        print(f"🌐 URL: {request.url}")
    
    response = await call_next(request)
    
    if settings.ENVIRONMENT == "development":
        print(f"🌐 Response status: {response.status_code}")
    
    return response

# Ruta para servir el panel de administración
@app.get("/admin/{path:path}")
async def serve_admin(path: str = ""):
    """Servir archivos del panel de administración"""
    return {"message": "Panel de administración - Por implementar"}