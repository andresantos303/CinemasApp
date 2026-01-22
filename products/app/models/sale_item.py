from pydantic import BaseModel, Field

class SaleItem(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)