# app/api/v1/auth.py - RUTAS DE AUTENTICACIÓN CORREGIDAS

from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user, get_current_active_user, get_current_superuser
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, Token, UserLogin
from app.core.config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login con OAuth2 (compatible con Swagger UI)
    """
    print(f"🔐 Intento de login OAuth2: {form_data.username}")
    
    # Buscar usuario por username o email
    user = db.query(User).filter(
        (User.username == form_data.username) | (User.email == form_data.username)
    ).first()
    
    if not user:
        print(f"❌ Usuario no encontrado: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar contraseña
    if not verify_password(form_data.password, user.hashed_password):
        print(f"❌ Contraseña incorrecta para: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar que el usuario esté activo
    if not user.is_active:
        print(f"❌ Usuario inactivo: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.username,
        expires_delta=access_token_expires
    )
    
    print(f"✅ Login exitoso para: {user.username}")
    
    # Crear objeto User para respuesta
    user_response = UserSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        created_at=user.created_at
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/login-json", response_model=Token)
def login_json(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login con JSON (para frontend)
    """
    print(f"🔐 Intento de login JSON: {user_credentials.username}")
    
    # Buscar usuario por username o email
    user = db.query(User).filter(
        (User.username == user_credentials.username) | (User.email == user_credentials.username)
    ).first()
    
    if not user:
        print(f"❌ Usuario no encontrado: {user_credentials.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )
    
    # Verificar contraseña
    if not verify_password(user_credentials.password, user.hashed_password):
        print(f"❌ Contraseña incorrecta para: {user_credentials.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )
    
    # Verificar que el usuario esté activo
    if not user.is_active:
        print(f"❌ Usuario inactivo: {user_credentials.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
    # Crear token con información adicional
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.username,
        expires_delta=access_token_expires
    )
    
    print(f"✅ Login exitoso para: {user.username}")
    
    # Crear objeto User para respuesta
    user_response = UserSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        created_at=user.created_at
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.get("/me", response_model=UserSchema)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener información del usuario actual
    """
    return UserSchema(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        created_at=current_user.created_at
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
        "email": current_user.email,
        "is_superuser": current_user.is_superuser,
        "is_active": current_user.is_active
    }

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
    access_token = create_access_token(
        subject=current_user.username,
        expires_delta=access_token_expires
    )
    
    user_response = UserSchema(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        created_at=current_user.created_at
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

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
        "user_id": current_user.id,
        "is_superuser": current_user.is_superuser
    }

# Ruta que requiere permisos de superusuario
@router.get("/admin-only")
def admin_only_route(
    current_user: User = Depends(get_current_superuser)
):
    """
    Ruta solo para administradores
    """
    return {
        "message": "Esta es una ruta solo para administradores",
        "admin": current_user.username,
        "admin_id": current_user.id
    }

@router.post("/register", response_model=UserSchema)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar nuevo usuario (solo para testing - remover en producción)
    """
    # Verificar que no exista el username
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya existe"
        )
    
    # Verificar que no exista el email
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear usuario
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=user_data.is_active,
        is_superuser=False  # Usuarios registrados no son admin por defecto
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserSchema(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        full_name=db_user.full_name,
        is_active=db_user.is_active,
        is_superuser=db_user.is_superuser,
        created_at=db_user.created_at
    )

# Endpoint para debug - solo en desarrollo
@router.get("/debug/users")
def debug_list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    Listar todos los usuarios - solo para debug
    """
    users = db.query(User).all()
    return {
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_superuser": user.is_superuser,
                "created_at": user.created_at
            }
            for user in users
        ],
        "total": len(users)
    }