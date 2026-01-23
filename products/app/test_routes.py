import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock, patch
from app.main import app
from app.auth import verify_admin

# 1. Configurar o TestClient (Cliente síncrono para facilitar, o FastAPI trata do async internamente)
client = TestClient(app)

# 2. Mock da autenticação (Dependency Override)
# Isto permite "fingir" que somos admin sem precisar de um token JWT real
async def mock_verify_admin():
    return "admin_test_id"

app.dependency_overrides[verify_admin] = mock_verify_admin

# --- TESTES ---

class TestProducts:
    
    # Teste: Listar Produtos (GET /products)
    @patch("app.routes.db")
    def test_list_products_success(self, mock_db):
        # Preparar dados falsos COMPLETOS (incluindo _id e price)
        fake_products = [
            {
                "_id": "64c3f1e9e8b0a1b2c3d4e5f6", # O ID é obrigatório
                "name": "Pipocas Doces", 
                "category": "Snacks", 
                "stock_level": 10,
                "price": 3.50,         # O preço é obrigatório
                "description": "Doces" # Opcional, mas boa prática
            },
            {
                "_id": "64c3f1e9e8b0a1b2c3d4e5f7",
                "name": "Coca-Cola", 
                "category": "Drinks", 
                "stock_level": 50,
                "price": 1.50,
                "description": "Fresca"
            }
        ]

        # Configurar o Mock do MongoDB
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = fake_products
        mock_db.db.products.find.return_value = mock_cursor

        # Executar o pedido
        response = client.get("/products")

        # Verificações
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Pipocas Doces"
        # Agora já podes verificar o preço também, se quiseres
        assert data[0]["price"] == 3.50

    # Teste: Criar Produto como Admin (POST /products)
    @patch("app.routes.db")
    def test_create_product_success(self, mock_db):
        payload = {
            "name": "Novo Chocolate",
            "category": "Doces",
            "price": 2.50,
            "stock_level": 100,
            "description": "Chocolate negro"
        }

        # Simular o insert_one e o find_one subsequente
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = "507f1f77bcf86cd799439011" # Fake ID
        mock_db.db.products.insert_one = AsyncMock(return_value=mock_insert_result)
        
        # O endpoint faz um find_one logo a seguir para devolver o objeto criado
        mock_db.db.products.find_one = AsyncMock(return_value={
            **payload, 
            "_id": "507f1f77bcf86cd799439011",
            "created_at": "2023-01-01"
        })

        response = client.post("/products", json=payload)

        assert response.status_code == 201
        assert response.json()["name"] == "Novo Chocolate"
        # Verificar se o insert foi chamado
        mock_db.db.products.insert_one.assert_called_once()

    # Teste: Atualizar Stock (PATCH /products/{id}/stock)
    @patch("app.routes.db")
    def test_adjust_stock_insufficient(self, mock_db):
        product_id = "507f1f77bcf86cd799439011"
        payload = {"adjustment": -50, "reason": "Erro contagem"}

        # Simular que o produto existe mas só tem 10 unidades
        mock_db.db.products.find_one = AsyncMock(return_value={
            "_id": product_id,
            "stock_level": 10
        })

        response = client.patch(f"/products/{product_id}/stock", json=payload)

        assert response.status_code == 400
        assert "Insufficient stock" in response.json()["detail"]