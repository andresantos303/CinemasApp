from fastapi import FastAPI
from dotenv import load_dotenv
from app.routes import router
from app.database import connect_to_mongo, close_mongo_connection
from app.logger import configure_logger, logger
import os
from contextlib import asynccontextmanager # Adicionar esta importação

load_dotenv()

# Configurar logs
configure_logger()

# Definir o ciclo de vida (substitui as funções antigas)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Ligar à Base de Dados (Arranque)
    await connect_to_mongo()
    port = os.getenv("PORT")
    logger.info("msg", text=f"Products microservice running on port {port}")
    logger.info("msg", text="Docs available at http://localhost/api/products/docs")
    
    yield # O serviço fica a correr
    
    # 2. Desligar a Base de Dados (Encerramento)
    await close_mongo_connection()

# Atualizar a configuração da aplicação
app = FastAPI(
    title="Products Service (POS & Stock)",
    description="API de Gestão de Produtos, Stock e Vendas",
    version="1.0.0",
    root_path="/api/products",
    lifespan=lifespan # Injetar o novo gestor de eventos
)

# Registar Rotas
app.include_router(router)

@app.get("/")
async def root():
    logger.info("Health check endpoint called")
    return {"message": "Products Service is running"}

if __name__ == "__main__":
    import uvicorn
    # log_config=None impede que o uvicorn sobrescreva as nossas cores
    uvicorn.run("app.main:app", host="0.0.0.0", port=3004, reload=True, log_config=None)