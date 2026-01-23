from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# App Imports
from app.database import db
from app.models import (
    ProductCreate, ProductResponse, ProductUpdate, 
    StockAdjustment, SaleCreate, SaleResponse, DeleteResponse
)
from app.logger import logger
from app.auth import verify_admin

router = APIRouter()

# Definition of common error responses for reuse
ERROR_RESPONSES_ADMIN = {
    401: {"description": "Not authenticated (Missing or invalid token)"},
    403: {"description": "Forbidden access (Admin privileges required)"}
}

ERROR_NOT_FOUND = {
    404: {"description": "Resource not found (Non-existent ID)"}
}

ERROR_BAD_REQUEST = {
    400: {"description": "Invalid request (Incorrect data, invalid ID, or logic error)"},
    409: {"description": "Conflict (Resource already exists)"}
}

# --- PRODUCT MANAGEMENT ---

@router.get(
    "/", 
    response_model=List[ProductResponse],
    tags=["Products"],
    summary="List product catalog",
    responses={
        200: {"description": "Product list retrieved successfully"},
    }
)
async def list_products(
    category: Optional[str] = None,
    in_stock: Optional[bool] = None
):
    """
    Returns the list of registered products.
    
    - **category**: Filter by exact category.
    - **in_stock**: If 'true', returns only products with stock > 0.
    """
    query = {}
    if category:
        query["category"] = category
    if in_stock is not None:
        if in_stock:
            query["stock_level"] = {"$gt": 0}
        else:
            query["stock_level"] = {"$eq": 0}

    logger.info("msg", text="Product listing requested", filter=query)
    
    products = await db.db.products.find(query).to_list(1000)
    return products


@router.post(
    "/", 
    response_model=ProductResponse, 
    status_code=status.HTTP_201_CREATED,
    tags=["Products"],
    summary="Create new product (Admin)",
    responses={
        201: {"description": "Product created successfully"},
        **ERROR_RESPONSES_ADMIN,
        **ERROR_BAD_REQUEST
    }
)
async def create_product(
    product: ProductCreate, 
    admin_id: str = Depends(verify_admin)
):
    """
    Creates a new product in the database.
    Requires administrator privileges.
    Verifies if a product with the same name already exists.
    """
    logger.info("msg", text="Product creation attempt", admin_id=admin_id)

    # Validation: Check if product name already exists
    existing_product = await db.db.products.find_one({"name": product.name})
    if existing_product:
        logger.warn("msg", text="Creation failed: Duplicate name", name=product.name)
        raise HTTPException(
            status_code=409, 
            detail=f"A product with the name '{product.name}' already exists."
        )

    new_product = product.model_dump()
    new_product["created_at"] = datetime.utcnow()
    new_product["updated_at"] = datetime.utcnow()
    
    result = await db.db.products.insert_one(new_product)
    created_product = await db.db.products.find_one({"_id": result.inserted_id})
    
    logger.info("msg", text="Product created successfully", id=str(result.inserted_id))
    return created_product


@router.patch(
    "/{id}", 
    response_model=ProductResponse,
    tags=["Products"],
    summary="Update product (Admin)",
    responses={
        200: {"description": "Product updated successfully"},
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
    Updates specific fields of a product.
    Checks for name duplication if the name is being updated.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    # Filter only fields that were sent (ignore nulls)
    data = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not data:
         raise HTTPException(status_code=400, detail="No valid data provided for update")

    # Validation: If updating name, check if it conflicts with another product
    if "name" in data:
        existing_name = await db.db.products.find_one({
            "name": data["name"], 
            "_id": {"$ne": ObjectId(id)} # Ensure it's not the same product
        })
        if existing_name:
            raise HTTPException(
                status_code=409, 
                detail=f"A product with the name '{data['name']}' already exists."
            )
    
    data["updated_at"] = datetime.utcnow()
    
    result = await db.db.products.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
        
    logger.info("msg", text="Product updated", id=id, admin_id=admin_id)
    return result


@router.delete(
    "/{id}",
    response_model=DeleteResponse,
    status_code=status.HTTP_200_OK,
    tags=["Products"],
    summary="Delete product (Admin)",
    responses={
        200: {"description": "Product deleted successfully"},
        **ERROR_RESPONSES_ADMIN,
        **ERROR_NOT_FOUND,
        **ERROR_BAD_REQUEST
    }
)
async def delete_product(
    id: str,
    admin_id: str = Depends(verify_admin)
):
    """
    Deletes a product from the database.
    Requires administrator privileges.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    # Attempt to delete
    result = await db.db.products.delete_one({"_id": ObjectId(id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    logger.info("msg", text="Product deleted", id=id, admin_id=admin_id)
    return DeleteResponse(message="Product deleted successfully", id=id)


# --- STOCK CONTROL ---

@router.patch(
    "/{id}/stock", 
    response_model=ProductResponse,
    tags=["Stock"],
    summary="Manual stock adjustment (Admin)",
    responses={
        200: {"description": "Stock adjusted successfully"},
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
    Adjusts the stock level.
    Prevents negative stock results.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    # Consistency check to prevent negative stock
    if adjustment.adjustment < 0:
        product = await db.db.products.find_one({"_id": ObjectId(id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        current_stock = product.get("stock_level", 0)
        if current_stock + adjustment.adjustment < 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock. Current: {current_stock}, Adjustment: {adjustment.adjustment}"
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
        raise HTTPException(status_code=404, detail="Product not found")
    
    logger.info(
        "msg", 
        text="Stock adjusted", 
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
    tags=["Sales"],
    summary="Register Sale",
    responses={
        201: {"description": "Sale registered successfully"},
        **ERROR_BAD_REQUEST,
        **ERROR_NOT_FOUND
    }
)
async def register_sale(sale: SaleCreate):
    """
    Registers a sale and reduces stock.
    Verifies if products exist and if there is sufficient stock.
    """
    # 1. Validate Stock and Existence
    for item in sale.items:
        if not ObjectId.is_valid(item.product_id):
             raise HTTPException(status_code=400, detail=f"Invalid product ID: {item.product_id}")
             
        product = await db.db.products.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if product["stock_level"] < item.quantity:
             raise HTTPException(
                 status_code=400, 
                 detail=f"Insufficient stock for '{product['name']}'. Available: {product['stock_level']}"
             )

    # 2. Deduct Stock
    for item in sale.items:
        await db.db.products.update_one(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"stock_level": -item.quantity}}
        )

    # 3. Register Sale
    new_sale = sale.model_dump()
    new_sale["sale_date"] = datetime.utcnow()
    
    result = await db.db.sales.insert_one(new_sale)
    created_sale = await db.db.sales.find_one({"_id": result.inserted_id})
    
    logger.info("msg", text="Sale registered", id=str(result.inserted_id), total=sale.total_amount)
    return created_sale


@router.get(
    "/sales", 
    response_model=List[SaleResponse],
    tags=["Sales"],
    summary="Sales Report (Admin)",
    responses={
        200: {"description": "Sales history retrieved"},
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
    Queries the sales history with filters.
    Exclusive for administrators.
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

    logger.info("msg", text="Sales report requested by admin", admin_id=admin_id)
    sales = await db.db.sales.find(query).to_list(1000)
    return sales