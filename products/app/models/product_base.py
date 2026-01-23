from pydantic import BaseModel, Field
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    stock_level: int = Field(..., ge=0)
    category: str
    description: Optional[str] = None