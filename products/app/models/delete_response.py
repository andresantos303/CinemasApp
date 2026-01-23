from pydantic import BaseModel, Field

class DeleteResponse(BaseModel):
    message: str = Field(..., description="Confirmation message", example="Product deleted successfully")
    id: str = Field(..., description="ID of the deleted resource", example="64fb56a...")