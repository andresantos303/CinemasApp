from app.models import SaleCreate
from pydantic import Field, BeforeValidator
from typing import Annotated
from datetime import datetime

# Helper para lidar com ObjectId do MongoDB
PyObjectId = Annotated[str, BeforeValidator(str)]

class SaleResponse(SaleCreate):
    id: PyObjectId = Field(alias="_id")
    sale_date: datetime
