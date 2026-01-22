from pydantic import BaseModel
from typing import Optional

class ProductUpdate(BaseModel):
    price: Optional[float] = None
    description: Optional[str] = None