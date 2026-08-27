from datetime import datetime
from typing import Optional, Annotated
from pydantic import Field, BeforeValidator, ConfigDict
from app.models import ProductBase

# Helper to handle MongoDB ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class ProductResponse(ProductBase):
    id: PyObjectId = Field(alias="_id")
    updated_at: Optional[datetime] = None
    
    # Updated configuration syntax for Pydantic V2
    model_config = ConfigDict(populate_by_name=True)