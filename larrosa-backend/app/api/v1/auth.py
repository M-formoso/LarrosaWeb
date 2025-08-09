from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user, get_current_active_user
from app.services.auth_service import auth_service
from app.schemas.user import User, UserCreate, Token, UserLogin
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=User)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar nuevo usuario
    """
    try:
        user = auth_service.create_user(db=db, user=user_data)
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login con OAuth2 (compatible con Swagger UI)
    """
    user = auth_service.authenticate_user(
        db=db, 
        username=form_data.username, 
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    # Actualizar última fecha de login
    auth_service.update_user_last_login(db=db, user_id=user.id)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.post("/login-json", response_model=Token)
def login_json(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login con JSON (para frontend)
    """
    user = auth_service.authenticate_user(
        db=db, 
        username=user_credentials.username, 
        password=user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    # Actualizar última fecha de login
    auth_service.update_user_last_login(db=db, user_id=user.id)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.get("/me", response_model=User)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener información del usuario actual
    """
    return current_user

@router.post("/refresh", response_model=Token)
def refresh_token(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Refrescar token de acceso
    """
    # Crear nuevo token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": current_user.username, "user_id": current_user.id},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=current_user
    )

@router.post("/verify-token")
def verify_token(
    current_user: User = Depends(get_current_active_user)
):
    """
    Verificar si el token es válido
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "username": current_user.username,
        "is_superuser": current_user.is_superuser
    }

@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_active_user)
):
    """
    Logout (en JWT el logout es del lado del cliente)
    """
    return {
        "message": "Logout exitoso",
        "detail": "El token seguirá siendo válido hasta su expiración. "
                 "Asegúrate de eliminarlo del cliente."
    }

# Ruta de prueba que requiere autenticación
@router.get("/protected")
def protected_route(
    current_user: User = Depends(get_current_active_user)
):
    """
    Ruta protegida de ejemplo
    """
    return {
        "message": "Esta es una ruta protegida",
        "user": current_user.username,
        "user_id": current_user.id
    }

# Ruta que requiere permisos de superusuario
@router.get("/admin-only")
def admin_only_route(
    current_user: User = Depends(get_current_active_user)
):
    """
    Ruta solo para administradores
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requieren permisos de administrador."
        )
    
    return {
        "message": "Esta es una ruta solo para administradores",
        "admin": current_user.username
    }