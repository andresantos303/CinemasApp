from fastapi import FastAPI
from dotenv import load_dotenv
from app.routes import router
from app.database import connect_to_mongo, close_mongo_connection
from app.logger import configure_logger, logger
import os

load_dotenv()

# Configurar logs
configure_logger()

app = FastAPI(
    title="Products Service (POS & Stock)",
    description="API de Gestão de Produtos, Stock e Vendas",
    version="1.0.0"
)

# --- Função personalizada de arranque ---
async def startup_sequence():
    # 1. Ligar à Base de Dados
    await connect_to_mongo()
    
    # 2. Logs visuais (Estilo da imagem)
    port = os.getenv("PORT")
    logger.info(f"Products microservice running on port {port}")
    logger.info(f"Docs available at http://localhost/api/products:{port}/docs")

# Registar Eventos
app.add_event_handler("startup", startup_sequence)
app.add_event_handler("shutdown", close_mongo_connection)

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