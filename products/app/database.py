import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.logger import logger

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    mongo_uri = os.getenv("MONGODB_URI")
    db.client = AsyncIOMotorClient(mongo_uri)
    db.db = db.client.products_db  # Nome da base de dados
    logger.info("msg", text="MongoDB ligado com sucesso (Service: Products)")

async def close_mongo_connection():
    db.client.close()
    logger.info("msg", text="MongoDB desligado")