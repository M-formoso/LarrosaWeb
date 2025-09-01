# app/core/security.py - FUNCIONES DE SEGURIDAD CORREGIDAS

from datetime import datetime, timedelta
from typing import Optional, Union, Any, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Configurar contexto de passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None
) -> str:
    """Crear token de acceso JWT"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Datos del token
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.utcnow(),
        "type": "access_token"
    }
    
    # Codificar JWT
    try:
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM
        )
        print(f"🔐 Token creado para: {subject}")
        return encoded_jwt
    except Exception as e:
        print(f"❌ Error creando token: {e}")
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar password"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"❌ Error verificando password: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hashear password"""
    try:
        return pwd_context.hash(password)
    except Exception as e:
        print(f"❌ Error hasheando password: {e}")
        raise

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verificar y decodificar token JWT"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Verificar que el token no haya expirado
        exp = payload.get("exp")
        if exp and datetime.utcnow() > datetime.fromtimestamp(exp):
            print(f"⏰ Token expirado")
            return None
        
        # Verificar que tenga la información necesaria
        username = payload.get("sub")
        if not username:
            print(f"❌ Token sin información de usuario")
            return None
        
        print(f"✅ Token válido para: {username}")
        return payload
        
    except JWTError as e:
        print(f"❌ Error JWT: {e}")
        return None
    except Exception as e:
        print(f"❌ Error verificando token: {e}")
        return None

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodificar token sin verificar expiración (para debugging)"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": False}
        )
        return payload
    except Exception as e:
        print(f"❌ Error decodificando token: {e}")
        return None

def create_refresh_token(subject: Union[str, Any]) -> str:
    """Crear token de refresh"""
    expire = datetime.utcnow() + timedelta(days=7)  # 7 días para refresh
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.utcnow(),
        "type": "refresh_token"
    }
    
    try:
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        print(f"❌ Error creando refresh token: {e}")
        raise

def is_token_expired(token: str) -> bool:
    """Verificar si un token está expirado"""
    try:
        payload = decode_token(token)
        if not payload:
            return True
        
        exp = payload.get("exp")
        if not exp:
            return True
        
        return datetime.utcnow() > datetime.fromtimestamp(exp)
    except Exception:
        return True

def get_token_remaining_time(token: str) -> Optional[timedelta]:
    """Obtener tiempo restante del token"""
    try:
        payload = decode_token(token)
        if not payload:
            return None
        
        exp = payload.get("exp")
        if not exp:
            return None
        
        exp_datetime = datetime.fromtimestamp(exp)
        now = datetime.utcnow()
        
        if exp_datetime > now:
            return exp_datetime - now
        else:
            return timedelta(0)  # Expirado
    except Exception:
        return None