from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

# Imports da aplicação
from app.database import db
from app.models import (
    ProductCreate, ProductResponse, ProductUpdate, 
    StockAdjustment, SaleCreate, SaleResponse
)
from app.logger import logger
from app.auth import verify_admin

router = APIRouter()

# Definição de respostas de erro comuns para reutilização
# Isto evita repetição de código nos decoradores
ERROR_RESPONSES_ADMIN = {
    401: {"description": "Não autenticado (Token em falta ou inválido)"},
    403: {"description": "Acesso proibido (Requer privilégios de Administrador)"}
}

ERROR_NOT_FOUND = {
    404: {"description": "Recurso não encontrado (ID inexistente)"}
}

ERROR_BAD_REQUEST = {
    400: {"description": "Pedido inválido (Dados incorretos, ID inválido ou erro de lógica)"}
}

# --- PRODUCT MANAGEMENT ---

@router.get(
    "/products", 
    response_model=List[ProductResponse],
    tags=["Produtos"],
    summary="Listar catálogo de produtos",
    responses={
        200: {"description": "Lista de produtos recuperada com sucesso"},
    }
)
async def list_products(
    category: Optional[str] = None,
    in_stock: Optional[bool] = None
):
    """
    Retorna a lista de produtos registados.
    
    - **category**: Filtra por categoria exata.
    - **in_stock**: Se 'true', retorna apenas produtos com stock > 0.
    """
    query = {}
    if category:
        query["category"] = category
    if in_stock is not None:
        if in_stock:
            query["stock_level"] = {"$gt": 0}
        else:
            query["stock_level"] = {"$eq": 0}

    logger.info("msg", text="Listagem de produtos solicitada", filter=query)
    
    products = await db.db.products.find(query).to_list(1000)
    return products


@router.post(
    "/products", 
    response_model=ProductResponse, 
    status_code=status.HTTP_201_CREATED,
    tags=["Produtos"],
    summary="Criar novo produto (Admin)",
    responses={
        201: {"description": "Produto criado com sucesso"},
        **ERROR_RESPONSES_ADMIN,
        **ERROR_BAD_REQUEST
    }
)
async def create_product(
    product: ProductCreate, 
    admin_id: str = Depends(verify_admin)
):
    """
    Cria um novo produto na base de dados.
    Requer privilégios de administrador.
    """
    logger.info("msg", text="Tentativa de criação de produto", admin_id=admin_id)

    new_product = product.model_dump()
    new_product["created_at"] = datetime.utcnow()
    new_product["updated_at"] = datetime.utcnow()
    
    result = await db.db.products.insert_one(new_product)
    created_product = await db.db.products.find_one({"_id": result.inserted_id})
    
    logger.info("msg", text="Produto criado com sucesso", id=str(result.inserted_id))
    return created_product


@router.patch(
    "/products/{id}", 
    response_model=ProductResponse,
    tags=["Produtos"],
    summary="Atualizar produto (Admin)",
    responses={
        200: {"description": "Produto atualizado com sucesso"},
        **ERROR_RESPONSES_ADMIN,
        **ERROR_NOT_FOUND,
        **ERROR_BAD_REQUEST
    }
)
async def update_product(
    id: str, 
    update_data: ProductUpdate,
    admin_id: str = Depends(verify_admin)
):
    """
    Atualiza campos específicos de um produto.
    
    - **400**: Se o ID for inválido ou se nenhum dado for enviado.
    - **404**: Se o produto não existir.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID de produto inválido")
    
    # Filtra apenas campos que foram enviados (ignora os nulls)
    data = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not data:
         raise HTTPException(status_code=400, detail="Apenas é possível atualizar o preço ou descrição")
    
    data["updated_at"] = datetime.utcnow()
    
    result = await db.db.products.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
        
    logger.info("msg", text="Produto atualizado", id=id, admin_id=admin_id)
    return result

# --- STOCK CONTROL ---

@router.patch(
    "/products/{id}/stock", 
    response_model=ProductResponse,
    tags=["Stock"],
    summary="Ajustar stock manual (Admin)",
    responses={
        200: {"description": "Stock ajustado com sucesso"},
        **ERROR_RESPONSES_ADMIN,
        **ERROR_NOT_FOUND,
        **ERROR_BAD_REQUEST
    }
)
async def adjust_stock(
    id: str, 
    adjustment: StockAdjustment,
    admin_id: str = Depends(verify_admin)
):
    """
    Ajusta o nível de stock.
    
    - **400**: Se o ajuste resultar em stock negativo.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID de produto inválido")

    # Verificação de consistência para evitar stock negativo
    if adjustment.adjustment < 0:
        product = await db.db.products.find_one({"_id": ObjectId(id)})
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        current_stock = product.get("stock_level", 0)
        if current_stock + adjustment.adjustment < 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Stock insuficiente. Atual: {current_stock}, Ajuste: {adjustment.adjustment}"
            )

    result = await db.db.products.find_one_and_update(
        {"_id": ObjectId(id)},
        {
            "$inc": {"stock_level": adjustment.adjustment},
            "$set": {"updated_at": datetime.utcnow()}
        },
        return_document=True
    )

    if not result:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    logger.info(
        "msg", 
        text="Stock ajustado", 
        id=id, 
        adjustment=adjustment.adjustment, 
        reason=adjustment.reason, 
        admin_id=admin_id
    )
    return result

# --- POS AND SALES ---

@router.post(
    "/sales", 
    response_model=SaleResponse, 
    status_code=status.HTTP_201_CREATED,
    tags=["Vendas"],
    summary="Registar Venda",
    responses={
        201: {"description": "Venda registada com sucesso"},
        **ERROR_BAD_REQUEST,
        **ERROR_NOT_FOUND
    }
)
async def register_sale(sale: SaleCreate):
    """
    Regista uma venda e abate o stock.
    
    - **400**: Se o stock for insuficiente para algum item.
    - **404**: Se algum produto na lista não existir.
    """
    # 1. Validar Stock e Existência
    for item in sale.items:
        if not ObjectId.is_valid(item.product_id):
             raise HTTPException(status_code=400, detail=f"ID de produto inválido: {item.product_id}")
             
        product = await db.db.products.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail=f"Produto {item.product_id} não encontrado")
        
        if product["stock_level"] < item.quantity:
             raise HTTPException(
                 status_code=400, 
                 detail=f"Stock insuficiente para '{product['name']}'. Disponível: {product['stock_level']}"
             )

    # 2. Deduzir Stock
    for item in sale.items:
        await db.db.products.update_one(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"stock_level": -item.quantity}}
        )

    # 3. Registar Venda
    new_sale = sale.model_dump()
    new_sale["sale_date"] = datetime.utcnow()
    
    result = await db.db.sales.insert_one(new_sale)
    created_sale = await db.db.sales.find_one({"_id": result.inserted_id})
    
    logger.info("msg", text="Venda registada", id=str(result.inserted_id), total=sale.total_amount)
    return created_sale


@router.get(
    "/sales", 
    response_model=List[SaleResponse],
    tags=["Vendas"],
    summary="Relatório de Vendas (Admin)",
    responses={
        200: {"description": "Histórico de vendas recuperado"},
        **ERROR_RESPONSES_ADMIN
    }
)
async def get_sales_history(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[str] = None,
    admin_id: str = Depends(verify_admin)
):
    """
    Consulta o histórico de vendas com filtros.
    Exclusivo para administradores.
    """
    query = {}
    
    if start_date or end_date:
        query["sale_date"] = {}
        if start_date:
            query["sale_date"]["$gte"] = start_date
        if end_date:
            query["sale_date"]["$lte"] = end_date
            
    if user_id:
        query["user_id"] = user_id

    logger.info("msg", text="Relatório de vendas solicitado pelo admin", admin_id=admin_id)
    sales = await db.db.sales.find(query).to_list(1000)
    return sales