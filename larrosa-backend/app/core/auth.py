from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import auth_service
from app.models.user import User

# Configurar esquema de seguridad
security = HTTPBearer()

class AuthMiddleware:
    def __init__(self):
        self.auth_service = auth_service

# Dependencias de autenticación
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependencia para obtener el usuario actual autenticado
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verificar token
        token_data = auth_service.verify_token(credentials.credentials)
        if token_data is None:
            raise credentials_exception
        
        username = token_data.get("username")
        if username is None:
            raise credentials_exception
            
    except Exception:
        raise credentials_exception
    
    # Obtener usuario de la base de datos
    user = auth_service.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependencia para obtener usuario activo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return current_user

async def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependencia para verificar que el usuario sea superusuario
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes"
        )
    return current_user

# Dependencia opcional (para endpoints que pueden funcionar con o sin auth)
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dependencia opcional para obtener usuario si está autenticado
    """
    if credentials is None:
        return None
    
    try:
        token_data = auth_service.verify_token(credentials.credentials)
        if token_data is None:
            return None
        
        username = token_data.get("username")
        if username is None:
            return None
        
        user = auth_service.get_user_by_username(db, username=username)
        if user is None or not user.is_active:
            return None
        
        return user
        
    except Exception:
        return None

# Funciones de validación de permisos
def check_user_permissions(current_user: User, target_user_id: int) -> bool:
    """
    Verificar si el usuario actual puede modificar el usuario objetivo
    """
    # Superuser puede modificar cualquier usuario
    if current_user.is_superuser:
        return True
    
    # Usuario solo puede modificar sus propios datos
    return current_user.id == target_user_id

def check_vehicle_permissions(current_user: User, vehicle_owner_id: Optional[int] = None) -> bool:
    """
    Verificar permisos para modificar vehículos
    """
    # Superuser puede modificar cualquier vehículo
    if current_user.is_superuser:
        return True
    
    # Si no hay owner específico, solo superuser puede crear
    if vehicle_owner_id is None:
        return current_user.is_superuser
    
    # Usuario puede modificar sus propios vehículos
    return current_user.id == vehicle_owner_id