from datetime import datetime
from typing import Optional, Annotated
from pydantic import Field, BeforeValidator
from app.models import ProductBase

# Helper para lidar com ObjectId do MongoDB
PyObjectId = Annotated[str, BeforeValidator(str)]

class ProductResponse(ProductBase):
    id: PyObjectId = Field(alias="_id")
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True