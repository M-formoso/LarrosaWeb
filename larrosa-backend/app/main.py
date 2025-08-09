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

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        "docs": "/api/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

# Ruta para servir el panel de administración
@app.get("/admin/{path:path}")
async def serve_admin(path: str = ""):
    """Servir archivos del panel de administración"""
    return {"message": "Panel de administración - Por implementar"}