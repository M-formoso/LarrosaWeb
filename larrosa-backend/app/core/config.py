from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Proyecto
    PROJECT_NAME: str = "Larrosa Camiones API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Sistema de gestión para Larrosa Camiones"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://localhost"]
    
    # File Upload
    UPLOAD_DIR: str = "static/uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp"]
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # AWS S3 (opcional)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = ""
    AWS_REGION: str = "us-east-1"
    
    # Redis (opcional)
    REDIS_URL: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Crear instancia global
settings = Settings()

# Crear directorio de uploads si no existe
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(f"{settings.UPLOAD_DIR}/vehicles", exist_ok=True)