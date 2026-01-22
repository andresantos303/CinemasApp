import os
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.logger import logger

# Isto garante que o botão "Authorize" aparece no Swagger
security = HTTPBearer()

def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    secret = os.getenv("JWT_SECRET")

    try:
        # 1. Descodificar o token
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        
        # 2. Verificar se é Admin
        user_type = payload.get("type")
        user_id = payload.get("id")

        if user_type != "admin":
            logger.warn("msg", text="Acesso negado: Requer Admin", user_id=user_id)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: Requer privilégios de Admin"
            )

        # 3. Retornar o ID do utilizador (para usar na rota se necessário)
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    except Exception as e:
        logger.error("msg", text="Erro na autenticação", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar as credenciais"
        )