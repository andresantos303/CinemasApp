from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/products")
def read_products():
    return {"service": "Products", "port": 3004, "status": "active"}