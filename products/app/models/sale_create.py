from pydantic import BaseModel
from typing import Optional, List
from app.models import SaleItem

class SaleCreate(BaseModel):
    items: List[SaleItem]
    total_amount: float
    user_id: Optional[str] = "anonymous" # Quem fez a venda (vendedor)
